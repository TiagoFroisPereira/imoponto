import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { Edit, Trash2 } from "lucide-react";

interface Plan {
  id: string;
  name: string;
  price: number;
  yearlyPrice: number;
  maxListings: number;
  highlights: number;
  autoRenew: boolean;
  active: boolean;
}

const defaultPlans: Plan[] = [
  { id: "free", name: "Plano Free", price: 0, yearlyPrice: 0, maxListings: 1, highlights: 0, autoRenew: false, active: true },
  { id: "start", name: "Plano Start", price: 9.9, yearlyPrice: 99, maxListings: 3, highlights: 1, autoRenew: true, active: true },
  { id: "pro", name: "Plano Pro", price: 19.9, yearlyPrice: 199, maxListings: 10, highlights: 3, autoRenew: true, active: true },
];

export default function AdminPlans() {
  const [plans, setPlans] = useState<Plan[]>(defaultPlans);
  const [editPlan, setEditPlan] = useState<Plan | null>(null);

  const handleSave = () => {
    if (!editPlan) return;
    setPlans((prev) => prev.map((p) => (p.id === editPlan.id ? editPlan : p)));
    toast({ title: "Plano atualizado" });
    setEditPlan(null);
  };

  const toggleActive = (id: string) => {
    setPlans((prev) =>
      prev.map((p) => (p.id === id ? { ...p, active: !p.active } : p))
    );
    toast({ title: "Estado do plano atualizado" });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Planos & Pagamentos</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {plans.map((plan) => (
          <Card key={plan.id} className={!plan.active ? "opacity-50" : ""}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg">{plan.name}</CardTitle>
              {!plan.active && <Badge variant="outline">Inativo</Badge>}
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-2xl font-bold">€{plan.price}<span className="text-sm font-normal text-muted-foreground">/mês</span></div>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>Até {plan.maxListings} anúncios</p>
                <p>{plan.highlights} destaques</p>
                <p>Renovação: {plan.autoRenew ? "Automática" : "Manual"}</p>
              </div>
              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={() => setEditPlan({ ...plan })}>
                  <Edit className="w-4 h-4 mr-1" /> Editar
                </Button>
                <Button
                  variant={plan.active ? "secondary" : "default"}
                  size="sm"
                  onClick={() => toggleActive(plan.id)}
                >
                  {plan.active ? "Desativar" : "Ativar"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={!!editPlan} onOpenChange={() => setEditPlan(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Editar Plano</DialogTitle></DialogHeader>
          {editPlan && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Nome</label>
                <Input value={editPlan.name} onChange={(e) => setEditPlan({ ...editPlan, name: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium">Preço Mensal (€)</label>
                  <Input type="number" value={editPlan.price} onChange={(e) => setEditPlan({ ...editPlan, price: +e.target.value })} />
                </div>
                <div>
                  <label className="text-sm font-medium">Preço Anual (€)</label>
                  <Input type="number" value={editPlan.yearlyPrice} onChange={(e) => setEditPlan({ ...editPlan, yearlyPrice: +e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium">Nº Anúncios</label>
                  <Input type="number" value={editPlan.maxListings} onChange={(e) => setEditPlan({ ...editPlan, maxListings: +e.target.value })} />
                </div>
                <div>
                  <label className="text-sm font-medium">Nº Destaques</label>
                  <Input type="number" value={editPlan.highlights} onChange={(e) => setEditPlan({ ...editPlan, highlights: +e.target.value })} />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Renovação automática</span>
                <Switch checked={editPlan.autoRenew} onCheckedChange={(c) => setEditPlan({ ...editPlan, autoRenew: c })} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditPlan(null)}>Cancelar</Button>
            <Button onClick={handleSave}>Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
