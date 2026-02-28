import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Info, MapPin, Plus } from "lucide-react";
import { ConcelhoSelector } from "@/components/property/ConcelhoSelector";

interface StepDetailsProps {
  area: string; setArea: (v: string) => void;
  grossArea: string; setGrossArea: (v: string) => void;
  price: string; setPrice: (v: string) => void;
  postalCode: string; handlePostalCodeChange: (v: string) => void;
  isLoadingPostalCode: boolean;
  address: string; setAddress: (v: string) => void;
  distrito: string; setDistrito: (v: string) => void;
  concelho: string; setConcelho: (v: string) => void;
  bedrooms: string; setBedrooms: (v: string) => void;
  bathrooms: string; setBathrooms: (v: string) => void;
  floor: string; setFloor: (v: string) => void;
  yearBuilt: string; setYearBuilt: (v: string) => void;
  energyCert: string; setEnergyCert: (v: string) => void;
  condition: string; setCondition: (v: string) => void;
  hasGarage: boolean; setHasGarage: (v: boolean) => void;
  hasGarden: boolean; setHasGarden: (v: boolean) => void;
  hasPool: boolean; setHasPool: (v: boolean) => void;
  hasElevator: boolean; setHasElevator: (v: boolean) => void;
  hasAC: boolean; setHasAC: (v: boolean) => void;
  hasCentralHeating: boolean; setHasCentralHeating: (v: boolean) => void;
  petsAllowed: boolean; setPetsAllowed: (v: boolean) => void;
}

const StepDetails = (props: StepDetailsProps) => {
  const amenities = [
    { id: "garage", label: "Garagem", state: props.hasGarage, setState: props.setHasGarage },
    { id: "garden", label: "Jardim", state: props.hasGarden, setState: props.setHasGarden },
    { id: "pool", label: "Piscina", state: props.hasPool, setState: props.setHasPool },
    { id: "elevator", label: "Elevador", state: props.hasElevator, setState: props.setHasElevator },
    { id: "ac", label: "Ar Condicionado", state: props.hasAC, setState: props.setHasAC },
    { id: "heating", label: "Aquecimento Central", state: props.hasCentralHeating, setState: props.setHasCentralHeating },
    { id: "pets", label: "Animais Permitidos", state: props.petsAllowed, setState: props.setPetsAllowed },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Detalhes do Imóvel</CardTitle>
        <CardDescription>Adicione as características físicas e a localização exata</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Area & Price */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b"><div className="p-1.5 rounded-md bg-primary/10"><Info className="w-4 h-4 text-primary" /></div><h3 className="font-semibold text-lg">Área e Preço</h3></div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div><Label htmlFor="area">Área Útil (m²)</Label><Input id="area" type="number" placeholder="0" value={props.area} onChange={(e) => props.setArea(e.target.value)} className="mt-2" /></div>
            <div><Label htmlFor="grossArea">Área Bruta (m²)</Label><Input id="grossArea" type="number" placeholder="0" value={props.grossArea} onChange={(e) => props.setGrossArea(e.target.value)} className="mt-2" /></div>
          </div>
          <div><Label htmlFor="price">Preço de Venda</Label><div className="relative mt-2"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">€</span><Input id="price" type="number" placeholder="0" value={props.price} onChange={(e) => props.setPrice(e.target.value)} className="pl-8 text-lg font-semibold" /></div></div>
        </div>

        {/* Location */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b"><div className="p-1.5 rounded-md bg-primary/10"><MapPin className="w-4 h-4 text-primary" /></div><h3 className="font-semibold text-lg">Localização</h3></div>
          <div className="grid sm:grid-cols-3 gap-4">
            <div><Label htmlFor="postalCode">Código Postal</Label><div className="relative"><Input id="postalCode" placeholder="0000-000" value={props.postalCode} onChange={(e) => props.handlePostalCodeChange(e.target.value)} className="mt-2 pr-10" maxLength={8} />{props.isLoadingPostalCode && <div className="absolute right-3 top-1/2 -translate-y-1/2 mt-1"><div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" /></div>}</div></div>
            <div className="sm:col-span-2"><Label htmlFor="address">Morada Completa</Label><Input id="address" placeholder="Rua, número, andar" value={props.address} onChange={(e) => props.setAddress(e.target.value)} className="mt-2" /></div>
          </div>
          <ConcelhoSelector selectedDistrito={props.distrito} selectedConcelho={props.concelho} onDistritoChange={props.setDistrito} onConcelhoChange={props.setConcelho} area={parseFloat(props.area) || 0} price={parseFloat(props.price) || 0} />
        </div>

        {/* Typology */}
        <div className="space-y-6">
          <div className="grid sm:grid-cols-2 gap-8">
            <div className="space-y-3">
              <Label className="text-sm font-medium">Tipologia (Quartos)</Label>
              <ToggleGroup type="single" value={props.bedrooms} onValueChange={props.setBedrooms} className="justify-start gap-2 flex-wrap">
                {["0", "1", "2", "3", "4", "5", "6"].map((n) => (
                  <ToggleGroupItem key={n} value={n} className="w-12 h-12 rounded-lg border-2 data-[state=on]:border-primary data-[state=on]:bg-primary/5">{n === "0" ? "T0" : `T${n}`}</ToggleGroupItem>
                ))}
              </ToggleGroup>
            </div>
            <div className="space-y-3">
              <Label className="text-sm font-medium">Casas de Banho</Label>
              <ToggleGroup type="single" value={props.bathrooms} onValueChange={props.setBathrooms} className="justify-start gap-2 flex-wrap">
                {["1", "2", "3", "4", "5"].map((n) => (
                  <ToggleGroupItem key={n} value={n} className="w-12 h-12 rounded-lg border-2 data-[state=on]:border-primary data-[state=on]:bg-primary/5">{n}</ToggleGroupItem>
                ))}
              </ToggleGroup>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div><Label htmlFor="floor">Andar</Label><Input id="floor" placeholder="Ex: 3º" value={props.floor} onChange={(e) => props.setFloor(e.target.value)} className="mt-2" /></div>
            <div><Label htmlFor="yearBuilt">Ano de Construção</Label><Input id="yearBuilt" type="number" placeholder="2020" value={props.yearBuilt} onChange={(e) => props.setYearBuilt(e.target.value)} className="mt-2" /></div>
            <div><Label htmlFor="energyCert">Certificação Energética</Label>
              <Select value={props.energyCert} onValueChange={props.setEnergyCert}><SelectTrigger className="mt-2"><SelectValue placeholder="Selecionar" /></SelectTrigger><SelectContent>{["A+", "A", "B", "B-", "C", "D", "E", "F"].map((c) => (<SelectItem key={c} value={c}>{c}</SelectItem>))}</SelectContent></Select>
            </div>
            <div><Label htmlFor="condition">Estado do Imóvel</Label>
              <Select value={props.condition} onValueChange={props.setCondition}><SelectTrigger className="mt-2"><SelectValue placeholder="Selecionar" /></SelectTrigger><SelectContent><SelectItem value="new">Novo / Em construção</SelectItem><SelectItem value="used">Usado (Bom estado)</SelectItem><SelectItem value="renovated">Remodelado</SelectItem><SelectItem value="renovation">Para Renovar</SelectItem></SelectContent></Select>
            </div>
          </div>
        </div>

        {/* Amenities */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b"><div className="p-1.5 rounded-md bg-primary/10"><Plus className="w-4 h-4 text-primary" /></div><h3 className="font-semibold text-lg">Comodidades</h3></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {amenities.map((feature) => (
              <div key={feature.id} className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                <Checkbox id={feature.id} checked={feature.state} onCheckedChange={(checked) => feature.setState(checked === true)} />
                <label htmlFor={feature.id} className="text-sm font-medium leading-none cursor-pointer flex-1">{feature.label}</label>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StepDetails;
