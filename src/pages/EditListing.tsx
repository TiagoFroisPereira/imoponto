import { useNavigate, useParams } from "react-router-dom";
import PropertyForm from "@/components/property/form/PropertyForm";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface EditListingProps {
  mode?: 'edit' | 'publish';
}

const EditListing = ({ mode = 'edit' }: EditListingProps) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  return (
    <div className="bg-muted/30">
      {/* Page Header */}
      <div className="sticky top-16 md:top-20 z-40 bg-background border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={() => navigate('/meus-imoveis')}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-xl font-semibold">
                {mode === 'publish' ? "Publicar Anúncio" : "Editar Anúncio"}
              </h1>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <PropertyForm mode={mode} propertyId={id} />
      </div>
    </div>
  );
};

export default EditListing;
