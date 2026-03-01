import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";

export interface SearchFiltersState {
  searchQuery: string;
  selectedDistrito: string;
  selectedConcelho: string;
  selectedTypes: string[];
  selectedConditions: string[];
  priceRange: number[];
  areaRange: number[];
  bedrooms: string;
  bathrooms: string;
  energyCert: string;
  yearFrom: string;
  yearTo: string;
  floorNumber: string;
  sortBy: string;
  hasGarage: boolean;
  hasGarden: boolean;
  hasPool: boolean;
  hasElevator: boolean;
  hasAC: boolean;
  hasCentralHeating: boolean;
  petsAllowed: boolean;
}

export interface SearchFiltersActions {
  setSearchQuery: (v: string) => void;
  setSelectedDistrito: (v: string) => void;
  setSelectedConcelho: (v: string) => void;
  toggleType: (id: string) => void;
  toggleCondition: (id: string) => void;
  setPriceRange: (v: number[]) => void;
  setAreaRange: (v: number[]) => void;
  setBedrooms: (v: string) => void;
  setBathrooms: (v: string) => void;
  setEnergyCert: (v: string) => void;
  setYearFrom: (v: string) => void;
  setYearTo: (v: string) => void;
  setFloorNumber: (v: string) => void;
  setSortBy: (v: string) => void;
  setHasGarage: (v: boolean) => void;
  setHasGarden: (v: boolean) => void;
  setHasPool: (v: boolean) => void;
  setHasElevator: (v: boolean) => void;
  setHasAC: (v: boolean) => void;
  setHasCentralHeating: (v: boolean) => void;
  setPetsAllowed: (v: boolean) => void;
  clearFilters: () => void;
}

export function useSearchFilters() {
  const [searchParams, setSearchParams] = useSearchParams();

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
  const [hasGarage, setHasGarage] = useState(searchParams.get("garagem") === "1");
  const [hasGarden, setHasGarden] = useState(searchParams.get("jardim") === "1");
  const [hasPool, setHasPool] = useState(searchParams.get("piscina") === "1");
  const [hasElevator, setHasElevator] = useState(searchParams.get("elevador") === "1");
  const [hasAC, setHasAC] = useState(searchParams.get("ac") === "1");
  const [hasCentralHeating, setHasCentralHeating] = useState(searchParams.get("aquecimento") === "1");
  const [petsAllowed, setPetsAllowed] = useState(searchParams.get("animais") === "1");

  // URL sync
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

  const toggleType = useCallback((typeId: string) => {
    setSelectedTypes(prev => prev.includes(typeId) ? prev.filter(t => t !== typeId) : [...prev, typeId]);
  }, []);

  const toggleCondition = useCallback((conditionId: string) => {
    setSelectedConditions(prev => prev.includes(conditionId) ? prev.filter(c => c !== conditionId) : [...prev, conditionId]);
  }, []);

  const clearFilters = useCallback(() => {
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
  }, []);

  const formatPrice = useCallback((value: number) => {
    if (value >= 1000000) return `€${(value / 1000000).toFixed(1)}M`;
    return `€${(value / 1000).toFixed(0)}K`;
  }, []);

  const state: SearchFiltersState = {
    searchQuery, selectedDistrito, selectedConcelho, selectedTypes, selectedConditions,
    priceRange, areaRange, bedrooms, bathrooms, energyCert, yearFrom, yearTo, floorNumber,
    sortBy, hasGarage, hasGarden, hasPool, hasElevator, hasAC, hasCentralHeating, petsAllowed,
  };

  const actions: SearchFiltersActions = {
    setSearchQuery, setSelectedDistrito, setSelectedConcelho, toggleType, toggleCondition,
    setPriceRange, setAreaRange, setBedrooms, setBathrooms, setEnergyCert, setYearFrom,
    setYearTo, setFloorNumber, setSortBy, setHasGarage, setHasGarden, setHasPool,
    setHasElevator, setHasAC, setHasCentralHeating, setPetsAllowed, clearFilters,
  };

  return { ...state, ...actions, formatPrice };
}
