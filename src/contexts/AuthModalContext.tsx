import React, { createContext, useContext, useState, useCallback } from "react";
import { AuthDialog } from "@/components/auth/AuthDialog";
import { useNavigate } from "react-router-dom";

interface AuthModalContextType {
    openAuthModal: (redirectPath?: string) => void;
    closeAuthModal: () => void;
}

const AuthModalContext = createContext<AuthModalContextType | undefined>(undefined);

export const AuthModalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [redirectPath, setRedirectPath] = useState<string | undefined>(undefined);
    const navigate = useNavigate();

    const openAuthModal = useCallback((path?: string) => {
        setRedirectPath(path);
        setIsOpen(true);
    }, []);

    const closeAuthModal = useCallback(() => {
        setIsOpen(false);
        setRedirectPath(undefined);
    }, []);

    const handleSuccess = useCallback(() => {
        setIsOpen(false);
        if (redirectPath) {
            navigate(redirectPath);
            setRedirectPath(undefined);
        }
    }, [redirectPath, navigate]);

    return (
        <AuthModalContext.Provider value={{ openAuthModal, closeAuthModal }}>
            {children}
            <AuthDialog
                open={isOpen}
                onOpenChange={setIsOpen}
                onSuccess={handleSuccess}
            />
        </AuthModalContext.Provider>
    );
};

export const useAuthModal = () => {
    const context = useContext(AuthModalContext);
    if (context === undefined) {
        throw new Error("useAuthModal must be used within an AuthModalProvider");
    }
    return context;
};
