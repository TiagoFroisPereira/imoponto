import PropertyForm from "@/components/property/form/PropertyForm";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const CreateListing = () => {
  const navigate = useNavigate();

  const handleCancel = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/meus-imoveis");
    }
  };

  return (
    <div className="bg-muted/30">
      {/* Page Title & Actions */}
      <div className="sticky top-16 md:top-20 z-40 bg-background border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold">Criar Novo Anúncio</h1>
          <Button variant="ghost" size="sm" onClick={handleCancel} className="hidden sm:flex">
            Cancelar
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <PropertyForm mode="create" />
      </div>
    </div>
  );
};

export default CreateListing;
