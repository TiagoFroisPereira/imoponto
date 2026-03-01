import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface SearchResultsHeaderProps {
  count: number;
  loading: boolean;
  sortBy: string;
  setSortBy: (v: string) => void;
}

const SearchResultsHeader = ({ count, loading, sortBy, setSortBy }: SearchResultsHeaderProps) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold">Imóveis</h1>
        <p className="text-muted-foreground">
          {loading ? "A carregar..." : `${count} resultados encontrados`}
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
  );
};

export default SearchResultsHeader;
