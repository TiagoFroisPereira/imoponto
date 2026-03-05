import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useProperties } from "@/hooks/useProperties";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Plus,
    ArrowLeft,
    Building2
} from "lucide-react";

import { PropertyWizard } from "@/components/property/wizard/PropertyWizard";
import { MyListingCard } from "@/components/property/MyListingCard";

export default function MyProperties() {
    const { properties, loading, deleteProperty, toggleStatus, refetch } = useProperties();
    const navigate = useNavigate();

    const [wizardProperty, setWizardProperty] = useState<{
        id: string;
        title: string;
    } | null>(null);

    const [selectedProperty, setSelectedProperty] = useState<{
        id: string;
        title: string;
    } | null>(null);

    if (loading) {
        return (
            <div className="bg-background min-h-screen">
                <div className="container mx-auto px-4 py-8">
                    <div className="flex items-center justify-between mb-8">
                        <Skeleton className="h-8 w-48" />
                        <Skeleton className="h-10 w-32" />
                    </div>
                    <div className="grid gap-6">
                        {[1, 2, 3].map(i => (
                            <Skeleton key={i} className="h-64 w-full rounded-3xl" />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // If a property is selected for wizard, show it inline
    if (wizardProperty) {
        return (
            <div className="bg-background min-h-screen">
                <div className="container mx-auto px-4 py-8">
                    <div className="flex items-center gap-4 mb-6">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setWizardProperty(null)}
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Voltar a Imóveis
                        </Button>
                        <div>
                            <h2 className="text-xl font-semibold text-foreground">{wizardProperty.title}</h2>
                            <p className="text-sm text-muted-foreground">Progresso da Venda</p>
                        </div>
                    </div>

                    <PropertyWizard
                        propertyId={wizardProperty.id}
                        propertyTitle={wizardProperty.title}
                        currentStep={properties.find(p => p.id === wizardProperty.id)?.wizard_step || 0}
                        onUpdate={refetch}
                        status={properties.find(p => p.id === wizardProperty.id)?.status || 'pending'}
                        isInline={true}
                        propertyPrice={properties.find(p => p.id === wizardProperty.id)?.price}
                    />
                </div>
            </div>
        );
    }

    const publishedCount = properties.filter(p => p.status === 'active' || p.status === 'paused').length;
    const privateCount = properties.filter(p => p.status === 'private').length;

    return (
        <div className="bg-background min-h-screen">
            <div className="container mx-auto px-4 py-8">
                <div className="flex items-center gap-4 mb-6">
                    <Button variant="ghost" size="sm" asChild>
                        <Link to="/meu-perfil">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Voltar ao Perfil
                        </Link>
                    </Button>
                </div>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">Meus Imóveis</h1>
                        <p className="text-sm text-muted-foreground">
                            {properties.length} imóveis • {publishedCount} publicados • {privateCount} privados
                        </p>
                    </div>
                    <Button asChild className="rounded-2xl shadow-lg shadow-primary/20">
                        <Link to="/publicar">
                            <Plus className="w-4 h-4 mr-2" />
                            Novo Imóvel
                        </Link>
                    </Button>
                </div>

                {properties.length === 0 ? (
                    <Card className="rounded-3xl border-dashed border-2">
                        <CardContent className="py-16 text-center">
                            <Building2 className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
                            <h3 className="text-lg font-bold text-foreground">Ainda não tem imóveis</h3>
                            <p className="text-muted-foreground mt-2 mb-6 max-w-xs mx-auto">
                                Comece a vender o seu imóvel hoje mesmo com o apoio da Imoponto.
                            </p>
                            <Button asChild className="rounded-2xl">
                                <Link to="/publicar">
                                    <Plus className="w-4 h-4 mr-2" />
                                    Novo Imóvel
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-6">
                        {properties.map((listing) => (
                            <MyListingCard
                                key={listing.id}
                                listing={listing}
                                onCardClick={(listing) => {
                                    if (listing.status === 'private') {
                                        setWizardProperty({ id: listing.id, title: listing.title });
                                    } else {
                                        navigate(`/imovel/${listing.id}`);
                                    }
                                }}
                                onWizardClick={(listing) => setWizardProperty({ id: listing.id, title: listing.title })}
                                onVaultClick={(listing) => navigate(`/imovel/${listing.id}/documentos`)}
                                onPublishClick={(id) => navigate(`/publicar-imovel/${id}`)}
                                onToggleStatus={toggleStatus}
                                onDelete={deleteProperty}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
