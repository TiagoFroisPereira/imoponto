import { useCallback, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export interface VaultDocument {
  id: string;
  user_id: string;
  property_id: string | null;
  name: string;
  file_type: string;
  file_url: string;
  file_size: string | null;
  is_public: boolean;
  status: string;
  created_at: string;
  updated_at: string;
  property?: {
    id: string;
    title: string;
    address: string;
  };
}

export function useVaultDocuments() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: documents = [], isLoading: loading, refetch } = useQuery({
    queryKey: ['vault-documents', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await (supabase
        .from('vault_documents') as any)
        .select(`*, property:properties(id, title, address)`)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as VaultDocument[];
    },
    enabled: !!user?.id,
  });

  const invalidateDocuments = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['vault-documents', user?.id] });
  }, [queryClient, user?.id]);

  useEffect(() => {
    if (!user?.id) return;
    const channel = supabase
      .channel('vault-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'vault_documents', filter: `user_id=eq.${user.id}` }, () => invalidateDocuments())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user?.id, invalidateDocuments]);

  const createMutation = useMutation({
    mutationFn: async (document: Partial<VaultDocument>) => {
      if (!user) throw new Error('Unauthenticated');
      const { data, error } = await (supabase.from('vault_documents') as any).insert({ ...document, user_id: user.id }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      invalidateDocuments();
      toast({ title: "Sucesso", description: "Documento carregado com sucesso" });
    },
    onError: (err) => {
      console.error('Error creating document:', err);
      toast({ title: "Erro", description: "Não foi possível criar o documento", variant: "destructive" });
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string, updates: Partial<VaultDocument> }) => {
      const { error } = await (supabase.from('vault_documents') as any).update(updates).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      invalidateDocuments();
      toast({ title: "Sucesso", description: "Documento atualizado com sucesso" });
    },
    onError: (err) => {
      console.error('Error updating document:', err);
      toast({ title: "Erro", description: "Não foi possível atualizar o documento", variant: "destructive" });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase.from('vault_documents') as any).delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      invalidateDocuments();
      toast({ title: "Sucesso", description: "Documento eliminado com sucesso" });
    },
    onError: (err) => {
      console.error('Error deleting document:', err);
      toast({ title: "Erro", description: "Não foi possível eliminar o documento", variant: "destructive" });
    }
  });

  return {
    documents,
    loading,
    createDocument: createMutation.mutateAsync,
    updateDocument: (id: string, updates: Partial<VaultDocument>) => updateMutation.mutateAsync({ id, updates }),
    deleteDocument: deleteMutation.mutateAsync,
    toggleVisibility: (id: string, isPublic: boolean) => updateMutation.mutateAsync({ id, updates: { is_public: !isPublic } }),
    refetch
  };
}
