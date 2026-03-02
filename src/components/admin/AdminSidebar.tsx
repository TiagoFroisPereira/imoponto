import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Building2,
  Briefcase,
  CreditCard,
  Settings,
  LogOut,
  ClipboardList,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";

const navItems = [
  { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/utilizadores", label: "Utilizadores", icon: Users },
  { to: "/admin/anuncios", label: "Anúncios", icon: Building2 },
  { to: "/admin/profissionais", label: "Profissionais", icon: Briefcase },
  { to: "/admin/planos", label: "Planos & Pagamentos", icon: CreditCard },
  { to: "/admin/logs", label: "Logs", icon: ClipboardList },
  { to: "/admin/definicoes", label: "Definições", icon: Settings },
];

interface AdminSidebarProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function AdminSidebar({ open, onOpenChange }: AdminSidebarProps) {
  const location = useLocation();
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const handleLogout = async () => {
    await signOut();
    navigate("/admin/login");
  };

  const sidebarContent = (
    <>
      <div className="p-4 border-b border-border">
        <span className="font-bold text-lg text-foreground tracking-tight">
          Imoponto
        </span>
      </div>

      <nav className="flex-1 py-4 space-y-1 px-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.to || location.pathname.startsWith(item.to + "/");
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => isMobile && onOpenChange?.(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="p-2 border-t border-border">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 w-full transition-colors"
        >
          <LogOut className="w-5 h-5 shrink-0" />
          <span>Logout</span>
        </button>
      </div>
    </>
  );

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="left" className="w-60 p-0 flex flex-col">
          {sidebarContent}
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <aside className="h-screen sticky top-0 bg-card border-r border-border flex flex-col w-60">
      {sidebarContent}
    </aside>
  );
}
