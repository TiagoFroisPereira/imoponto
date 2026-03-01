import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, SlidersHorizontal, Grid3X3, List } from "lucide-react";

interface SearchBarProps {
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  viewMode: "grid" | "list";
  setViewMode: (v: "grid" | "list") => void;
  onToggleFilters: () => void;
}

const SearchBar = ({ searchQuery, setSearchQuery, viewMode, setViewMode, onToggleFilters }: SearchBarProps) => {
  return (
    <div className="sticky top-20 md:top-28 z-40 bg-background/95 backdrop-blur border-b border-border">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center gap-4">
          <div className="flex-1 flex items-center gap-2">
            <div className="relative flex-1 max-w-2xl">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Pesquisar por localização, cidade ou código postal..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-10 h-12"
              />
            </div>
            <Button variant="outline" size="icon" className="h-12 w-12 lg:hidden" onClick={onToggleFilters}>
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
  );
};

export default SearchBar;
