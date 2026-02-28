import { useState, useMemo, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import PropertyCard from "@/components/PropertyCard";
import type { DocumentationLevel } from "@/components/PropertyCard";
import { usePublicProperties } from "@/hooks/usePublicProperties";
import { distritos, getConcelhosForDistrito } from "@/data/portugalLocations";
import { Search, SlidersHorizontal, MapPin, Home, Building2, TreePine, Factory, Warehouse, X, Grid3X3, List, Loader2 } from "lucide-react";

const propertyTypes = [
  { id: "apartment", label: "Apartamento", icon: Building2 },
  { id: "house", label: "Moradia", icon: Home },
  { id: "land", label: "Terreno", icon: TreePine },
  { id: "office", label: "Escritório", icon: Factory },
  { id: "warehouse", label: "Armazém", icon: Warehouse },
];

const conditions = [
  { id: "new", label: "Novo / Em construção" },
  { id: "used", label: "Usado (Bom estado)" },
  { id: "renovated", label: "Remodelado" },
  { id: "renovation", label: "Para Renovar" },
];

const energyCertifications = ["A+", "A", "B", "B-", "C", "D", "E", "F"];

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(window.innerWidth >= 1024);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Initialize state from URL params
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [selectedDistrito, setSelectedDistrito] = useState(searchParams.get("distrito") || "");
  const [selectedConcelho, setSelectedConcelho] = useState(searchParams.get("concelho") || "");
  const [selectedTypes, setSelectedTypes] = useState<string[]>(() => {
    const types = searchParams.get("tipos");
    return types ? types.split(",") : [];
  });
  const [selectedConditions, setSelectedConditions] = useState<string[]>(() => {
    const conds = searchParams.get("condicoes");
    return conds ? conds.split(",") : [];
  });
  const [priceRange, setPriceRange] = useState<number[]>(() => {
    const min = searchParams.get("precoMin");
    const max = searchParams.get("precoMax");
    return [min ? parseInt(min) : 0, max ? parseInt(max) : 2000000];
  });
  const [areaRange, setAreaRange] = useState<number[]>(() => {
    const min = searchParams.get("areaMin");
    const max = searchParams.get("areaMax");
    return [min ? parseInt(min) : 0, max ? parseInt(max) : 500];
  });
  const [bedrooms, setBedrooms] = useState(searchParams.get("quartos") || "");
  const [bathrooms, setBathrooms] = useState(searchParams.get("wcs") || "");
  const [energyCert, setEnergyCert] = useState(searchParams.get("energia") || "");
  const [yearFrom, setYearFrom] = useState(searchParams.get("anoDe") || "");
  const [yearTo, setYearTo] = useState(searchParams.get("anoAte") || "");
  const [floorNumber, setFloorNumber] = useState(searchParams.get("piso") || "");
  const [sortBy, setSortBy] = useState(searchParams.get("ordenar") || "recent");
  const concelhos = selectedDistrito ? getConcelhosForDistrito(selectedDistrito) : [];

  // Amenities matching creation form
  const [hasGarage, setHasGarage] = useState(searchParams.get("garagem") === "1");
  const [hasGarden, setHasGarden] = useState(searchParams.get("jardim") === "1");
  const [hasPool, setHasPool] = useState(searchParams.get("piscina") === "1");
  const [hasElevator, setHasElevator] = useState(searchParams.get("elevador") === "1");
  const [hasAC, setHasAC] = useState(searchParams.get("ac") === "1");
  const [hasCentralHeating, setHasCentralHeating] = useState(searchParams.get("aquecimento") === "1");
  const [petsAllowed, setPetsAllowed] = useState(searchParams.get("animais") === "1");

  // Update URL params when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set("q", searchQuery);
    if (selectedDistrito) params.set("distrito", selectedDistrito);
    if (selectedConcelho) params.set("concelho", selectedConcelho);
    if (selectedTypes.length > 0) params.set("tipos", selectedTypes.join(","));
    if (selectedConditions.length > 0) params.set("condicoes", selectedConditions.join(","));
    if (priceRange[0] > 0) params.set("precoMin", priceRange[0].toString());
    if (priceRange[1] < 2000000) params.set("precoMax", priceRange[1].toString());
    if (areaRange[0] > 0) params.set("areaMin", areaRange[0].toString());
    if (areaRange[1] < 500) params.set("areaMax", areaRange[1].toString());
    if (bedrooms && bedrooms !== "all") params.set("quartos", bedrooms);
    if (bathrooms && bathrooms !== "all") params.set("wcs", bathrooms);
    if (energyCert && energyCert !== "all") params.set("energia", energyCert);
    if (yearFrom) params.set("anoDe", yearFrom);
    if (yearTo) params.set("anoAte", yearTo);
    if (floorNumber) params.set("piso", floorNumber);
    if (sortBy && sortBy !== "recent") params.set("ordenar", sortBy);
    if (hasGarage) params.set("garagem", "1");
    if (hasGarden) params.set("jardim", "1");
    if (hasPool) params.set("piscina", "1");
    if (hasElevator) params.set("elevador", "1");
    if (hasAC) params.set("ac", "1");
    if (hasCentralHeating) params.set("aquecimento", "1");
    if (petsAllowed) params.set("animais", "1");
    setSearchParams(params, { replace: true });
  }, [searchQuery, selectedDistrito, selectedConcelho, selectedTypes, selectedConditions, priceRange, areaRange, bedrooms, bathrooms, energyCert, yearFrom, yearTo, floorNumber, sortBy, hasGarage, hasGarden, hasPool, hasElevator, hasAC, hasCentralHeating, petsAllowed, setSearchParams]);

  const toggleType = (typeId: string) => {
    setSelectedTypes(prev => prev.includes(typeId) ? prev.filter(t => t !== typeId) : [...prev, typeId]);
  };
  const toggleCondition = (conditionId: string) => {
    setSelectedConditions(prev => prev.includes(conditionId) ? prev.filter(c => c !== conditionId) : [...prev, conditionId]);
  };

  const clearFilters = () => {
    setSelectedTypes([]);
    setSelectedConditions([]);
    setPriceRange([0, 2000000]);
    setAreaRange([0, 500]);
    setBedrooms("");
    setBathrooms("");
    setEnergyCert("");
    setYearFrom("");
    setYearTo("");
    setFloorNumber("");
    setHasGarage(false);
    setHasGarden(false);
    setHasPool(false);
    setHasElevator(false);
    setHasAC(false);
    setHasCentralHeating(false);
    setPetsAllowed(false);
    setSelectedDistrito("");
    setSelectedConcelho("");
    setSearchQuery("");
  };

  const formatPrice = (value: number) => {
    if (value >= 1000000) {
      return `€${(value / 1000000).toFixed(1)}M`;
    }
    return `€${(value / 1000).toFixed(0)}K`;
  };

  return (
    <div className="bg-background">

      {/* Search Bar */}
      <div className="sticky top-20 md:top-28 z-40 bg-background/95 backdrop-blur border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <div className="flex-1 flex items-center gap-2">
              <div className="relative flex-1 max-w-2xl">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input placeholder="Pesquisar por localização, cidade ou código postal..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10 h-12" />
              </div>
              <Button variant="outline" size="icon" className="h-12 w-12 lg:hidden" onClick={() => setShowFilters(!showFilters)}>
                <SlidersHorizontal className="h-5 w-5" />
              </Button>
            </div>
            <div className="hidden md:flex items-center gap-2 border rounded-lg p-1">
              <Button variant={viewMode === "grid" ? "default" : "ghost"} size="icon" className="h-8 w-8" onClick={() => setViewMode("grid")}>
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button variant={viewMode === "list" ? "default" : "ghost"} size="icon" className="h-8 w-8" onClick={() => setViewMode("list")}>
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Filters Sidebar */}
          <aside className={`${showFilters ? "block" : "hidden"} lg:block w-full lg:w-80 flex-shrink-0`}>
            <div className="bg-card rounded-xl border border-border p-6 sticky top-32 max-h-[calc(100vh-160px)] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold">Filtros</h2>
                <Button variant="ghost" size="sm" onClick={() => { clearFilters(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
                  <X className="h-4 w-4 mr-1" />
                  Limpar
                </Button>
              </div>

              {/* Location Filters */}
              <div className="mb-6">
                <Label className="text-sm font-medium mb-3 block">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  Localização
                </Label>
                <div className="space-y-3">
                  <Select value={selectedDistrito} onValueChange={val => { setSelectedDistrito(val); setSelectedConcelho(""); }}>
                    <SelectTrigger><SelectValue placeholder="Selecione o Distrito" /></SelectTrigger>
                    <SelectContent className="max-h-64">
                      <SelectItem value="all">Todos os Distritos</SelectItem>
                      {distritos.map(distrito => <SelectItem key={distrito.name} value={distrito.name}>{distrito.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  {selectedDistrito && selectedDistrito !== "all" && (
                    <Select value={selectedConcelho} onValueChange={setSelectedConcelho}>
                      <SelectTrigger><SelectValue placeholder="Selecione o Concelho" /></SelectTrigger>
                      <SelectContent className="max-h-64">
                        <SelectItem value="all">Todos os Concelhos</SelectItem>
                        {concelhos.map(concelho => <SelectItem key={concelho.name} value={concelho.name}>{concelho.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </div>

              {/* Property Type */}
              <div className="mb-6">
                <Label className="text-sm font-medium mb-3 block">Tipo de Imóvel</Label>
                <div className="grid grid-cols-2 gap-2">
                  {propertyTypes.map(type => {
                    const Icon = type.icon;
                    const isSelected = selectedTypes.includes(type.id);
                    return (
                      <button key={type.id} onClick={() => toggleType(type.id)} className={`flex items-center gap-2 p-3 rounded-lg border text-sm transition-all ${isSelected ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-primary/50"}`}>
                        <Icon className="h-4 w-4" />
                        {type.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Condition */}
              <div className="mb-6">
                <Label className="text-sm font-medium mb-3 block">Estado</Label>
                <div className="flex flex-wrap gap-2">
                  {conditions.map(condition => {
                    const isSelected = selectedConditions.includes(condition.id);
                    return (
                      <button key={condition.id} onClick={() => toggleCondition(condition.id)} className={`px-4 py-2 rounded-full text-sm transition-all ${isSelected ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"}`}>
                        {condition.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <Label className="text-sm font-medium mb-3 block">
                  Preço: {formatPrice(priceRange[0])} - {formatPrice(priceRange[1])}
                </Label>
                <Slider value={priceRange} onValueChange={setPriceRange} max={2000000} step={10000} className="mt-2" />
              </div>

              {/* Area Range */}
              <div className="mb-6">
                <Label className="text-sm font-medium mb-3 block">
                  Área Útil: {areaRange[0]}m² - {areaRange[1]}m²
                </Label>
                <Slider value={areaRange} onValueChange={setAreaRange} max={500} step={10} className="mt-2" />
              </div>

              {/* Bedrooms & Bathrooms */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <Label className="text-sm font-medium mb-2 block">Tipologia</Label>
                  <Select value={bedrooms} onValueChange={setBedrooms}>
                    <SelectTrigger><SelectValue placeholder="Todos" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="0">T0</SelectItem>
                      <SelectItem value="1">T1</SelectItem>
                      <SelectItem value="2">T2</SelectItem>
                      <SelectItem value="3">T3</SelectItem>
                      <SelectItem value="4">T4</SelectItem>
                      <SelectItem value="5">T5</SelectItem>
                      <SelectItem value="6">T6+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm font-medium mb-2 block">Casas de Banho</Label>
                  <Select value={bathrooms} onValueChange={setBathrooms}>
                    <SelectTrigger><SelectValue placeholder="Todos" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="1">1+</SelectItem>
                      <SelectItem value="2">2+</SelectItem>
                      <SelectItem value="3">3+</SelectItem>
                      <SelectItem value="4">4+</SelectItem>
                      <SelectItem value="5">5+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="advanced">
                  <AccordionTrigger className="text-sm font-medium">Filtros Avançados</AccordionTrigger>
                  <AccordionContent className="space-y-4 pt-2">
                    {/* Energy Certification */}
                    <div>
                      <Label className="text-sm font-medium mb-2 block">Certificação Energética</Label>
                      <Select value={energyCert} onValueChange={setEnergyCert}>
                        <SelectTrigger><SelectValue placeholder="Todas" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todas</SelectItem>
                          {energyCertifications.map(cert => <SelectItem key={cert} value={cert}>{cert}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Construction Year */}
                    <div>
                      <Label className="text-sm font-medium mb-2 block">Ano de Construção</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <Input placeholder="De" value={yearFrom} onChange={e => setYearFrom(e.target.value)} />
                        <Input placeholder="Até" value={yearTo} onChange={e => setYearTo(e.target.value)} />
                      </div>
                    </div>

                    {/* Floor */}
                    <div>
                      <Label className="text-sm font-medium mb-2 block">Andar</Label>
                      <Input placeholder="Ex: 3º" value={floorNumber} onChange={e => setFloorNumber(e.target.value)} />
                    </div>

                    {/* Amenities - matching creation form exactly */}
                    <div className="space-y-3">
                      <Label className="text-sm font-medium block">Comodidades</Label>
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <Checkbox checked={hasGarage} onCheckedChange={checked => setHasGarage(checked as boolean)} />
                          <span className="text-sm">Garagem</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <Checkbox checked={hasGarden} onCheckedChange={checked => setHasGarden(checked as boolean)} />
                          <span className="text-sm">Jardim</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <Checkbox checked={hasPool} onCheckedChange={checked => setHasPool(checked as boolean)} />
                          <span className="text-sm">Piscina</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <Checkbox checked={hasElevator} onCheckedChange={checked => setHasElevator(checked as boolean)} />
                          <span className="text-sm">Elevador</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <Checkbox checked={hasAC} onCheckedChange={checked => setHasAC(checked as boolean)} />
                          <span className="text-sm">Ar Condicionado</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <Checkbox checked={hasCentralHeating} onCheckedChange={checked => setHasCentralHeating(checked as boolean)} />
                          <span className="text-sm">Aquecimento Central</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <Checkbox checked={petsAllowed} onCheckedChange={checked => setPetsAllowed(checked as boolean)} />
                          <span className="text-sm">Animais Permitidos</span>
                        </label>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              <Button className="w-full mt-6" size="lg" onClick={() => {
                setShowFilters(false);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}>
                <Search className="h-4 w-4 mr-2" />
                Pesquisar
              </Button>
            </div>
          </aside>

          {/* Results */}
          <ResultsSection
            viewMode={viewMode}
            searchQuery={searchQuery}
            selectedTypes={selectedTypes}
            selectedConditions={selectedConditions}
            priceRange={priceRange}
            areaRange={areaRange}
            bedrooms={bedrooms}
            bathrooms={bathrooms}
            sortBy={sortBy}
            setSortBy={setSortBy}
            selectedDistrito={selectedDistrito}
            selectedConcelho={selectedConcelho}
            selectedEnergyCert={energyCert}
            yearFrom={yearFrom}
            yearTo={yearTo}
            floorNumber={floorNumber}
            hasGarage={hasGarage}
            hasGarden={hasGarden}
            hasPool={hasPool}
            hasElevator={hasElevator}
            hasAC={hasAC}
            hasCentralHeating={hasCentralHeating}
            petsAllowed={petsAllowed}
          />
        </div>
      </div>
    </div>
  );
};

function ResultsSection({
  viewMode,
  searchQuery,
  selectedTypes,
  selectedConditions,
  priceRange,
  areaRange,
  bedrooms,
  bathrooms,
  sortBy,
  setSortBy,
  selectedDistrito,
  selectedConcelho,
  selectedEnergyCert,
  yearFrom,
  yearTo,
  floorNumber,
  hasGarage,
  hasGarden,
  hasPool,
  hasElevator,
  hasAC,
  hasCentralHeating,
  petsAllowed,
}: {
  viewMode: "grid" | "list";
  searchQuery: string;
  selectedTypes: string[];
  selectedConditions: string[];
  priceRange: number[];
  areaRange: number[];
  bedrooms: string;
  bathrooms: string;
  sortBy: string;
  setSortBy: (value: string) => void;
  selectedDistrito: string;
  selectedConcelho: string;
  selectedEnergyCert: string;
  yearFrom: string;
  yearTo: string;
  floorNumber: string;
  hasGarage: boolean;
  hasGarden: boolean;
  hasPool: boolean;
  hasElevator: boolean;
  hasAC: boolean;
  hasCentralHeating: boolean;
  petsAllowed: boolean;
}) {
  const { properties, loading } = usePublicProperties({});

  const filteredProperties = useMemo(() => {
    let result = properties;

    // Search query filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(p => p.title.toLowerCase().includes(query) || p.location.toLowerCase().includes(query) || p.address.toLowerCase().includes(query));
    }

    // Location filter - Distrito
    if (selectedDistrito && selectedDistrito !== 'all') {
      const distLower = selectedDistrito.toLowerCase();
      result = result.filter(p => p.location.toLowerCase().includes(distLower) || p.address.toLowerCase().includes(distLower));
    }

    // Location filter - Concelho
    if (selectedConcelho && selectedConcelho !== 'all') {
      const concLower = selectedConcelho.toLowerCase();
      result = result.filter(p => p.location.toLowerCase().includes(concLower) || p.address.toLowerCase().includes(concLower));
    }

    // Property type filter
    if (selectedTypes.length > 0) {
      result = result.filter(p => selectedTypes.includes(p.property_type));
    }

    // Condition filter
    if (selectedConditions.length > 0) {
      result = result.filter(p => p.condition && selectedConditions.includes(p.condition));
    }

    // Price range filter
    result = result.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);

    // Area range filter
    result = result.filter(p => p.area >= areaRange[0] && p.area <= areaRange[1]);

    // Bedrooms filter
    if (bedrooms && bedrooms !== 'all') {
      const minBedrooms = parseInt(bedrooms);
      result = result.filter(p => p.bedrooms >= minBedrooms);
    }

    // Bathrooms filter
    if (bathrooms && bathrooms !== 'all') {
      const minBathrooms = parseInt(bathrooms);
      result = result.filter(p => p.bathrooms >= minBathrooms);
    }

    // Energy certification filter
    if (selectedEnergyCert && selectedEnergyCert !== 'all') {
      result = result.filter(p => p.energy_certification === selectedEnergyCert);
    }

    // Year of construction filter
    if (yearFrom) {
      const from = parseInt(yearFrom);
      result = result.filter(p => p.year_built && p.year_built >= from);
    }
    if (yearTo) {
      const to = parseInt(yearTo);
      result = result.filter(p => p.year_built && p.year_built <= to);
    }

    // Floor filter
    if (floorNumber) {
      const floorLower = floorNumber.toLowerCase();
      result = result.filter(p => p.floor && p.floor.toLowerCase().includes(floorLower));
    }

    // Boolean property filters
    if (hasGarage) result = result.filter(p => p.has_garage);
    if (hasGarden) result = result.filter(p => p.has_garden);
    if (hasPool) result = result.filter(p => p.has_pool);
    if (hasElevator) result = result.filter(p => p.has_elevator);
    if (hasAC) result = result.filter(p => p.has_ac);
    if (hasCentralHeating) result = result.filter(p => p.has_central_heating);
    if (petsAllowed) result = result.filter(p => p.pets_allowed);

    // Sort
    switch (sortBy) {
      case 'price-asc':
        result = [...result].sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result = [...result].sort((a, b) => b.price - a.price);
        break;
      case 'area-desc':
        result = [...result].sort((a, b) => b.area - a.area);
        break;
      case 'recent':
      default:
        result = [...result].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
    return result;
  }, [properties, searchQuery, selectedTypes, selectedConditions, priceRange, areaRange, bedrooms, bathrooms, sortBy, selectedDistrito, selectedConcelho, selectedEnergyCert, yearFrom, yearTo, floorNumber, hasGarage, hasGarden, hasPool, hasElevator, hasAC, hasCentralHeating, petsAllowed]);

  const formatPrice = (price: number) => `€ ${price.toLocaleString('pt-PT')}`;
  const isNew = (createdAt: string) => {
    const created = new Date(createdAt);
    const now = new Date();
    const diffDays = (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
    return diffDays <= 7;
  };

  return (
    <main className="flex-1 min-w-0">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Imóveis</h1>
          <p className="text-muted-foreground">
            {loading ? 'A carregar...' : `${filteredProperties.length} resultados encontrados`}
          </p>
        </div>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Ordenar por" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">Mais Recentes</SelectItem>
            <SelectItem value="price-asc">Preço: Menor</SelectItem>
            <SelectItem value="price-desc">Preço: Maior</SelectItem>
            <SelectItem value="area-desc">Área: Maior</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      )}

      {!loading && filteredProperties.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-muted-foreground text-lg mb-4">
            Nenhum imóvel encontrado com os filtros selecionados.
          </p>
          <Link to="/criar-anuncio">
            <Button>Publicar Imóvel</Button>
          </Link>
        </div>
      ) : !loading && (
        <div className={`grid gap-6 ${viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-3" : "grid-cols-1"}`}>
          {filteredProperties.map(property => (
            <div key={property.id} onClick={() => sessionStorage.setItem('fromImoveis', 'true')}>
              <PropertyCard
                id={property.id}
                image={property.image_url || property.images?.[0] || "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800"}
                title={property.title}
                location={property.location}
                price={formatPrice(property.price)}
                bedrooms={property.bedrooms}
                bathrooms={property.bathrooms}
                area={property.area}
                documentationLevel={property.documentation_level as DocumentationLevel}
                isNew={isNew(property.created_at)}
              />
            </div>
          ))}
        </div>
      )}

      {!loading && filteredProperties.length > 0 && (
        <div className="flex justify-center mt-8 gap-2">
          <Button variant="outline" disabled>Anterior</Button>
          <Button variant="default">1</Button>
          <Button variant="outline">Próximo</Button>
        </div>
      )}
    </main>
  );
}

export default SearchPage;
