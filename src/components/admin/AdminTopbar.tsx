import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export function AdminTopbar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <header className="h-14 border-b border-border bg-card px-6 flex items-center justify-between sticky top-0 z-10">
      <h2 className="text-sm font-medium text-muted-foreground">
        Admin Panel
      </h2>
      <div className="flex items-center gap-4">
        <span className="text-sm text-muted-foreground">
          {format(new Date(), "d 'de' MMMM, yyyy", { locale: pt })}
        </span>
        <span className="text-sm font-medium text-foreground">
          {user?.email}
        </span>
        <Button variant="ghost" size="sm" onClick={handleLogout}>
          <LogOut className="w-4 h-4" />
        </Button>
      </div>
    </header>
  );
}
