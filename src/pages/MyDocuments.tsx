import { useNavigate } from "react-router-dom";
import { useProfile } from "@/hooks/useProfile";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { MyDocumentsManager } from "@/components/profile/MyDocumentsManager";
import { useEffect } from "react";
import { usePlanLimits } from "@/hooks/usePlanLimits";
import { Lock, Zap } from "lucide-react";

export default function MyDocuments() {
    const navigate = useNavigate();
    const { profile, loading } = useProfile();
    const { hasFeature } = usePlanLimits();

    useEffect(() => {
        if (!loading && !profile) {
            navigate("/auth");
        }
    }, [profile, loading, navigate]);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }


    return (
        <div className="bg-background">
            <main className="container mx-auto px-4 py-8 max-w-6xl">
                <div className="space-y-6">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" onClick={() => navigate('/meu-perfil')}>
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Voltar ao Perfil
                        </Button>
                        <h1 className="text-2xl font-bold">Documentação</h1>
                    </div>
                    <MyDocumentsManager userId={profile?.id} />
                </div>
            </main>
        </div>
    );
}
