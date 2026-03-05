import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Accordion } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { DOCUMENT_CATEGORIES, DOCUMENT_INFO } from "@/data/documentCategories";
import { DocumentGuideModal } from "../wizard/DocumentGuideModal";
import { usePlanLimits } from "@/hooks/usePlanLimits";
import { useVaultConsent } from "@/hooks/useVaultConsent";
import { useVaultManager } from "./useVaultManager";
import { VaultHeader } from "./VaultHeader";
import { VaultPaywall } from "./VaultPaywall";
import { VaultDocumentCard } from "./VaultDocumentCard";
import { VaultOthersSection } from "./VaultOthersSection";
import { VaultValidationDialog, VaultPreviewDialog } from "./VaultDialogs";
import { STEP_BY_STEP_DOCUMENTS } from "./vaultUtils";
import { AddProfessionalDialog } from "../AddProfessionalDialog";
import { Progress } from "@/components/ui/progress";
import { ShieldCheck, Lock, Unlock, AlertTriangle, Loader2 } from "lucide-react";
import { VaultSharedUsers } from "./VaultSharedUsers";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { WIZARD_STEPS } from "../wizard/WizardConstants";
import { UpsellCard } from "../wizard/UpsellCard";
import { supabase } from "@/integrations/supabase/client";
import { QuickCheckoutDialog } from "../../checkout/QuickCheckoutDialog";

interface PropertyVaultProps {
  propertyId: string;
  propertyTitle?: string;
}

export function PropertyVault({ propertyId, propertyTitle }: PropertyVaultProps) {
  const { hasFeature, loading: limitsLoading } = usePlanLimits(propertyId);
  const { hasConsent, isLoading: consentLoading } = useVaultConsent(propertyId);
  const vm = useVaultManager(propertyId, propertyTitle);
  const vaultState = vm.vaultState;
  const [addProfessionalOpen, setAddProfessionalOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const { user } = useAuth();

  const { data: property, refetch: refetchProperty } = useQuery({
    queryKey: ['property-owner', propertyId],
    queryFn: async () => {
      const { data } = await supabase
        .from('properties')
        .select('user_id, location')
        .eq('id', propertyId)
        .maybeSingle();
      return data;
    },
  });

  // Check if the current user has paid buyer vault access
  const { data: buyerAccess, isLoading: buyerAccessLoading } = useQuery({
    queryKey: ['buyer-vault-access-check', propertyId, user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from('vault_buyer_access')
        .select('id, status')
        .eq('property_id', propertyId)
        .eq('buyer_id', user.id)
        .eq('status', 'paid')
        .maybeSingle();
      return data;
    },
    enabled: !!user && !!propertyId,
  });

  const hasBuyerPaidAccess = !!buyerAccess;
  const isOwner = !!user && !!property && user.id === property.user_id;

  const isAnyLoading = vm.isLoading || limitsLoading || consentLoading || buyerAccessLoading;
  const showPaywall = !vm.limitsLoading && !buyerAccessLoading && !vm.hasPremium && !hasBuyerPaidAccess;
  // Buyers with paid access already accepted terms during payment, skip consent
  const needsConsent = !consentLoading && (vm.hasPremium || hasBuyerPaidAccess) && !hasConsent && !hasBuyerPaidAccess;
  const navigate = useNavigate();

  const otherCategory = DOCUMENT_CATEGORIES.find(c => c.value === 'outros')!;
  const otherDocs = vm.documents.filter(d => d.category === 'outros');

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-xl border bg-background/50">
        {/* Loading */}
        {isAnyLoading && (
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-10 w-32" />
            </div>
            <div className="grid gap-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-24 w-full rounded-lg" />
              ))}
            </div>
          </div>
        )}

        {/* Paywall / Consent overlay */}
        {!isAnyLoading && (showPaywall || needsConsent) && (
          <VaultPaywall
            showPaywall={showPaywall}
            needsConsent={needsConsent}
            propertyId={propertyId}
            consentDialogOpen={vm.consentDialogOpen}
            setConsentDialogOpen={vm.setConsentDialogOpen}
          />
        )}

        {/* Main content */}
        {!isAnyLoading && (
          <div className="relative">
            {vaultState === 'UPGRADING' && (
              <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-background/60 backdrop-blur-sm rounded-xl">
                <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
                <p className="text-lg font-semibold tracking-tight">Processando...</p>
                <p className="text-sm text-muted-foreground italic">A ativar o seu Cofre Premium</p>
              </div>
            )}

            <div className={`p-6 space-y-6 transition-all duration-700 ${showPaywall || needsConsent ? "blur-md pointer-events-none opacity-40 select-none scale-[0.98]" : "opacity-100 scale-100"}`}>
              {isOwner && WIZARD_STEPS[0].upsell && (
                <UpsellCard
                  title={vaultState === 'LIMIT_REACHED' ? "⚠️ Limite atingido no Cofre Básico" : WIZARD_STEPS[0].upsell.title}
                  description={vaultState === 'LIMIT_REACHED'
                    ? "Atingiu o limite de 4 ficheiros do modo básico. Ative o Cofre Premium para validar documentos ilimitados e garantir a segurança da venda."
                    : WIZARD_STEPS[0].upsell.description}
                  price={WIZARD_STEPS[0].upsell.price}
                  buttonLabel={WIZARD_STEPS[0].upsell.buttonLabel}
                  secondaryButtonLabel={vaultState === 'LIMIT_REACHED' ? undefined : WIZARD_STEPS[0].upsell.secondaryButtonLabel}
                  variant={vaultState === 'LIMIT_REACHED' ? "accent" : WIZARD_STEPS[0].upsell.variant}
                  badge={vaultState === 'LIMIT_REACHED' ? "Urgente" : WIZARD_STEPS[0].upsell.badge}
                  onClick={() => {
                    vm.setIsUpgrading(true);
                    setCheckoutOpen(true);
                  }}
                  onSecondaryClick={() => {
                    if (property?.location) {
                      navigate(`/pesquisa?category=fotografo&location=${encodeURIComponent(property.location)}`);
                    } else {
                      navigate('/pesquisa?category=fotografo');
                    }
                  }}
                  className={cn("mb-2", vaultState === 'LIMIT_REACHED' && "border-amber-300 bg-amber-50/30")}
                />
              )}

              {/* State Feedback Banner */}
              {vaultState === 'EMPTY' && (
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <Unlock className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Comece a organizar a sua venda.</p>
                    <p className="text-xs text-muted-foreground">O primeiro documento é o passo mais importante para uma escritura rápida.</p>
                  </div>
                </div>
              )}

              {vaultState === 'FREE_ACTIVE' && (
                <div className="bg-muted/50 border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{vm.documents.length}/4 espaços grátis usados</span>
                    <span className="text-muted-foreground">{4 - vm.documents.length} restantes</span>
                  </div>
                  <Progress value={(vm.documents.length / 4) * 100} className="h-2" />
                </div>
              )}

              {vaultState === 'LOCKED' && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="w-6 h-6 text-amber-500" />
                    <div>
                      <p className="font-bold text-sm text-amber-900">O seu cofre expirou.</p>
                      <p className="text-xs text-amber-800">Ative o modo Vitalício por €10/ano para manter os seus documentos seguros.</p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="default"
                    className="bg-amber-600 hover:bg-amber-700 w-full sm:w-auto"
                    onClick={() => setCheckoutOpen(true)}
                  >
                    Ativar Modo Vitalício
                  </Button>
                </div>
              )}

              <VaultHeader
                documentsCount={vm.documents.length}
                onDownloadAll={vm.handleDownloadAll}
                downloadingAll={vm.downloadingAll}
                onAddProfessional={() => setAddProfessionalOpen(true)}
                vaultState={vaultState}
              />

              <VaultSharedUsers propertyId={propertyId} isOwner={isOwner} />

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-foreground">Documentos Necessários</h4>
                  <span className="text-xs text-muted-foreground">
                    {vm.documents.filter(d => d.category !== 'outros').length} de {DOCUMENT_CATEGORIES.length - 1} carregados
                  </span>
                </div>

                {/* Step-by-step documents */}
                <div className="space-y-3">
                  {DOCUMENT_CATEGORIES.filter(cat => STEP_BY_STEP_DOCUMENTS.includes(cat.value)).map((category) => (
                    <VaultDocumentCard
                      key={category.value}
                      category={category}
                      doc={vm.getDocumentByCategory(category.value)}
                      isStepByStep={true}
                      uploading={vm.uploading}
                      uploadingCategory={vm.uploadingCategory}
                      onUpload={vm.handleUploadButtonClick}
                      onPreview={vm.openPreviewDialog}
                      onDownload={vm.handleDownloadDocument}
                      onDelete={(doc) => vm.deleteMutation.mutate(doc)}
                      onToggleVisibility={(p) => vm.toggleVisibilityMutation.mutate(p)}
                      onGuide={vm.openGuideDialog}
                      onValidate={vm.openValidationDialog}
                      disabled={vm.vaultState === 'LIMIT_REACHED' || vm.vaultState === 'LOCKED'}
                      isLocked={vm.vaultState === 'LOCKED'}
                    />
                  ))}
                </div>

                {/* Accordion documents */}
                <Accordion type="multiple" className="space-y-3">
                  {DOCUMENT_CATEGORIES.filter(cat => !STEP_BY_STEP_DOCUMENTS.includes(cat.value) && cat.value !== 'outros').map((category) => (
                    <VaultDocumentCard
                      key={category.value}
                      category={category}
                      doc={vm.getDocumentByCategory(category.value)}
                      isStepByStep={false}
                      uploading={vm.uploading}
                      uploadingCategory={vm.uploadingCategory}
                      info={DOCUMENT_INFO[category.value]}
                      onUpload={vm.handleUploadButtonClick}
                      onPreview={vm.openPreviewDialog}
                      onDownload={vm.handleDownloadDocument}
                      onDelete={(doc) => vm.deleteMutation.mutate(doc)}
                      onToggleVisibility={(p) => vm.toggleVisibilityMutation.mutate(p)}
                      onGuide={vm.openGuideDialog}
                      onValidate={vm.openValidationDialog}
                      disabled={vm.vaultState === 'LIMIT_REACHED' || vm.vaultState === 'LOCKED'}
                      isLocked={vm.vaultState === 'LOCKED'}
                    />
                  ))}
                </Accordion>

                {/* Others section */}
                <VaultOthersSection
                  otherDocs={otherDocs}
                  categoryLabel={otherCategory.label}
                  uploading={vm.uploading}
                  uploadingCategory={vm.uploadingCategory}
                  onUpload={vm.handleUploadButtonClick}
                  onPreview={vm.openPreviewDialog}
                  onDownload={vm.handleDownloadDocument}
                  onDelete={(doc) => vm.deleteMutation.mutate(doc)}
                  onToggleVisibility={(p) => vm.toggleVisibilityMutation.mutate(p)}
                  onValidate={vm.openValidationDialog}
                  disabled={vaultState === 'LIMIT_REACHED' || vaultState === 'LOCKED'}
                  isLocked={vaultState === 'LOCKED'}
                />
              </div>
              <p className="text-xs text-muted-foreground pt-4">
                💡 Documentos públicos ficam visíveis na página do anúncio. Documentos privados só você pode ver.
              </p>
            </div>
          </div>
        )}

        {/* Hidden file inputs */}
        {DOCUMENT_CATEGORIES.map((cat) => (
          <Input
            key={cat.value}
            ref={(el) => { vm.fileInputRefs.current[cat.value] = el; }}
            type="file"
            className="hidden"
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
            onChange={(e) => vm.handleFileChange(e, cat.value)}
          />
        ))}

        {/* Guide Modal */}
        <DocumentGuideModal
          open={vm.guideDialogOpen}
          onOpenChange={(open) => {
            vm.setGuideDialogOpen(open);
            if (!open) vm.setGuideCategory(null);
          }}
          category={vm.guideCategory}
          onUpload={vm.guideCategory ? () => vm.handleUploadButtonClick(vm.guideCategory!) : undefined}
          isUploading={vm.uploading && vm.uploadingCategory === vm.guideCategory}
        />

        {/* Validation Dialog */}
        <VaultValidationDialog
          open={vm.validationDialogOpen}
          onOpenChange={vm.setValidationDialogOpen}
          document={vm.validationDocument}
          onPreview={vm.openPreviewDialog}
          onDownload={vm.handleDownloadDocument}
        />

        {/* Preview Dialog */}
        <VaultPreviewDialog
          open={vm.previewDialogOpen}
          onOpenChange={vm.setPreviewDialogOpen}
          document={vm.previewDocument}
          previewUrl={vm.previewUrl}
          onDownload={vm.handleDownloadDocument}
        />
        {/* Add Professional Dialog */}
        <AddProfessionalDialog
          open={addProfessionalOpen}
          onOpenChange={setAddProfessionalOpen}
          propertyId={propertyId}
          propertyTitle={propertyTitle || ""}
          vaultDocumentIds={vm.documents.map(d => d.id)}
        />
      </div>

      <QuickCheckoutDialog
        open={checkoutOpen}
        onOpenChange={setCheckoutOpen}
        productKey="vault_premium"
        propertyId={propertyId}
        onSuccess={() => {
          vm.setIsUpgrading(false);
          refetchProperty();
        }}
      />
    </div >
  );
}

export default PropertyVault;
