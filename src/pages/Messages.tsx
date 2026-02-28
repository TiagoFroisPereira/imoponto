import { useNavigate, useSearchParams } from "react-router-dom";
import { useProfile } from "@/hooks/useProfile";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { MessagesInbox } from "@/components/profile/MessagesInbox";
import { useEffect } from "react";

export default function Messages() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { profile, loading } = useProfile();
    const propertyId = searchParams.get('propertyId') || undefined;

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
            <div className="container mx-auto px-4 py-8 max-w-6xl">
                <div className="space-y-6">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" onClick={() => navigate('/meu-perfil')}>
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Voltar ao Perfil
                        </Button>
                        <h1 className="text-2xl font-bold">Mensagens</h1>
                    </div>
                    <MessagesInbox userId={profile?.id} propertyId={propertyId} />
                </div>
            </div>
        </div>
    );
}
