import { useParams } from "react-router-dom";
import { PropertyAddonStore } from "@/components/property/PropertyAddonStore";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

export default function PropertyPowerups() {
    const { id } = useParams<{ id: string }>();

    const { data: property, isLoading } = useQuery({
        queryKey: ["property-info", id],
        queryFn: async () => {
            if (!id) return null;
            const { data, error } = await supabase
                .from("properties")
                .select("title, id")
                .eq("id", id)
                .single();
            if (error) throw error;
            return data;
        },
        enabled: !!id,
    });

    return (
        <div className="bg-background selection:bg-primary/10">
            <main className="pt-24 pb-24">
                <div className="container mx-auto px-4">
                    <div className="mb-12">
                        {isLoading ? (
                            <Skeleton className="h-10 w-64 mb-2" />
                        ) : (
                            <>
                                <h1 className="text-3xl font-bold mb-2">Power-ups: {property?.title}</h1>
                                <p className="text-muted-foreground">Adicione funcionalidades extra para vender mais rápido.</p>
                            </>
                        )}
                    </div>

                    {id && <PropertyAddonStore propertyId={id} />}
                </div>
            </main>
        </div>
    );
}
