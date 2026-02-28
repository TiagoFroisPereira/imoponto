import {
    Dialog,
    DialogContent,
    DialogTrigger,
} from "@/components/ui/dialog";
import { AuthForm } from "./AuthForm";

interface AuthDialogProps {
    trigger?: React.ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    onSuccess?: () => void;
    defaultTab?: "login" | "register";
}

export function AuthDialog({ trigger, open, onOpenChange, onSuccess, defaultTab = "login" }: AuthDialogProps) {
    const handleSuccess = () => {
        if (onSuccess) {
            onSuccess();
        } else {
            onOpenChange?.(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
            <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto w-full">
                <AuthForm
                    defaultTab={defaultTab}
                    onSuccess={handleSuccess}
                    showTitle={true}
                />
            </DialogContent>
        </Dialog>
    );
}
