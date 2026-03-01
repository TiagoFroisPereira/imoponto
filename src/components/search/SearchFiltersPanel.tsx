import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { MapPin, Search, X } from "lucide-react";
import { propertyTypes, conditions, energyCertifications } from "./searchConstants";
import type { SearchFiltersState, SearchFiltersActions } from "@/hooks/useSearchFilters";
import { useIsMobile } from "@/hooks/use-mobile";

interface SearchFiltersPanelProps {
  filters: SearchFiltersState;
  actions: SearchFiltersActions;
  formatPrice: (v: number) => string;
  availableDistritos: string[];
  getAvailableConcelhos: (distrito: string) => string[];
  showFilters: boolean;
  setShowFilters: (v: boolean) => void;
}

const FiltersContent = ({
  filters, actions, formatPrice, availableDistritos, getAvailableConcelhos, onApply,
}: Omit<SearchFiltersPanelProps, "showFilters" | "setShowFilters"> & { onApply?: () => void }) => {
  const availableConcelhos = filters.selectedDistrito && filters.selectedDistrito !== "all"
    ? getAvailableConcelhos(filters.selectedDistrito)
    : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Filtros</h2>
        <Button variant="ghost" size="sm" onClick={() => { actions.clearFilters(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
          <X className="h-4 w-4 mr-1" />
          Limpar
        </Button>
      </div>

      {/* Location */}
      <div>
        <Label className="text-sm font-medium mb-3 block">
          <MapPin className="w-4 h-4 inline mr-1" />
          Localização
        </Label>
        <div className="space-y-3">
          <Select value={filters.selectedDistrito} onValueChange={val => { actions.setSelectedDistrito(val); actions.setSelectedConcelho(""); }}>
            <SelectTrigger><SelectValue placeholder="Selecione o Distrito" /></SelectTrigger>
            <SelectContent className="max-h-64">
              <SelectItem value="all">Todos os Distritos</SelectItem>
              {availableDistritos.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
            </SelectContent>
          </Select>
          {filters.selectedDistrito && filters.selectedDistrito !== "all" && availableConcelhos.length > 0 && (
            <Select value={filters.selectedConcelho} onValueChange={actions.setSelectedConcelho}>
              <SelectTrigger><SelectValue placeholder="Selecione o Concelho" /></SelectTrigger>
              <SelectContent className="max-h-64">
                <SelectItem value="all">Todos os Concelhos</SelectItem>
                {availableConcelhos.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      {/* Property Type */}
      <div>
        <Label className="text-sm font-medium mb-3 block">Tipo de Imóvel</Label>
        <div className="grid grid-cols-2 gap-2">
          {propertyTypes.map(type => {
            const Icon = type.icon;
            const isSelected = filters.selectedTypes.includes(type.id);
            return (
              <button key={type.id} onClick={() => actions.toggleType(type.id)} className={`flex items-center gap-2 p-3 rounded-lg border text-sm transition-all ${isSelected ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-primary/50"}`}>
                <Icon className="h-4 w-4" />
                {type.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Condition */}
      <div>
        <Label className="text-sm font-medium mb-3 block">Estado</Label>
        <div className="flex flex-wrap gap-2">
          {conditions.map(condition => {
            const isSelected = filters.selectedConditions.includes(condition.id);
            return (
              <button key={condition.id} onClick={() => actions.toggleCondition(condition.id)} className={`px-4 py-2 rounded-full text-sm transition-all ${isSelected ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"}`}>
                {condition.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <Label className="text-sm font-medium mb-3 block">
          Preço: {formatPrice(filters.priceRange[0])} - {formatPrice(filters.priceRange[1])}
        </Label>
        <Slider value={filters.priceRange} onValueChange={actions.setPriceRange} max={2000000} step={10000} className="mt-2" />
      </div>

      {/* Area Range */}
      <div>
        <Label className="text-sm font-medium mb-3 block">
          Área Útil: {filters.areaRange[0]}m² - {filters.areaRange[1]}m²
        </Label>
        <Slider value={filters.areaRange} onValueChange={actions.setAreaRange} max={500} step={10} className="mt-2" />
      </div>

      {/* Bedrooms & Bathrooms */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-sm font-medium mb-2 block">Tipologia</Label>
          <Select value={filters.bedrooms} onValueChange={actions.setBedrooms}>
            <SelectTrigger><SelectValue placeholder="Todos" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {["0","1","2","3","4","5","6"].map(v => <SelectItem key={v} value={v}>{v === "6" ? "T6+" : `T${v}`}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-sm font-medium mb-2 block">Casas de Banho</Label>
          <Select value={filters.bathrooms} onValueChange={actions.setBathrooms}>
            <SelectTrigger><SelectValue placeholder="Todos" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {["1","2","3","4","5"].map(v => <SelectItem key={v} value={v}>{v}+</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="advanced">
          <AccordionTrigger className="text-sm font-medium">Filtros Avançados</AccordionTrigger>
          <AccordionContent className="space-y-4 pt-2">
            <div>
              <Label className="text-sm font-medium mb-2 block">Certificação Energética</Label>
              <Select value={filters.energyCert} onValueChange={actions.setEnergyCert}>
                <SelectTrigger><SelectValue placeholder="Todas" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {energyCertifications.map(cert => <SelectItem key={cert} value={cert}>{cert}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm font-medium mb-2 block">Ano de Construção</Label>
              <div className="grid grid-cols-2 gap-2">
                <Input placeholder="De" value={filters.yearFrom} onChange={e => actions.setYearFrom(e.target.value)} />
                <Input placeholder="Até" value={filters.yearTo} onChange={e => actions.setYearTo(e.target.value)} />
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium mb-2 block">Andar</Label>
              <Input placeholder="Ex: 3º" value={filters.floorNumber} onChange={e => actions.setFloorNumber(e.target.value)} />
            </div>
            <div className="space-y-3">
              <Label className="text-sm font-medium block">Comodidades</Label>
              <div className="space-y-2">
                {([
                  { checked: filters.hasGarage, onChange: actions.setHasGarage, label: "Garagem" },
                  { checked: filters.hasGarden, onChange: actions.setHasGarden, label: "Jardim" },
                  { checked: filters.hasPool, onChange: actions.setHasPool, label: "Piscina" },
                  { checked: filters.hasElevator, onChange: actions.setHasElevator, label: "Elevador" },
                  { checked: filters.hasAC, onChange: actions.setHasAC, label: "Ar Condicionado" },
                  { checked: filters.hasCentralHeating, onChange: actions.setHasCentralHeating, label: "Aquecimento Central" },
                  { checked: filters.petsAllowed, onChange: actions.setPetsAllowed, label: "Animais Permitidos" },
                ] as const).map(({ checked, onChange, label }) => (
                  <label key={label} className="flex items-center gap-2 cursor-pointer">
                    <Checkbox checked={checked} onCheckedChange={v => onChange(v as boolean)} />
                    <span className="text-sm">{label}</span>
                  </label>
                ))}
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <Button className="w-full" size="lg" onClick={() => {
        onApply?.();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }}>
        <Search className="h-4 w-4 mr-2" />
        Pesquisar
      </Button>
    </div>
  );
};

const SearchFiltersPanel = (props: SearchFiltersPanelProps) => {
  const isMobile = useIsMobile();

  // Mobile: Sheet overlay
  if (isMobile) {
    return (
      <Sheet open={props.showFilters} onOpenChange={props.setShowFilters}>
        <SheetContent side="left" className="w-[85vw] sm:max-w-sm overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Filtros</SheetTitle>
          </SheetHeader>
          <div className="mt-4">
            <FiltersContent
              filters={props.filters}
              actions={props.actions}
              formatPrice={props.formatPrice}
              availableDistritos={props.availableDistritos}
              getAvailableConcelhos={props.getAvailableConcelhos}
              onApply={() => props.setShowFilters(false)}
            />
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  // Desktop: static sidebar
  return (
    <aside className="hidden lg:block w-80 flex-shrink-0">
      <div className="bg-card rounded-xl border border-border p-6 sticky top-32 max-h-[calc(100vh-160px)] overflow-y-auto">
        <FiltersContent
          filters={props.filters}
          actions={props.actions}
          formatPrice={props.formatPrice}
          availableDistritos={props.availableDistritos}
          getAvailableConcelhos={props.getAvailableConcelhos}
        />
      </div>
    </aside>
  );
};

export default SearchFiltersPanel;
