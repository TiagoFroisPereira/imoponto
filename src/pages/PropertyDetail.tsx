import { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { type DocumentationLevel, DocumentationDot } from "@/components/property/DocumentationStatus";
import { type TimeSlot } from "@/components/property/VisitScheduler";
import { usePropertyById } from "@/hooks/usePublicProperties";
import { useVisitAvailability } from "@/hooks/useVisitAvailability";
import { usePropertyTracking } from "@/hooks/usePropertyTracking";
import { useFavorites } from "@/hooks/useFavorites";
import { useAuth } from "@/hooks/useAuth";
import { LocationPriceInfo } from "@/components/property/LocationPriceInfo";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, MapPin, Loader2, Shield } from "lucide-react";

import { PropertyImageGallery } from "@/components/property/details/PropertyImageGallery";
import { PropertyQuickStats } from "@/components/property/details/PropertyQuickStats";
import { PropertyVaultSection } from "@/components/property/details/PropertyVaultSection";
import { PropertyOwnerBanner } from "@/components/property/details/PropertyOwnerBanner";
import { PropertyContactCard } from "@/components/property/details/PropertyContactCard";
import { PropertyStatsCard } from "@/components/property/details/PropertyStatsCard";
import { PropertyDialogs } from "@/components/property/details/PropertyDialogs";
import { RequestBuyerAccessDialog } from "@/components/property/RequestBuyerAccessDialog";
import { PropertyVault } from "@/components/property/vault/PropertyVault";
interface PropertyDocument {
  id: string;
  name: string;
  file_type: string;
  is_public: boolean;
  category?: string;
}

interface SelectedDocumentRequest {
  documentId: string | null;
  documentName: string;
}

export default function PropertyDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { property, loading, error, refetch } = usePropertyById(id);
  const { availableDays } = useVisitAvailability(id);
  const { trackView, trackShare } = usePropertyTracking();
  const { isFavorite, toggleFavorite, isAuthenticated } = useFavorites();
  const { user } = useAuth();
  const { toast } = useToast();

  const [selectedImage, setSelectedImage] = useState(0);
  const [showProfessionalDialog, setShowProfessionalDialog] = useState(false);
  const [showBookVisitDialog, setShowBookVisitDialog] = useState(false);
  const [showSchedulerDialog, setShowSchedulerDialog] = useState(false);
  const [showMessageDialog, setShowMessageDialog] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [selectedVisitDate, setSelectedVisitDate] = useState<Date | null>(null);
  const [selectedVisitSlot, setSelectedVisitSlot] = useState<TimeSlot | null>(null);
  const [allDocuments, setAllDocuments] = useState<PropertyDocument[]>([]);
  const [selectedDocRequest, setSelectedDocRequest] = useState<SelectedDocumentRequest | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [showBuyerAccessDialog, setShowBuyerAccessDialog] = useState(false);
  const viewTracked = useRef(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user: authUser } }) => {
      if (authUser && property && authUser.id === property.user_id) {
        setIsOwner(true);
      }
    });
  }, [property]);

  // Check if current user has paid buyer access to vault
  const { data: hasBuyerVaultAccess } = useQuery({
    queryKey: ['buyer-vault-access-detail', id, user?.id],
    queryFn: async () => {
      if (!user || !id) return false;
      const { data } = await supabase
        .from('vault_buyer_access')
        .select('id')
        .eq('property_id', id)
        .eq('buyer_id', user.id)
        .eq('status', 'paid')
        .maybeSingle();
      return !!data;
    },
    enabled: !!user && !!id && !isOwner,
  });

  // Check if seller has visit scheduling (Start or Pro plan)
  const { data: sellerProfile } = useQuery({
    queryKey: ['seller-plan', property?.user_id],
    queryFn: async () => {
      if (!property?.user_id) return null;
      const { data } = await supabase
        .from('profiles')
        .select('plan')
        .eq('id', property.user_id)
        .maybeSingle();
      return data;
    },
    enabled: !!property?.user_id && !isOwner,
  });

  const sellerPlan = (sellerProfile?.plan || 'free') as string;
  const sellerHasVisitScheduling = sellerPlan === 'start' || sellerPlan === 'pro';

  useEffect(() => {
    if (property?.id && !viewTracked.current) {
      viewTracked.current = true;
      trackView(property.id);
    }
  }, [property?.id, trackView]);

  useEffect(() => {
    const fetchDocuments = async () => {
      if (!property?.id) return;
      const { data: allDocs } = await supabase
        .from("vault_documents")
        .select("id, name, file_type, is_public")
        .eq("property_id", property.id);
      if (allDocs) setAllDocuments(allDocs);
    };
    fetchDocuments();
  }, [property?.id]);

  const handleRequestDocumentAccess = (documentId: string | null, documentName: string) => {
    setSelectedDocRequest({ documentId, documentName });
    setShowProfessionalDialog(true);
  };

  if (loading) {
    return (
      <div className="bg-background">
        <main className="container mx-auto px-4 py-20">
          <div className="flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        </main>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="bg-background">
        <main className="container mx-auto px-4 py-20">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">Imóvel não encontrado</h1>
            <Link to="/imoveis">
              <Button>Voltar à pesquisa</Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const images =
    property.images?.length > 0
      ? property.images
      : property.image_url
        ? [property.image_url]
        : ["https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200"];

  const formatPrice = (price: number) => `€ ${price.toLocaleString("pt-PT")}`;

  const vaultDocumentIds = selectedDocRequest?.documentId
    ? [selectedDocRequest.documentId]
    : allDocuments.map((doc) => doc.id);

  const handleShare = async () => {
    if (!id) return;
    try {
      await navigator.clipboard.writeText(window.location.href);
      await trackShare(id);
      toast({ title: "Link copiado!", description: "O link do imóvel foi copiado para a área de transferência." });
    } catch {
      toast({ title: "Erro", description: "Não foi possível copiar o link.", variant: "destructive" });
    }
  };

  const handleToggleFavorite = async () => {
    if (!id) return;
    if (!isAuthenticated) { setIsAuthOpen(true); return; }
    await toggleFavorite(id);
  };

  return (
    <div className="bg-background">

      <main className="container mx-auto px-4 pt-8 md:pt-12 pb-8">
        {sessionStorage.getItem("fromImoveis") === "true" && (
          <button
            onClick={() => { sessionStorage.removeItem("fromImoveis"); window.history.back(); }}
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar à lista
          </button>
        )}

        {isOwner && (
          <div className="lg:hidden">
            <PropertyOwnerBanner
              wizardStep={property.wizard_step || 0}
              onManageProcess={() => navigate(`/imovel/${id}/gestao`)}
            />
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <PropertyImageGallery
              images={images}
              selectedImage={selectedImage}
              onSelectImage={setSelectedImage}
              documentationLevel={property.documentation_level as DocumentationLevel}
              isFavorite={!!id && isFavorite(id)}
              isAuthenticated={isAuthenticated}
              onToggleFavorite={handleToggleFavorite}
              onShare={handleShare}
            />

            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">{property.title}</h1>
                  <DocumentationDot level={property.documentation_level as DocumentationLevel} />
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span>{property.location}</span>
                </div>
                <LocationPriceInfo location={property.location} price={property.price} area={property.area} />
              </div>

              <p className="text-lg font-bold text-primary">{formatPrice(property.price)}</p>

              <PropertyQuickStats
                bedrooms={property.bedrooms}
                bathrooms={property.bathrooms}
                area={property.area}
                floor={property.floor}
                energyCertification={property.energy_certification}
                parking={property.parking}
                hasGarden={property.has_garden}
              />

              {property.description && (
                <div>
                  <h2 className="text-xl font-semibold text-foreground mb-3">Descrição</h2>
                  <p className="text-muted-foreground leading-relaxed">{property.description}</p>
                </div>
              )}

              {property.features && property.features.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold text-foreground mb-3">Características</h2>
                  <div className="flex flex-wrap gap-2">
                    {property.features.map((feature: string, index: number) => (
                      <Badge key={index} variant="secondary">{feature}</Badge>
                    ))}
                  </div>
                </div>
              )}
              {!isOwner && hasBuyerVaultAccess ? (
                <PropertyVault
                  propertyId={property.id}
                  propertyTitle={property.title}
                />
              ) : !isOwner ? (
                <PropertyVaultSection
                  allDocuments={allDocuments}
                  documentationLevel={property.documentation_level as DocumentationLevel}
                  onRequestAccess={handleRequestDocumentAccess}
                  onRequestBuyerAccess={() => {
                    if (!isAuthenticated) { setIsAuthOpen(true); return; }
                    setShowBuyerAccessDialog(true);
                  }}
                  isOwner={isOwner}
                />
              ) : null}
            </div>
          </div>

          <div className="space-y-6">
            {isOwner && (
              <>
                <div className="hidden lg:block">
                  <PropertyOwnerBanner
                    wizardStep={property.wizard_step || 0}
                    onManageProcess={() => navigate(`/imovel/${id}/gestao`)}
                  />
                </div>
                <PropertyStatsCard
                  viewsCount={property.views_count}
                  favoritesCount={property.favorites_count}
                  sharesCount={property.shares_count}
                  inquiriesCount={property.inquiries_count}
                />

                <div className="bg-muted/50 rounded-xl p-6 space-y-4 border border-border/50">
                  <div className="flex items-center gap-3">
                    <Shield className="w-6 h-6 text-primary" />
                    <h3 className="font-semibold text-foreground">Gestão de Documentos</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Aceda ao cofre digital do seu imóvel para gerir todos os documentos necessários para a venda.
                  </p>
                  <Button
                    className="w-full"
                    variant="outline"
                    onClick={() => navigate(`/imovel/${id}/documentos`)}
                  >
                    Abrir Cofre Digital
                  </Button>
                </div>
              </>
            )}

            {!isOwner && (
              <PropertyContactCard
                price={property.price}
                propertyId={property.id}
                yearBuilt={property.year_built}
                isAuthenticated={isAuthenticated}
                hasAvailableSlots={availableDays.length > 0}
                sellerHasVisitScheduling={sellerHasVisitScheduling}
                onSendMessage={() => setShowMessageDialog(true)}
                onBookVisit={() => {
                  setSelectedVisitDate(null);
                  setSelectedVisitSlot(null);
                  setShowBookVisitDialog(true);
                }}
                onRequestVisitSlot={() => setShowSchedulerDialog(true)}
                onAuthRequired={() => setIsAuthOpen(true)}
              />
            )}
          </div>
        </div>
      </main>

      

      <PropertyDialogs
        propertyId={property.id}
        propertyTitle={property.title}
        sellerId={property.user_id}
        propertyStatus={property.status}
        propertyPrice={property.price}
        wizardStep={property.wizard_step || 0}
        isOwner={isOwner}
        vaultDocumentIds={vaultDocumentIds}
        requestedDocumentName={selectedDocRequest?.documentName}
        availableDays={availableDays}
        showProfessionalDialog={showProfessionalDialog}
        onProfessionalDialogChange={(open) => {
          setShowProfessionalDialog(open);
          if (!open) setSelectedDocRequest(null);
        }}
        showBookVisitDialog={showBookVisitDialog}
        onBookVisitDialogChange={setShowBookVisitDialog}
        selectedVisitDate={selectedVisitDate}
        selectedVisitSlot={selectedVisitSlot}
        showMessageDialog={showMessageDialog}
        onMessageDialogChange={setShowMessageDialog}
        showSchedulerDialog={showSchedulerDialog}
        onSchedulerDialogChange={setShowSchedulerDialog}
        onBookSlot={(date, slot) => {
          setShowSchedulerDialog(false);
          setSelectedVisitDate(date);
          setSelectedVisitSlot(slot);
          setShowBookVisitDialog(true);
        }}
        isAuthOpen={isAuthOpen}
        onAuthOpenChange={setIsAuthOpen}
      />

      <RequestBuyerAccessDialog
        open={showBuyerAccessDialog}
        onOpenChange={setShowBuyerAccessDialog}
        propertyId={property.id}
        propertyTitle={property.title}
        ownerId={property.user_id}
      />
    </div>
  );
}
