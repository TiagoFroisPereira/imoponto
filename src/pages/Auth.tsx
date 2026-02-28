import { Link, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Home } from "lucide-react";
import { AuthForm } from "@/components/auth/AuthForm";
import { NewPasswordForm } from "@/components/auth/NewPasswordForm";

const Auth = () => {
  const [searchParams] = useSearchParams();
  const isResetMode = searchParams.get("mode") === "reset";
  const defaultTab = searchParams.get("tab") === "register" ? "register" : "login";

  // The recovery flow is handled differently as it's a distinct mode often coming from email links
  // But we can also handle it within AuthForm if we want, for now let's keep the structure simple
  // Actually, AuthForm handles recovery internally too, but for "reset mode" (entering new password) 
  // we might want to keep the logic here or pass a prop to AuthForm. 
  // Looking at the previous code, "reset mode" was for ENETERING the new password.
  // AuthForm currently has logic for REQUESTING recovery (sending email).
  // The logic for entering new password was in `handleNewPassword`. 
  // Let's check `AuthForm` again... it handles `handleRecovery` (sending email).
  // But `isResetMode` in the original file rendered a "Nova Password" form.
  // We missed extracting that part into AuthForm or a separate component.
  // Let's keep the "Nova Password" logic in AuthForm? Or separate? 
  // For now let's delegate the main auth to AuthForm, and since we didn't extract NewPassword logic yet, 
  // I should probably quickly check if I can add it to AuthForm or if I should just keep it here for now.
  // The original Auth.tsx had a `if (isResetMode)` block. 

  // Let's re-read the extracted AuthForm... 
  // It has `handleRecovery` (send email) but NOT `handleNewPassword` (update password).
  // So I should keep the New Password logic here or extract it too.
  // Given the user wants "Modal Auth", the "New Password" flow usually happens on a dedicated page anyway (clicked from email).
  // So keeping it here or in a separate component is fine. 

  // I will re-implement the "New Password" logic here using a separate component later if needed, 
  // but for now I will paste the "New Password" logic back here to ensure no regression, 
  // and use AuthForm for the main Login/Register flow.

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors mb-6 overflow-hidden max-h-32">
            <img src="/logo.png" alt="ImoPonto" className="h-64 w-auto object-contain -my-16" />
          </Link>
        </div>

        <Card className="border-border/50 shadow-elegant">
          <CardHeader className="text-center pb-2">
            {!isResetMode && (
              <>
                <CardTitle className="text-2xl font-heading">Bem-vindo</CardTitle>
                <CardDescription>
                  Aceda à sua conta ou crie uma nova
                </CardDescription>
              </>
            )}
            {isResetMode && (
              <>
                <CardTitle className="text-2xl font-heading">Nova Password</CardTitle>
                <CardDescription>
                  Defina a sua nova password de acesso
                </CardDescription>
              </>
            )}
          </CardHeader>
          <CardContent>
            {isResetMode ? (
              <NewPasswordForm />
            ) : (
              <AuthForm defaultTab={defaultTab} />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// We need to define NewPasswordForm locally or extract it. 
// For cleaner code, I'll define it here for now since I didn't verify it invalidates the goal of "Modal Auth" (it doesn't).
// Wait, I can't easily define it here without all the imports (useState, useAuth, etc).
// I should have extracted it.
// Let me pause this replacement and Extract `NewPasswordForm` first or include it in `Auth.tsx` properly.
// I'll rewrite `Auth.tsx` to include the necessary imports and the `NewPasswordForm` component inline for now to avoid breaking it,
// then I use `AuthForm` for the rest.

export default Auth;
