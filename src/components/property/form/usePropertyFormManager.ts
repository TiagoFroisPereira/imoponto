import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useProperties } from "@/hooks/useProperties";
import { supabase } from "@/integrations/supabase/client";
import { parseISO } from "date-fns";
import type { AvailableDay } from "@/components/property/VisitScheduler";
import type { UploadedImage } from "./propertyFormConstants";
import { defaultTimeSlots } from "./propertyFormConstants";
import { getAllConcelhos } from "@/data/portugalLocations";

export function usePropertyFormManager(mode: 'create' | 'edit' | 'publish', propertyId?: string) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { createProperty, updateProperty } = useProperties();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [step, setStep] = useState(1);
  const [transactionType, setTransactionType] = useState("sell");
  const [propertyType, setPropertyType] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [address, setAddress] = useState("");
  const [distrito, setDistrito] = useState("");
  const [concelho, setConcelho] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [area, setArea] = useState("");
  const [grossArea, setGrossArea] = useState("");
  const [bedrooms, setBedrooms] = useState("");
  const [bathrooms, setBathrooms] = useState("");
  const [virtualTourUrl, setVirtualTourUrl] = useState("");
  const [floor, setFloor] = useState("");
  const [yearBuilt, setYearBuilt] = useState("");
  const [energyCert, setEnergyCert] = useState("");
  const [condition, setCondition] = useState("");
  const [status, setStatus] = useState("active");

  // Features
  const [hasGarage, setHasGarage] = useState(false);
  const [hasGarden, setHasGarden] = useState(false);
  const [hasPool, setHasPool] = useState(false);
  const [hasElevator, setHasElevator] = useState(false);
  const [hasAC, setHasAC] = useState(false);
  const [hasCentralHeating, setHasCentralHeating] = useState(false);
  const [petsAllowed, setPetsAllowed] = useState(false);

  // Media
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [videos, setVideos] = useState<any[]>([]);

  // Visit Availability
  const [availableDays, setAvailableDays] = useState<AvailableDay[]>([]);

  // Terms and Plans states
  const [acceptedTerms, setAcceptedTerms] = useState(mode === 'edit');
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(mode === 'edit');
  const [showLegalModal, setShowLegalModal] = useState(false);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [planModalTitle, setPlanModalTitle] = useState("");
  const [planModalDesc, setPlanModalDesc] = useState("");

  const [isLoadingPostalCode, setIsLoadingPostalCode] = useState(false);

  // Fetch property data
  const { isLoading: loading, data: propertyData } = useQuery({
    queryKey: ['property-form-data', propertyId],
    queryFn: async () => {
      if (mode === 'create' || !propertyId) return null;

      const { data: property, error } = await (supabase
        .from('properties') as any)
        .select('*')
        .eq('id', propertyId)
        .single();

      if (error || !property) {
        toast({ title: "Erro", description: "Imóvel não encontrado.", variant: "destructive" });
        navigate('/meus-imoveis');
        return null;
      }

      const { data: availability } = await (supabase
        .from('visit_availability') as any)
        .select('*')
        .eq('property_id', propertyId)
        .order('available_date', { ascending: true });

      return { property, availability };
    },
    enabled: mode !== 'create' && !!propertyId,
    staleTime: 0,
    gcTime: 0,
  });

  const [isDataLoaded, setIsDataLoaded] = useState(false);

  useEffect(() => {
    if (propertyData && !isDataLoaded) {
      const { property, availability } = propertyData as any;
      setTransactionType(property.transaction_type || 'sell');
      setPropertyType(property.property_type || '');
      setTitle(property.title || '');
      setDescription(property.description || '');
      setVirtualTourUrl(property.virtual_tour_url || '');
      setPrice(property.price?.toString() || '');
      setAddress(property.address || '');
      if (property.location) {
        const parts = property.location.split(",").map((s: string) => s.trim());
        if (parts.length >= 2) {
          setDistrito(parts[0]);
          setConcelho(parts[1]);
        } else {
          // Fallback: if only one part, it's likely the concelho
          const concName = parts[0];
          setConcelho(concName);
          // Try to find the distrito from our data
          const allConcs = getAllConcelhos();
          const match = allConcs.find(c => c.name.toLowerCase() === concName.toLowerCase());
          if (match) {
            setDistrito(match.distrito);
          }
        }
      }
      setPostalCode(property.postal_code || '');
      setArea(property.area?.toString() || '');
      setGrossArea(property.gross_area?.toString() || '');
      setBedrooms(property.bedrooms?.toString() || '');
      setBathrooms(property.bathrooms?.toString() || '');
      setFloor(property.floor || '');
      setYearBuilt(property.year_built?.toString() || '');
      setEnergyCert(property.energy_certification || '');
      setCondition(property.condition || '');
      setStatus(property.status || 'active');
      setHasGarage(property.has_garage || false);
      setHasGarden(property.has_garden || false);
      setHasPool(property.has_pool || false);
      setHasElevator(property.has_elevator || false);
      setHasAC(property.has_ac || false);
      setHasCentralHeating(property.has_central_heating || false);
      setPetsAllowed(property.pets_allowed || false);

      if (property.images && property.images.length > 0) {
        const loadedImages = property.images.map((url: string, index: number) => ({
          id: `existing-${index}`,
          name: `Image ${index + 1}`,
          preview: url,
          isMain: url === property.image_url
        }));
        if (!loadedImages.some((img: UploadedImage) => img.isMain) && loadedImages.length > 0) {
          loadedImages[0].isMain = true;
        }
        setImages(loadedImages);
      }

      if (availability && availability.length > 0) {
        const days: AvailableDay[] = availability.map((avail: any) => ({
          date: parseISO(avail.available_date),
          slots: defaultTimeSlots.map((time: string) => ({
            id: `${avail.available_date}-${time}`,
            time,
            isAvailable: (avail.time_slots as string[]).includes(time)
          }))
        }));
        setAvailableDays(days);
      }

      if (property.wizard_step) {
        setStep(property.wizard_step);
      }
      setIsDataLoaded(true);
    }
  }, [propertyData, isDataLoaded]);

  const handlePostalCodeChange = (value: string) => {
    const formatted = value.replace(/\D/g, "");
    if (formatted.length <= 4) {
      setPostalCode(formatted);
    } else {
      setPostalCode(`${formatted.slice(0, 4)}-${formatted.slice(4, 7)}`);
    }

    if (formatted.length === 7) {
      setIsLoadingPostalCode(true);
      setTimeout(() => {
        if (formatted.startsWith("1000")) { setDistrito("Lisboa"); setConcelho("Lisboa"); }
        else if (formatted.startsWith("4000")) { setDistrito("Porto"); setConcelho("Porto"); }
        else if (formatted.startsWith("4450")) { setDistrito("Porto"); setConcelho("Matosinhos"); }
        else { setDistrito("Lisboa"); setConcelho("Lisboa"); }
        setIsLoadingPostalCode(false);
      }, 800);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, photosLimit: number, openPlanModal: (title: string, desc: string) => void) => {
    const files = e.target.files;
    if (!files) return;

    if (images.length + Array.from(files).length > photosLimit) {
      openPlanModal("Limite de Fotografias", `O seu plano atual permite até ${photosLimit} fotografias. Pode desbloquear +15 fotos com um Power-up ou fazer upgrade para um plano profissional.`);
      return;
    }

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        const newImage: UploadedImage = {
          id: Math.random().toString(36).substr(2, 9),
          name: file.name,
          preview: reader.result as string,
          isMain: images.length === 0,
        };
        setImages((prev) => [...prev, newImage]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>, videosLimit: number, openPlanModal: (title: string, desc: string) => void) => {
    const files = e.target.files;
    if (!files) return;

    if (videos.length + Array.from(files).length > videosLimit) {
      openPlanModal("Limite de Vídeos", `O seu plano atual permite até ${videosLimit} vídeo(s). Pode desbloquear esta funcionalidade para este imóvel com um Power-up ou mudar para o plano Pro.`);
      return;
    }

    Array.from(files).forEach((file) => {
      if (file.size > 50 * 1024 * 1024) {
        toast({ title: "Ficheiro demasiado grande", description: "O vídeo deve ter menos de 50MB.", variant: "destructive" });
        return;
      }
      const videoUrl = URL.createObjectURL(file);
      const newVideo = { id: Math.random().toString(36).substr(2, 9), name: file.name, url: videoUrl };
      setVideos((prev) => [...prev, newVideo]);
    });
  };

  const removeVideo = (id: string) => {
    setVideos((prev) => prev.filter((v) => v.id !== id));
  };

  const removeImage = (id: string) => {
    setImages((prev) => {
      const filtered = prev.filter((img) => img.id !== id);
      if (filtered.length > 0 && !filtered.some((img) => img.isMain)) {
        filtered[0].isMain = true;
      }
      return filtered;
    });
  };

  const setMainImage = (id: string) => {
    setImages((prev) => prev.map((img) => ({ ...img, isMain: img.id === id })));
  };

  const getPropertyData = (overrides: any = {}) => ({
    title, description,
    price: parseFloat(price) || 0,
    address, location: (distrito && concelho) ? `${distrito}, ${concelho}` : (concelho || ""),
    postal_code: postalCode,
    property_type: propertyType || 'apartment',
    transaction_type: transactionType,
    bedrooms: parseInt(bedrooms) || 0,
    bathrooms: parseInt(bathrooms) || 0,
    area: parseFloat(area) || 0,
    gross_area: parseFloat(grossArea) || null,
    floor,
    year_built: yearBuilt ? parseInt(yearBuilt) : null,
    energy_certification: energyCert || null,
    condition: condition || 'used',
    has_garage: hasGarage, has_garden: hasGarden, has_pool: hasPool,
    has_elevator: hasElevator, has_ac: hasAC, has_central_heating: hasCentralHeating,
    pets_allowed: petsAllowed,
    image_url: images.find(img => img.isMain)?.preview || images[0]?.preview || null,
    images: images.map(img => img.preview),
    wizard_step: step,
    ...overrides
  });

  const handleSaveDraft = async () => {
    if (!title) {
      toast({ title: "Título necessário", description: "Por favor insira pelo menos um título para poder guardar o rascunho.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    try {
      const data = getPropertyData({ status: 'rascunho' });
      let result;
      if (mode === 'edit' && propertyId) {
        result = await updateProperty(propertyId, data);
      } else {
        result = await createProperty(data);
      }
      if (result) {
        toast({ title: "Rascunho guardado com sucesso", description: "Pode continuar a preencher os dados mais tarde." });
        navigate("/meus-imoveis");
      }
    } catch (error) {
      console.error("Error saving draft:", error);
      toast({ title: "Erro ao guardar rascunho", description: "Ocorreu um problema, por favor tente novamente.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast({ title: "Título obrigatório", description: "Por favor insira um título para o imóvel.", variant: "destructive" });
      return;
    }
    if (!acceptedPrivacy) {
      toast({ title: "Política de Privacidade", description: "Por favor aceite a política de privacidade.", variant: "destructive" });
      return;
    }
    if (!acceptedTerms) {
      setShowLegalModal(true);
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const data = getPropertyData({ status: 'active' });
      let result;
      if (mode === 'edit' && propertyId) {
        result = await updateProperty(propertyId, data);
      } else {
        result = await createProperty(data);
      }

      if (result) {
        const id = propertyId || result.id;
        await (supabase.from('visit_availability') as any).delete().eq('property_id', id);
        if (availableDays.length > 0) {
          const availabilityData = availableDays.map(day => ({
            property_id: id,
            seller_id: user.id,
            available_date: day.date.toISOString().split('T')[0],
            time_slots: day.slots.filter(s => s.isAvailable).map(s => s.time)
          }));
          await (supabase.from('visit_availability') as any).insert(availabilityData);
        }

        toast({
          title: mode === 'edit' ? "Anúncio atualizado!" : "Anúncio publicado com sucesso!",
          description: "As alterações foram guardadas.",
        });
        navigate("/meus-imoveis");
      }
    } catch (error) {
      console.error('Error submitting property:', error);
      toast({ title: "Erro ao guardar", description: "Não foi possível processar o seu pedido. Tente novamente.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    if (step === 1 && (!propertyType || !title)) {
      toast({ title: "Campos em falta", description: "Por favor preencha o tipo de imóvel e o título.", variant: "destructive" });
      return;
    }
    if (step === 2) {
      const parsedPrice = parseFloat(price);
      if (isNaN(parsedPrice) || parsedPrice <= 0) {
        toast({ title: "Preço necessário", description: "Por favor insira um preço válido.", variant: "destructive" });
        return;
      }
    }
    setStep((prev) => Math.min(prev + 1, 5));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const prevStep = () => {
    setStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStepClick = (newStep: number) => {
    if (mode === 'edit' || (mode === 'publish' && propertyId)) {
      setStep(newStep);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const openPlanModal = (title: string, desc: string) => {
    setPlanModalTitle(title);
    setPlanModalDesc(desc);
    setShowPlanModal(true);
  };

  return {
    loading, isSubmitting, step, mode,
    // Form fields
    title, setTitle, propertyType, setPropertyType, description, setDescription,
    price, setPrice, address, setAddress, distrito, setDistrito,
    concelho, setConcelho, postalCode, area, setArea, grossArea, setGrossArea,
    bedrooms, setBedrooms, bathrooms, setBathrooms,
    virtualTourUrl, setVirtualTourUrl,
    floor, setFloor, yearBuilt, setYearBuilt, energyCert, setEnergyCert,
    condition, setCondition,
    // Features
    hasGarage, setHasGarage, hasGarden, setHasGarden, hasPool, setHasPool,
    hasElevator, setHasElevator, hasAC, setHasAC, hasCentralHeating, setHasCentralHeating,
    petsAllowed, setPetsAllowed,
    // Media
    images, videos,
    // Visit
    availableDays, setAvailableDays,
    // Terms / Modals
    acceptedPrivacy, setAcceptedPrivacy,
    showLegalModal, setShowLegalModal, showPlanModal, setShowPlanModal,
    planModalTitle, planModalDesc,
    acceptedTerms, setAcceptedTerms,
    isLoadingPostalCode,
    // Handlers
    handlePostalCodeChange, handleImageUpload, handleVideoUpload,
    removeImage, removeVideo, setMainImage,
    handleSaveDraft, handleSubmit, nextStep, prevStep, handleStepClick,
    openPlanModal,
  };
}
