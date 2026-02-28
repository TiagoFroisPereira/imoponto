import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { PropertyVault } from "@/components/property/vault/PropertyVault";
import { usePropertyById } from "@/hooks/usePublicProperties";
import { useAuth } from "@/hooks/useAuth";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export default function PropertyDocuments() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { property, loading: propertyLoading } = usePropertyById(id);
    const { user, loading: authLoading } = useAuth();

    const isOwner = useMemo(() => {
        return user && property && user.id === property.user_id;
    }, [user, property]);

    // Check if current user has paid buyer access
    const { data: hasBuyerAccess, isLoading: buyerAccessLoading } = useQuery({
        queryKey: ['buyer-vault-page-access', id, user?.id],
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

    const isLoading = propertyLoading || authLoading;
    const isFullyLoading = isLoading || buyerAccessLoading;
    const hasAccess = isOwner || !!hasBuyerAccess;

    if (isFullyLoading) {
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

    if (!property || !hasAccess) {
        return (
            <div className="bg-background">
                <main className="container mx-auto px-4 py-20">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-foreground mb-4">Acesso não autorizado ou imóvel não encontrado</h1>
                        <Button onClick={() => navigate(`/imovel/${id}`)}>Voltar ao imóvel</Button>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="bg-background">
            <main className="container mx-auto px-4 py-8">
                <Button
                    variant="ghost"
                    onClick={() => navigate(`/imovel/${id}`)}
                    className="mb-6 flex items-center gap-2"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Voltar ao imóvel
                </Button>

                <PropertyVault
                    propertyId={property.id}
                    propertyTitle={property.title}
                />
            </main>
        </div>
    );
}
