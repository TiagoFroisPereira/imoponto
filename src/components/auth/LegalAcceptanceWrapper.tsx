import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { LegalAcceptanceModal } from "./LegalAcceptanceModal";

interface LegalAcceptanceWrapperProps {
    children: React.ReactNode;
}

export function LegalAcceptanceWrapper({ children }: LegalAcceptanceWrapperProps) {
    const [showModal, setShowModal] = useState(false);
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        const checkLegalAcceptance = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                
                if (!user) {
                    setIsChecking(false);
                    return;
                }

                // Check if user has accepted legal terms
                const { data, error } = await supabase
                    .from('user_legal_acceptances' as any)
                    .select('id')
                    .eq('user_id', user.id)
                    .maybeSingle();

                if (error) {
                    console.error('Error checking legal acceptance:', error);
                    setIsChecking(false);
                    return;
                }

                // If no acceptance record, show modal
                if (!data) {
                    setShowModal(true);
                }
            } catch (err) {
                console.error('Error in checkLegalAcceptance:', err);
            } finally {
                setIsChecking(false);
            }
        };

        checkLegalAcceptance();

        // Listen for auth state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN' && session?.user) {
                // Re-check when user signs in
                checkLegalAcceptance();
            } else if (event === 'SIGNED_OUT') {
                setShowModal(false);
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const handleAccepted = () => {
        setShowModal(false);
    };

    return (
        <>
            {children}
            <LegalAcceptanceModal open={showModal} onAccepted={handleAccepted} />
        </>
    );
}
