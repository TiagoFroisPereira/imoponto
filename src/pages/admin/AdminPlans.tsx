import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { Edit, RefreshCw, Plus, Trash2, Zap, LayoutGrid } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Product {
  id: string;
  key: string;
  name: string;
  description: string;
  price: number;
  yearly_price: number;
  stripe_price_id: string | null;
  stripe_yearly_price_id: string | null;
  type: 'plan' | 'addon';
  active: boolean;
}

export default function AdminPlans() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [syncing, setSyncing] = useState<string | null>(null);

  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('plans_addons')
      .select('*')
      .order('type', { ascending: false })
      .order('price', { ascending: true });

    if (error) {
      console.error("Error fetching products:", error);
      toast({ title: "Erro ao carregar produtos", variant: "destructive" });
    } else {
      setProducts(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSave = async () => {
    if (!editProduct) return;

    const { error } = await supabase
      .from('plans_addons')
      .upsert(editProduct);

    if (error) {
      console.error("Error saving product:", error);
      toast({ title: "Erro ao guardar produto", variant: "destructive" });
    } else {
      toast({ title: "Produto guardado com sucesso" });
      fetchProducts();
      setEditProduct(null);
    }
  };

  const toggleActive = async (product: Product) => {
    const { error } = await supabase
      .from('plans_addons')
      .update({ active: !product.active })
      .eq('id', product.id);

    if (error) {
      toast({ title: "Erro ao atualizar estado", variant: "destructive" });
    } else {
      fetchProducts();
    }
  };

  const syncWithStripe = async (productKey: string) => {
    setSyncing(productKey);
    try {
      const { data, error } = await supabase.functions.invoke('manage-stripe-products', {
        body: { productKey }
      });

      if (error) throw error;

      toast({ title: "Sincronizado com Stripe", description: `Price ID: ${data.stripe_price_id}` });
      fetchProducts();
    } catch (error: any) {
      console.error("Sync error:", error);
      toast({
        title: "Erro na sincronização",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setSyncing(null);
    }
  };

  const plans = products.filter(p => p.type === 'plan');
  const addons = products.filter(p => p.type === 'addon');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Planos & Pagamentos</h1>
        <Button onClick={() => setEditProduct({
          id: crypto.randomUUID(),
          key: '',
          name: '',
          description: '',
          price: 0,
          yearly_price: 0,
          stripe_price_id: null,
          stripe_yearly_price_id: null,
          type: 'addon',
          active: true
        })}>
          <Plus className="w-4 h-4 mr-2" /> Novo Produto
        </Button>
      </div>

      <Tabs defaultValue="plans" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="plans" className="flex items-center gap-2">
            <LayoutGrid className="w-4 h-4" /> Planos
          </TabsTrigger>
          <TabsTrigger value="addons" className="flex items-center gap-2">
            <Zap className="w-4 h-4" /> Addons
          </TabsTrigger>
        </TabsList>

        <TabsContent value="plans">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {plans.map((plan) => (
              <ProductCard
                key={plan.id}
                product={plan}
                onEdit={() => setEditProduct({ ...plan })}
                onToggle={() => toggleActive(plan)}
                onSync={() => syncWithStripe(plan.key)}
                syncing={syncing === plan.key}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="addons">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {addons.map((addon) => (
              <ProductCard
                key={addon.id}
                product={addon}
                onEdit={() => setEditProduct({ ...addon })}
                onToggle={() => toggleActive(addon)}
                onSync={() => syncWithStripe(addon.key)}
                syncing={syncing === addon.key}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={!!editProduct} onOpenChange={() => setEditProduct(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editProduct?.key ? 'Editar Produto' : 'Novo Produto'}</DialogTitle>
          </DialogHeader>
          {editProduct && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Chave (ID único)</label>
                  <Input
                    value={editProduct.key}
                    onChange={(e) => setEditProduct({ ...editProduct, key: e.target.value })}
                    placeholder="ex: premium_addon"
                    disabled={!!products.find(p => p.id === editProduct.id)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Tipo</label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={editProduct.type}
                    onChange={(e) => setEditProduct({ ...editProduct, type: e.target.value as any })}
                  >
                    <option value="plan">Plano</option>
                    <option value="addon">Addon</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Nome</label>
                <Input value={editProduct.name} onChange={(e) => setEditProduct({ ...editProduct, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Descrição</label>
                <Input value={editProduct.description} onChange={(e) => setEditProduct({ ...editProduct, description: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Preço (€)</label>
                  <Input type="number" step="0.01" value={editProduct.price} onChange={(e) => setEditProduct({ ...editProduct, price: +e.target.value })} />
                </div>
                {editProduct.type === 'plan' && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Preço Anual (€)</label>
                    <Input type="number" step="0.01" value={editProduct.yearly_price} onChange={(e) => setEditProduct({ ...editProduct, yearly_price: +e.target.value })} />
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Stripe Price ID (Opcional)</label>
                <Input
                  value={editProduct.stripe_price_id || ''}
                  onChange={(e) => setEditProduct({ ...editProduct, stripe_price_id: e.target.value || null })}
                  placeholder="price_..."
                />
                <p className="text-[10px] text-muted-foreground">Deixe vazio para gerar automaticamente ao sincronizar.</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditProduct(null)}>Cancelar</Button>
            <Button onClick={handleSave}>Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ProductCard({ product, onEdit, onToggle, onSync, syncing }: {
  product: Product,
  onEdit: () => void,
  onToggle: () => void,
  onSync: () => void,
  syncing: boolean
}) {
  return (
    <Card className={!product.active ? "opacity-50" : ""}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="space-y-1">
          <CardTitle className="text-lg">{product.name}</CardTitle>
          <CardDescription className="text-xs font-mono">{product.key}</CardDescription>
        </div>
        {!product.active && <Badge variant="outline">Inativo</Badge>}
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-2xl font-bold">
          €{product.price}
          <span className="text-sm font-normal text-muted-foreground">
            {product.type === 'plan' ? "/mês" : " (unitário)"}
          </span>
        </div>
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground line-clamp-2 h-10">{product.description}</p>
          <div className="flex flex-col gap-1 pt-2">
            <div className="flex items-center gap-2">
              <Badge variant={product.stripe_price_id ? "secondary" : "destructive"} className="text-[10px]">
                {product.stripe_price_id ? "Linked to Stripe" : "No Stripe Price"}
              </Badge>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 pt-2">
          <Button variant="outline" size="sm" onClick={onEdit}>
            <Edit className="w-4 h-4 mr-1" /> Editar
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onSync}
            disabled={syncing}
          >
            <RefreshCw className={`w-4 h-4 mr-1 ${syncing ? 'animate-spin' : ''}`} /> Sync
          </Button>
          <Button
            variant={product.active ? "secondary" : "default"}
            size="sm"
            onClick={onToggle}
          >
            {product.active ? "Desativar" : "Ativar"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
