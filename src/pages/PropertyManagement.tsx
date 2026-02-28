import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { PropertyWizard } from "@/components/property/wizard/PropertyWizard";
import { usePropertyById } from "@/hooks/usePublicProperties";
import { useAuth } from "@/hooks/useAuth";
import { useMemo } from "react";

export default function PropertyManagement() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { property, loading: propertyLoading, refetch } = usePropertyById(id);
    const { user, loading: authLoading } = useAuth();

    const isOwner = useMemo(() => {
        return user && property && user.id === property.user_id;
    }, [user, property]);

    const isLoading = propertyLoading || authLoading;

    if (isLoading) {
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

    if (!property || !isOwner) {
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

                <PropertyWizard
                    propertyId={property.id}
                    propertyTitle={property.title}
                    currentStep={property.wizard_step || 0}
                    open={true}
                    onOpenChange={() => { }}
                    onUpdate={refetch}
                    status={property.status}
                    isInline={true}
                    propertyPrice={property.price}
                />
            </main>
        </div>
    );
}
