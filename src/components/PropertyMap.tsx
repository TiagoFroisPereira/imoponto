import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MapPin, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Property {
  id: string;
  title: string;
  location: string;
  price: number;
  lat?: number;
  lng?: number;
  image_url?: string;
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
}

interface PropertyMapProps {
  properties: Property[];
  onPropertyClick?: (propertyId: string) => void;
  className?: string;
}

// Map location names to approximate coordinates
const locationCoordinates: Record<string, { lat: number; lng: number }> = {
  'Lisboa': { lat: 38.7223, lng: -9.1393 },
  'Porto': { lat: 41.1579, lng: -8.6291 },
  'Braga': { lat: 41.5518, lng: -8.4229 },
  'Coimbra': { lat: 40.2033, lng: -8.4103 },
  'Faro': { lat: 37.0194, lng: -7.9322 },
  'Setúbal': { lat: 38.5244, lng: -8.8882 },
  'Aveiro': { lat: 40.6405, lng: -8.6538 },
  'Évora': { lat: 38.5667, lng: -7.9000 },
  'Leiria': { lat: 39.7436, lng: -8.8069 },
  'Santarém': { lat: 39.2369, lng: -8.6850 },
  'Viseu': { lat: 40.6566, lng: -7.9125 },
  'Guarda': { lat: 40.5364, lng: -7.2683 },
  'Beja': { lat: 38.0150, lng: -7.8633 },
  'Portalegre': { lat: 39.2969, lng: -7.4281 },
  'Bragança': { lat: 41.8061, lng: -6.7567 },
  'Vila Real': { lat: 41.2959, lng: -7.7444 },
  'Viana do Castelo': { lat: 41.6918, lng: -8.8344 },
  'Castelo Branco': { lat: 39.8228, lng: -7.4931 },
  'Funchal': { lat: 32.6669, lng: -16.9241 },
  'Ponta Delgada': { lat: 37.7412, lng: -25.6756 },
  'Matosinhos': { lat: 41.1819, lng: -8.6919 },
  'Cascais': { lat: 38.6969, lng: -9.4219 },
  'Sintra': { lat: 38.8019, lng: -9.3819 },
  'Almada': { lat: 38.6769, lng: -9.1569 },
  'Oeiras': { lat: 38.6919, lng: -9.3119 },
  'Loures': { lat: 38.8319, lng: -9.1669 },
  'Amadora': { lat: 38.7569, lng: -9.2319 },
  'Odivelas': { lat: 38.7919, lng: -9.1819 },
  'Vila Nova de Gaia': { lat: 41.1269, lng: -8.6119 },
  'Maia': { lat: 41.2369, lng: -8.6219 },
  'Gondomar': { lat: 41.1469, lng: -8.5319 },
  'Guimarães': { lat: 41.4425, lng: -8.2918 },
  'Albufeira': { lat: 37.0869, lng: -8.2519 },
  'Portimão': { lat: 37.1386, lng: -8.5369 },
  'Lagos': { lat: 37.1019, lng: -8.6719 },
  'Loulé': { lat: 37.1419, lng: -8.0219 },
  'Tavira': { lat: 37.1269, lng: -7.6519 },
};

const getPropertyCoordinates = (property: Property): { lat: number; lng: number } | null => {
  if (property.lat && property.lng) {
    return { lat: property.lat, lng: property.lng };
  }
  
  // Try to find coordinates based on location name
  const location = property.location;
  if (locationCoordinates[location]) {
    // Add some randomness to avoid overlapping markers
    const jitter = () => (Math.random() - 0.5) * 0.02;
    return {
      lat: locationCoordinates[location].lat + jitter(),
      lng: locationCoordinates[location].lng + jitter(),
    };
  }
  
  // Check if location contains any known city
  for (const [city, coords] of Object.entries(locationCoordinates)) {
    if (location.toLowerCase().includes(city.toLowerCase())) {
      const jitter = () => (Math.random() - 0.5) * 0.02;
      return {
        lat: coords.lat + jitter(),
        lng: coords.lng + jitter(),
      };
    }
  }
  
  return null;
};

const formatPrice = (price: number): string => {
  return `€ ${price.toLocaleString('pt-PT')}`;
};

const PropertyMap = ({ properties, onPropertyClick, className = '' }: PropertyMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [mapError, setMapError] = useState<string | null>(null);
  const [mapToken, setMapToken] = useState<string | null>(null);

  // Fetch mapbox token from edge function
  useEffect(() => {
    const fetchToken = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('get-mapbox-token');
        
        if (error) {
          console.error('Error fetching mapbox token:', error);
          setMapError('Erro ao carregar configuração do mapa');
          setIsLoading(false);
          return;
        }
        
        if (data?.token) {
          setMapToken(data.token);
        } else {
          setMapError('Token do Mapbox não configurado');
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Failed to fetch mapbox token:', err);
        setMapError('Erro ao carregar mapa');
        setIsLoading(false);
      }
    };
    
    fetchToken();
  }, []);

  // Initialize map when token is available
  useEffect(() => {
    if (!mapContainer.current || !mapToken) return;

    try {
      mapboxgl.accessToken = mapToken;

      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/light-v11',
        center: [-8.2245, 39.3999], // Center of Portugal
        zoom: 6,
        pitch: 0,
      });

      map.current.addControl(
        new mapboxgl.NavigationControl({
          visualizePitch: true,
        }),
        'top-right'
      );

      map.current.addControl(
        new mapboxgl.FullscreenControl(),
        'top-right'
      );

      map.current.on('load', () => {
        setIsLoading(false);
      });

      map.current.on('error', (e) => {
        console.error('Map error:', e);
        setMapError('Erro ao carregar o mapa');
        setIsLoading(false);
      });

    } catch (error) {
      console.error('Failed to initialize map:', error);
      setMapError('Erro ao inicializar o mapa');
      setIsLoading(false);
    }

    return () => {
      markersRef.current.forEach(marker => marker.remove());
      map.current?.remove();
    };
  }, [mapToken]);

  // Add markers when properties change
  useEffect(() => {
    if (!map.current || isLoading) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Add new markers
    const bounds = new mapboxgl.LngLatBounds();
    let hasValidMarkers = false;

    properties.forEach((property) => {
      const coords = getPropertyCoordinates(property);
      if (!coords) return;

      hasValidMarkers = true;
      bounds.extend([coords.lng, coords.lat]);

      // Create custom marker element
      const el = document.createElement('div');
      el.className = 'property-marker';
      el.innerHTML = `
        <div style="
          background: linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)));
          color: white;
          padding: 6px 10px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
          cursor: pointer;
          white-space: nowrap;
          transition: transform 0.2s, box-shadow 0.2s;
        ">
          ${formatPrice(property.price)}
        </div>
      `;

      el.addEventListener('mouseenter', () => {
        el.style.transform = 'scale(1.1)';
        el.style.zIndex = '100';
      });

      el.addEventListener('mouseleave', () => {
        el.style.transform = 'scale(1)';
        el.style.zIndex = '1';
      });

      // Create popup
      const popup = new mapboxgl.Popup({
        offset: 25,
        closeButton: true,
        closeOnClick: false,
        maxWidth: '280px',
      }).setHTML(`
        <div style="padding: 8px;">
          <img 
            src="${property.image_url || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=300&h=200&fit=crop'}" 
            alt="${property.title}"
            style="width: 100%; height: 120px; object-fit: cover; border-radius: 8px; margin-bottom: 8px;"
          />
          <h3 style="font-weight: 600; font-size: 14px; margin-bottom: 4px; color: hsl(var(--foreground));">
            ${property.title}
          </h3>
          <p style="font-size: 12px; color: hsl(var(--muted-foreground)); margin-bottom: 8px;">
            📍 ${property.location}
          </p>
          <div style="display: flex; gap: 12px; font-size: 11px; color: hsl(var(--muted-foreground)); margin-bottom: 8px;">
            ${property.bedrooms ? `<span>🛏️ ${property.bedrooms} quartos</span>` : ''}
            ${property.bathrooms ? `<span>🚿 ${property.bathrooms} WC</span>` : ''}
            ${property.area ? `<span>📐 ${property.area}m²</span>` : ''}
          </div>
          <p style="font-weight: 700; font-size: 16px; color: hsl(var(--primary));">
            ${formatPrice(property.price)}
          </p>
          <a 
            href="/imovel/${property.id}" 
            style="
              display: block;
              text-align: center;
              background: hsl(var(--primary));
              color: hsl(var(--primary-foreground));
              padding: 8px 16px;
              border-radius: 6px;
              text-decoration: none;
              font-size: 12px;
              font-weight: 500;
              margin-top: 8px;
            "
          >
            Ver Detalhes
          </a>
        </div>
      `);

      const marker = new mapboxgl.Marker(el)
        .setLngLat([coords.lng, coords.lat])
        .setPopup(popup)
        .addTo(map.current!);

      if (onPropertyClick) {
        el.addEventListener('click', () => onPropertyClick(property.id));
      }

      markersRef.current.push(marker);
    });

    // Fit map to markers
    if (hasValidMarkers && markersRef.current.length > 0) {
      map.current.fitBounds(bounds, {
        padding: 50,
        maxZoom: 12,
      });
    }
  }, [properties, isLoading, onPropertyClick]);

  if (mapError) {
    return (
      <div className={`bg-muted rounded-xl flex items-center justify-center ${className}`}>
        <div className="text-center text-muted-foreground p-8">
          <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>{mapError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative rounded-xl overflow-hidden ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-muted flex items-center justify-center z-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}
      <div ref={mapContainer} className="w-full h-full" />
    </div>
  );
};

export default PropertyMap;
