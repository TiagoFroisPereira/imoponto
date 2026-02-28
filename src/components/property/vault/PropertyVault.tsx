import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Accordion } from "@/components/ui/accordion";
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
import { VaultSharedUsers } from "./VaultSharedUsers";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface PropertyVaultProps {
  propertyId: string;
  propertyTitle?: string;
}

export function PropertyVault({ propertyId, propertyTitle }: PropertyVaultProps) {
  const { hasFeature, loading: limitsLoading } = usePlanLimits(propertyId);
  const { hasConsent, isLoading: consentLoading } = useVaultConsent(propertyId);
  const vm = useVaultManager(propertyId, propertyTitle);
  const [addProfessionalOpen, setAddProfessionalOpen] = useState(false);
  const { user } = useAuth();

  const { data: property } = useQuery({
    queryKey: ['property-owner', propertyId],
    queryFn: async () => {
      const { data } = await supabase
        .from('properties')
        .select('user_id')
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
  const showPaywall = !limitsLoading && !buyerAccessLoading && !hasFeature('vault') && !hasBuyerPaidAccess;
  // Buyers with paid access already accepted terms during payment, skip consent
  const needsConsent = !consentLoading && (hasFeature('vault') || hasBuyerPaidAccess) && !hasConsent && !hasBuyerPaidAccess;

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
          <div className={`p-6 space-y-6 transition-all duration-700 ${showPaywall || needsConsent ? "blur-md pointer-events-none opacity-40 select-none scale-[0.98]" : "opacity-100 scale-100"}`}>
            <VaultHeader
              documentsCount={vm.documents.length}
              onDownloadAll={vm.handleDownloadAll}
              downloadingAll={vm.downloadingAll}
              onAddProfessional={() => setAddProfessionalOpen(true)}
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
              />
            </div>

            <p className="text-xs text-muted-foreground pt-4">
              💡 Documentos públicos ficam visíveis na página do anúncio. Documentos privados só você pode ver.
            </p>
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
    </div>
  );
}

export default PropertyVault;
