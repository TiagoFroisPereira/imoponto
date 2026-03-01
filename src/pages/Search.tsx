import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { usePublicProperties } from "@/hooks/usePublicProperties";
import { useSearchFilters } from "@/hooks/useSearchFilters";
import { useAvailableLocations } from "@/hooks/useAvailableLocations";
import SearchBar from "@/components/search/SearchBar";
import SearchFiltersPanel from "@/components/search/SearchFiltersPanel";
import SearchResults from "@/components/search/SearchResults";

const SearchPage = () => {
  const navigate = useNavigate();
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const { properties, loading } = usePublicProperties({});

  useEffect(() => {
    if (!loading && properties.length === 0) {
      navigate("/sem-comissoes");
    }
  }, [loading, properties, navigate]);
  const filters = useSearchFilters();
  const { availableDistritos, getAvailableConcelhos } = useAvailableLocations(properties);

  const filtersState = {
    searchQuery: filters.searchQuery,
    selectedDistrito: filters.selectedDistrito,
    selectedConcelho: filters.selectedConcelho,
    selectedTypes: filters.selectedTypes,
    selectedConditions: filters.selectedConditions,
    priceRange: filters.priceRange,
    areaRange: filters.areaRange,
    bedrooms: filters.bedrooms,
    bathrooms: filters.bathrooms,
    energyCert: filters.energyCert,
    yearFrom: filters.yearFrom,
    yearTo: filters.yearTo,
    floorNumber: filters.floorNumber,
    sortBy: filters.sortBy,
    hasGarage: filters.hasGarage,
    hasGarden: filters.hasGarden,
    hasPool: filters.hasPool,
    hasElevator: filters.hasElevator,
    hasAC: filters.hasAC,
    hasCentralHeating: filters.hasCentralHeating,
    petsAllowed: filters.petsAllowed,
  };

  const filtersActions = {
    setSearchQuery: filters.setSearchQuery,
    setSelectedDistrito: filters.setSelectedDistrito,
    setSelectedConcelho: filters.setSelectedConcelho,
    toggleType: filters.toggleType,
    toggleCondition: filters.toggleCondition,
    setPriceRange: filters.setPriceRange,
    setAreaRange: filters.setAreaRange,
    setBedrooms: filters.setBedrooms,
    setBathrooms: filters.setBathrooms,
    setEnergyCert: filters.setEnergyCert,
    setYearFrom: filters.setYearFrom,
    setYearTo: filters.setYearTo,
    setFloorNumber: filters.setFloorNumber,
    setSortBy: filters.setSortBy,
    setHasGarage: filters.setHasGarage,
    setHasGarden: filters.setHasGarden,
    setHasPool: filters.setHasPool,
    setHasElevator: filters.setHasElevator,
    setHasAC: filters.setHasAC,
    setHasCentralHeating: filters.setHasCentralHeating,
    setPetsAllowed: filters.setPetsAllowed,
    clearFilters: filters.clearFilters,
  };

  return (
    <div className="bg-background">
      <SearchBar
        searchQuery={filters.searchQuery}
        setSearchQuery={filters.setSearchQuery}
        viewMode={viewMode}
        setViewMode={setViewMode}
        onToggleFilters={() => setShowFilters(true)}
      />

      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-6">
          <SearchFiltersPanel
            filters={filtersState}
            actions={filtersActions}
            formatPrice={filters.formatPrice}
            availableDistritos={availableDistritos}
            getAvailableConcelhos={getAvailableConcelhos}
            showFilters={showFilters}
            setShowFilters={setShowFilters}
          />

          <SearchResults
            properties={properties}
            loading={loading}
            filters={filtersState}
            setSortBy={filters.setSortBy}
            viewMode={viewMode}
          />
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
