import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Home, Search, Loader2 } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/contexts/AuthContext";

export function UserSegmentationDialog() {
    const { user } = useAuth();
    const { profile, updateProfile, loading: profileLoading } = useProfile();
    const [open, setOpen] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {
        // Show dialog if user is logged in, profile is loaded, 
        // and they haven't chosen a role preference yet.
        if (user && !profileLoading && profile && !profile.user_role_preference) {
            setOpen(true);
        } else {
            setOpen(false);
        }
    }, [user, profile, profileLoading]);

    const handleSelectRole = async (role: 'buyer' | 'seller') => {
        setIsUpdating(true);
        try {
            await updateProfile({ user_role_preference: role });
            localStorage.removeItem('imoponto_user_intent');
            setOpen(false);
        } catch (error) {
            console.error("Error setting role preference:", error);
        } finally {
            setIsUpdating(false);
        }
    };

    if (!open) return null;

    return (
        <Dialog open={open} onOpenChange={(val) => {
            // Prevent closing without selection if possible, 
            // but if we must, we allow it (though it will reappear)
            if (!isUpdating) setOpen(val);
        }}>
            <DialogContent className="sm:max-w-[500px] border-none bg-[#020617] text-white p-0 overflow-hidden">
                <div className="absolute inset-0 bg-hero-gradient opacity-50 z-0" />

                <div className="relative z-10 p-8">
                    <DialogHeader className="mb-8">
                        <DialogTitle className="text-3xl font-black tracking-tighter text-center">
                            Bem-vindo à <span className="text-accent">ImoPonto</span>
                        </DialogTitle>
                        <DialogDescription className="text-blue-100/70 text-center text-lg mt-2">
                            O que pretende fazer hoje na plataforma?
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Button
                            variant="outline"
                            disabled={isUpdating}
                            onClick={() => handleSelectRole('seller')}
                            className="h-auto py-8 flex flex-col gap-4 bg-white/5 border-white/10 hover:bg-accent/10 hover:border-accent/40 transition-all duration-300 group"
                        >
                            <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Home className="w-8 h-8 text-accent" />
                            </div>
                            <div className="text-center">
                                <div className="font-black text-xl">Quero Vender</div>
                                <p className="text-xs text-blue-100/50 mt-1">Anunciar com 0% comissões</p>
                            </div>
                        </Button>

                        <Button
                            variant="outline"
                            disabled={isUpdating}
                            onClick={() => handleSelectRole('buyer')}
                            className="h-auto py-8 flex flex-col gap-4 bg-white/5 border-white/10 hover:bg-emerald-500/10 hover:border-emerald-500/40 transition-all duration-300 group"
                        >
                            <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Search className="w-8 h-8 text-emerald-400" />
                            </div>
                            <div className="text-center">
                                <div className="font-black text-xl text-emerald-400">Quero Comprar</div>
                                <p className="text-xs text-blue-100/50 mt-1">Encontrar a casa ideal</p>
                            </div>
                        </Button>
                    </div>

                    {isUpdating && (
                        <div className="absolute inset-0 bg-[#020617]/80 backdrop-blur-sm flex items-center justify-center z-20">
                            <Loader2 className="w-12 h-12 text-accent animate-spin" />
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
