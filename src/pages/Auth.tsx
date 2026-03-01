import { Link, useSearchParams, useNavigate, useLocation } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Home } from "lucide-react";
import { AuthForm } from "@/components/auth/AuthForm";
import { NewPasswordForm } from "@/components/auth/NewPasswordForm";

const Auth = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isResetMode = searchParams.get("mode") === "reset";
  const defaultTab = searchParams.get("tab") === "register" ? "register" : "login";

  const handleSuccess = () => {
    const from = (location.state as any)?.from?.pathname || "/";
    navigate(from, { replace: true });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
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
              <AuthForm defaultTab={defaultTab} onSuccess={handleSuccess} />
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
