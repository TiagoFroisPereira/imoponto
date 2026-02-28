import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { VisitScheduler } from "@/components/property/VisitScheduler";
import { LegalNoticeModal } from "@/components/property/LegalNoticeModal";
import { SellerPlansModal } from "@/components/property/SellerPlansModal";
import { usePlanLimits } from "@/hooks/usePlanLimits";
import { usePropertyFormManager } from "./usePropertyFormManager";
import type { PropertyFormProps } from "./propertyFormConstants";
import StepIndicator from "./StepIndicator";
import StepBasicInfo from "./StepBasicInfo";
import StepDetails from "./StepDetails";
import StepMedia from "./StepMedia";
import StepVault from "./StepVault";
import FormNavigation from "./FormNavigation";

const PropertyForm = ({ mode, propertyId }: PropertyFormProps) => {
  const mgr = usePropertyFormManager(mode, propertyId);
  const { limits, hasFeature } = usePlanLimits(propertyId);

  if (mgr.loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const canNavigateFreely = mode === 'edit' || (mode === 'publish' && !!propertyId);

  return (
    <div className="space-y-6">
      <StepIndicator currentStep={mgr.step} onStepClick={mgr.handleStepClick} canNavigateFreely={canNavigateFreely} />

      <div className="max-w-3xl mx-auto pb-20">
        <div className="flex justify-end gap-2 mb-4">
          <Button variant="outline" size="sm" onClick={mgr.handleSaveDraft} disabled={mgr.isSubmitting}>
            {mgr.isSubmitting ? "A guardar..." : "Guardar Rascunho"}
          </Button>
        </div>

        {mgr.step === 1 && (
          <StepBasicInfo
            title={mgr.title} setTitle={mgr.setTitle}
            propertyType={mgr.propertyType} setPropertyType={mgr.setPropertyType}
            description={mgr.description} setDescription={mgr.setDescription}
          />
        )}

        {mgr.step === 2 && (
          <StepDetails
            area={mgr.area} setArea={mgr.setArea}
            grossArea={mgr.grossArea} setGrossArea={mgr.setGrossArea}
            price={mgr.price} setPrice={mgr.setPrice}
            postalCode={mgr.postalCode} handlePostalCodeChange={mgr.handlePostalCodeChange}
            isLoadingPostalCode={mgr.isLoadingPostalCode}
            address={mgr.address} setAddress={mgr.setAddress}
            distrito={mgr.distrito} setDistrito={mgr.setDistrito}
            concelho={mgr.concelho} setConcelho={mgr.setConcelho}
            bedrooms={mgr.bedrooms} setBedrooms={mgr.setBedrooms}
            bathrooms={mgr.bathrooms} setBathrooms={mgr.setBathrooms}
            floor={mgr.floor} setFloor={mgr.setFloor}
            yearBuilt={mgr.yearBuilt} setYearBuilt={mgr.setYearBuilt}
            energyCert={mgr.energyCert} setEnergyCert={mgr.setEnergyCert}
            condition={mgr.condition} setCondition={mgr.setCondition}
            hasGarage={mgr.hasGarage} setHasGarage={mgr.setHasGarage}
            hasGarden={mgr.hasGarden} setHasGarden={mgr.setHasGarden}
            hasPool={mgr.hasPool} setHasPool={mgr.setHasPool}
            hasElevator={mgr.hasElevator} setHasElevator={mgr.setHasElevator}
            hasAC={mgr.hasAC} setHasAC={mgr.setHasAC}
            hasCentralHeating={mgr.hasCentralHeating} setHasCentralHeating={mgr.setHasCentralHeating}
            petsAllowed={mgr.petsAllowed} setPetsAllowed={mgr.setPetsAllowed}
          />
        )}

        {mgr.step === 3 && (
          <StepMedia
            images={mgr.images} videos={mgr.videos}
            virtualTourUrl={mgr.virtualTourUrl} setVirtualTourUrl={mgr.setVirtualTourUrl}
            limits={limits} hasFeature={hasFeature}
            onImageUpload={(e) => mgr.handleImageUpload(e, limits.photos, mgr.openPlanModal)}
            onVideoUpload={(e) => mgr.handleVideoUpload(e, limits.videos, mgr.openPlanModal)}
            removeImage={mgr.removeImage} removeVideo={mgr.removeVideo}
            setMainImage={mgr.setMainImage} openPlanModal={mgr.openPlanModal}
          />
        )}

        {mgr.step === 4 && (
          <StepVault
            propertyId={propertyId}
            propertyTitle={mgr.title}
            mode={mode}
            hasVaultFeature={hasFeature('vault')}
            onSaveDraft={mgr.handleSaveDraft}
            openPlanModal={mgr.openPlanModal}
          />
        )}

        {mgr.step === 5 && (
          <VisitScheduler availableDays={mgr.availableDays} onAvailabilityChange={mgr.setAvailableDays} mode={mode === 'edit' || mode === 'publish' ? 'edit' : 'view'} />
        )}

        <FormNavigation
          step={mgr.step} mode={mode} isSubmitting={mgr.isSubmitting}
          acceptedPrivacy={mgr.acceptedPrivacy} setAcceptedPrivacy={mgr.setAcceptedPrivacy}
          onPrev={mgr.prevStep} onNext={mgr.nextStep} onSubmit={mgr.handleSubmit}
        />
      </div>

      <LegalNoticeModal
        open={mgr.showLegalModal}
        onOpenChange={mgr.setShowLegalModal}
        onAccept={() => { mgr.setAcceptedTerms(true); mgr.setShowLegalModal(false); mgr.handleSubmit(); }}
      />

      <SellerPlansModal
        open={mgr.showPlanModal}
        onOpenChange={mgr.setShowPlanModal}
        title={mgr.planModalTitle}
        description={mgr.planModalDesc}
      />
    </div>
  );
};

export default PropertyForm;
