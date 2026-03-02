import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import { ArrowLeft, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface AdminTopbarProps {
  onToggleSidebar?: () => void;
}

export function AdminTopbar({ onToggleSidebar }: AdminTopbarProps) {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="h-14 border-b border-border bg-card px-4 md:px-6 flex items-center justify-between sticky top-0 z-10">
      <div className="flex items-center gap-2">
        {onToggleSidebar && (
          <Button variant="ghost" size="sm" className="md:hidden" onClick={onToggleSidebar}>
            <Menu className="w-5 h-5" />
          </Button>
        )}
        <h2 className="text-sm font-medium text-muted-foreground">
          Admin Panel
        </h2>
      </div>
      <div className="flex items-center gap-2 md:gap-4">
        <span className="text-sm text-muted-foreground hidden md:inline">
          {format(new Date(), "d 'de' MMMM, yyyy", { locale: pt })}
        </span>
        <span className="text-sm font-medium text-foreground hidden sm:inline truncate max-w-[150px]">
          {user?.email}
        </span>
        <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
          <ArrowLeft className="w-4 h-4 mr-1" />
          <span className="hidden sm:inline">Voltar</span>
        </Button>
      </div>
    </header>
  );
}
