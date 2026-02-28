import { DOCUMENT_CATEGORIES } from "@/data/documentCategories";

export interface VaultDocument {
  id: string;
  name: string;
  file_type: string;
  file_url: string;
  file_size: string | null;
  is_public: boolean;
  status: string;
  category: string | null;
  created_at: string;
}

export type DocumentStatus = 'not_uploaded' | 'pending' | 'validated' | 'rejected';

// Required document categories for complete documentation (excluding 'outros')
export const REQUIRED_CATEGORIES = DOCUMENT_CATEGORIES.filter(c => c.value !== 'outros').map(c => c.value);

// Documents that need step-by-step guide modal
export const STEP_BY_STEP_DOCUMENTS = ['certidao', 'caderneta'];

export const calculateDocumentationLevel = (documents: VaultDocument[]): string => {
  if (documents.length === 0) return 'none';

  const uploadedCategories = new Set(documents.map(doc => doc.category).filter(Boolean));
  const requiredCategoriesCount = REQUIRED_CATEGORIES.length;
  const uploadedRequiredCount = REQUIRED_CATEGORIES.filter(cat => uploadedCategories.has(cat)).length;

  if (uploadedRequiredCount === 0) return 'none';
  if (uploadedRequiredCount < requiredCategoriesCount) return 'incomplete';
  return 'complete';
};

export const getDocumentStatus = (doc: VaultDocument | undefined): DocumentStatus => {
  if (!doc) return 'not_uploaded';
  switch (doc.status) {
    case 'validated': return 'validated';
    case 'rejected': return 'rejected';
    default: return 'pending';
  }
};

export const getStatusConfig = (status: DocumentStatus) => {
  switch (status) {
    case 'not_uploaded':
      return {
        label: 'Não inserido',
        iconName: 'AlertCircle' as const,
        className: 'bg-muted text-muted-foreground',
        borderClassName: 'border-border/50 bg-muted/30'
      };
    case 'pending':
      return {
        label: 'Em análise',
        iconName: 'Clock' as const,
        className: 'bg-amber-500/20 text-amber-700 dark:text-amber-400',
        borderClassName: 'border-amber-500/30 bg-amber-500/5'
      };
    case 'validated':
      return {
        label: 'Validado',
        iconName: 'CheckCircle2' as const,
        className: 'bg-green-500/20 text-green-700 dark:text-green-400',
        borderClassName: 'border-green-500/30 bg-green-500/10'
      };
    case 'rejected':
      return {
        label: 'Rejeitado',
        iconName: 'XCircle' as const,
        className: 'bg-red-500/20 text-red-700 dark:text-red-400',
        borderClassName: 'border-red-500/30 bg-red-500/5'
      };
  }
};

export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

export const getStoragePath = (fullUrl: string): string | null => {
  try {
    const url = new URL(fullUrl);
    const pathParts = url.pathname.split('/vault-documents/');
    if (pathParts.length > 1) {
      return decodeURIComponent(pathParts[1]);
    }
    return null;
  } catch (e) {
    console.error('Error parsing URL:', e);
    return null;
  }
};

export const STATUS_ICONS = {
  AlertCircle: 'AlertCircle',
  Clock: 'Clock',
  CheckCircle2: 'CheckCircle2',
  XCircle: 'XCircle',
} as const;
