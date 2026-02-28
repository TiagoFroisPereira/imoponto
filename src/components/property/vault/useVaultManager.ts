import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { getCategoryLabel } from "@/data/documentCategories";
import { notifyVaultStakeholders } from "@/lib/notifyVaultStakeholders";
import JSZip from "jszip";
import {
  VaultDocument,
  calculateDocumentationLevel,
  formatFileSize,
  getStoragePath,
} from "./vaultUtils";

export function useVaultManager(propertyId: string, propertyTitle?: string) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Local state
  const [uploading, setUploading] = useState(false);
  const [uploadingCategory, setUploadingCategory] = useState<string | null>(null);
  const [guideDialogOpen, setGuideDialogOpen] = useState(false);
  const [guideCategory, setGuideCategory] = useState<string | null>(null);
  const [validationDialogOpen, setValidationDialogOpen] = useState(false);
  const [validationDocument, setValidationDocument] = useState<VaultDocument | null>(null);
  const [downloadingAll, setDownloadingAll] = useState(false);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [previewDocument, setPreviewDocument] = useState<VaultDocument | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [consentDialogOpen, setConsentDialogOpen] = useState(false);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  // Query
  const { data: documents = [], isLoading } = useQuery({
    queryKey: ['vault-documents', propertyId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('vault_documents')
        .select('*')
        .eq('property_id', propertyId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching documents:', error);
        return [];
      }

      return data as VaultDocument[];
    }
  });

  // Mutations
  const toggleVisibilityMutation = useMutation({
    mutationFn: async ({ id, isPublic }: { id: string; isPublic: boolean }) => {
      const { error } = await supabase
        .from('vault_documents')
        .update({ is_public: !isPublic })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vault-documents', propertyId] });
      toast({ title: "Sucesso", description: "Visibilidade atualizada" });
    },
    onError: () => {
      toast({ title: "Erro", description: "Não foi possível atualizar a visibilidade", variant: "destructive" });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (doc: VaultDocument) => {
      const urlParts = doc.file_url.split('/vault-documents/');
      if (urlParts.length > 1) {
        const filePath = urlParts[1];
        await supabase.storage.from('vault-documents').remove([filePath]);
      }
      const { error } = await supabase.from('vault_documents').delete().eq('id', doc.id);
      if (error) throw error;
      return doc;
    },
    onSuccess: async (deletedDoc) => {
      await queryClient.invalidateQueries({ queryKey: ['vault-documents', propertyId] });

      const { data: updatedDocs } = await supabase
        .from('vault_documents')
        .select('*')
        .eq('property_id', propertyId);

      if (updatedDocs) {
        const newLevel = calculateDocumentationLevel(updatedDocs as VaultDocument[]);
        await supabase.from('properties').update({ documentation_level: newLevel }).eq('id', propertyId);
        queryClient.invalidateQueries({ queryKey: ['property', propertyId] });
        queryClient.invalidateQueries({ queryKey: ['public-property', propertyId] });
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        notifyVaultStakeholders({
          propertyId,
          propertyTitle,
          documentName: deletedDoc.name,
          action: "delete",
          actorUserId: user.id,
        });
      }

      toast({ title: "Sucesso", description: "Documento eliminado" });
    },
    onError: () => {
      toast({ title: "Erro", description: "Não foi possível eliminar o documento", variant: "destructive" });
    }
  });

  // Handlers
  const getDocumentByCategory = (category: string): VaultDocument | undefined => {
    return documents.find(doc => doc.category === category);
  };

  const handleUploadButtonClick = (category: string) => {
    fileInputRefs.current[category]?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, category: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast({ title: "Ficheiro demasiado grande", description: "O tamanho máximo é 10MB", variant: "destructive" });
      return;
    }

    await handleUpload(file, category);

    if (fileInputRefs.current[category]) {
      fileInputRefs.current[category]!.value = '';
    }
  };

  const handleUpload = async (file: File, category: string) => {
    setUploading(true);
    setUploadingCategory(category);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({ title: "Erro", description: "Precisa estar autenticado", variant: "destructive" });
        return;
      }

      const timestamp = Date.now();
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${propertyId}/${timestamp}-${file.name}`;

      const { error: uploadError } = await supabase.storage
        .from('vault-documents')
        .upload(fileName, file, { cacheControl: '3600', upsert: false });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        toast({ title: "Erro no upload", description: uploadError.message, variant: "destructive" });
        return;
      }

      const { data: { publicUrl } } = supabase.storage.from('vault-documents').getPublicUrl(fileName);

      const { error: insertError } = await supabase
        .from('vault_documents')
        .insert({
          property_id: propertyId,
          user_id: user.id,
          name: file.name,
          file_type: fileExt || 'unknown',
          file_url: publicUrl,
          file_size: formatFileSize(file.size),
          category: category,
          is_public: false,
          status: 'pending'
        });

      if (insertError) {
        console.error('Insert error:', insertError);
        toast({ title: "Erro", description: "Não foi possível guardar o documento", variant: "destructive" });
        return;
      }

      await queryClient.invalidateQueries({ queryKey: ['vault-documents', propertyId] });

      const { data: updatedDocs } = await supabase
        .from('vault_documents')
        .select('*')
        .eq('property_id', propertyId);

      if (updatedDocs) {
        const newLevel = calculateDocumentationLevel(updatedDocs as VaultDocument[]);
        await supabase.from('properties').update({ documentation_level: newLevel }).eq('id', propertyId);
        queryClient.invalidateQueries({ queryKey: ['property', propertyId] });
        queryClient.invalidateQueries({ queryKey: ['public-property', propertyId] });
      }

      toast({ title: "Sucesso", description: "Documento carregado com sucesso" });

      notifyVaultStakeholders({
        propertyId,
        propertyTitle,
        documentName: file.name,
        action: "upload",
        actorUserId: user.id,
      });

      if (guideDialogOpen) {
        setGuideDialogOpen(false);
        setGuideCategory(null);
      }
    } catch (error) {
      console.error('Error:', error);
      toast({ title: "Erro", description: "Ocorreu um erro ao carregar o documento", variant: "destructive" });
    } finally {
      setUploading(false);
      setUploadingCategory(null);
    }
  };

  const openGuideDialog = (category: string) => {
    setGuideCategory(category);
    setGuideDialogOpen(true);
  };

  const openValidationDialog = (doc: VaultDocument) => {
    setValidationDocument(doc);
    setValidationDialogOpen(true);
  };

  const openPreviewDialog = async (doc: VaultDocument) => {
    setPreviewDocument(doc);
    setPreviewUrl(null);
    setPreviewDialogOpen(true);

    try {
      const path = getStoragePath(doc.file_url);
      if (path) {
        const { data, error } = await supabase.storage
          .from('vault-documents')
          .createSignedUrl(path, 3600);

        if (data?.signedUrl) {
          setPreviewUrl(data.signedUrl);
        } else {
          console.error('Error creating signed URL:', error);
          setPreviewUrl(doc.file_url);
        }
      } else {
        setPreviewUrl(doc.file_url);
      }
    } catch (error) {
      console.error('Error in openPreviewDialog:', error);
      setPreviewUrl(doc.file_url);
    }
  };

  const handleDownloadDocument = async (doc: VaultDocument) => {
    try {
      let downloadUrl = doc.file_url;
      const path = getStoragePath(doc.file_url);
      if (path) {
        const { data } = await supabase.storage.from('vault-documents').createSignedUrl(path, 60);
        if (data?.signedUrl) downloadUrl = data.signedUrl;
      }

      const response = await fetch(downloadUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading document:', error);
      toast({ title: "Erro", description: "Não foi possível descarregar o documento", variant: "destructive" });
    }
  };

  const handleDownloadAll = async () => {
    if (documents.length === 0) return;
    setDownloadingAll(true);
    try {
      const zip = new JSZip();

      for (const doc of documents) {
        try {
          let downloadUrl = doc.file_url;
          const path = getStoragePath(doc.file_url);
          if (path) {
            const { data } = await supabase.storage.from('vault-documents').createSignedUrl(path, 60);
            if (data?.signedUrl) downloadUrl = data.signedUrl;
          }

          const response = await fetch(downloadUrl);
          if (!response.ok) throw new Error(`Failed to fetch ${doc.name}`);
          const blob = await response.blob();
          const categoryLabel = getCategoryLabel(doc.category) || 'Outros';
          zip.file(`${categoryLabel}/${doc.name}`, blob);
        } catch (error) {
          console.error(`Error fetching document ${doc.name}:`, error);
        }
      }

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const url = window.URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      const propertyName = propertyTitle || propertyId;
      a.download = `documentos-${propertyName.replace(/[^a-zA-Z0-9]/g, '-')}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast({ title: "Sucesso", description: "Documentos descarregados com sucesso" });
    } catch (error) {
      console.error('Error creating zip:', error);
      toast({ title: "Erro", description: "Não foi possível criar o ficheiro ZIP", variant: "destructive" });
    } finally {
      setDownloadingAll(false);
    }
  };

  return {
    // Data
    documents,
    isLoading,
    // State
    uploading,
    uploadingCategory,
    guideDialogOpen,
    setGuideDialogOpen,
    guideCategory,
    setGuideCategory,
    validationDialogOpen,
    setValidationDialogOpen,
    validationDocument,
    downloadingAll,
    previewDialogOpen,
    setPreviewDialogOpen,
    previewDocument,
    previewUrl,
    consentDialogOpen,
    setConsentDialogOpen,
    fileInputRefs,
    // Mutations
    toggleVisibilityMutation,
    deleteMutation,
    // Handlers
    getDocumentByCategory,
    handleUploadButtonClick,
    handleFileChange,
    openGuideDialog,
    openValidationDialog,
    openPreviewDialog,
    handleDownloadDocument,
    handleDownloadAll,
  };
}
