import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Briefcase, CheckCircle } from "lucide-react";
import { ProfessionalRegistrationWizard } from "@/components/professional/registration/ProfessionalRegistrationWizard";

const BecomeProfessional = () => {
  const navigate = useNavigate();
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSuccess = () => {
    setIsSuccess(true);
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col bg-background">
        <main className="flex-1 pt-24 pb-16">
          <div className="container mx-auto px-4 max-w-2xl">
            <Card className="border-border/50 shadow-elegant">
              <CardContent className="pt-12 pb-8 text-center">
                <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-10 h-10 text-accent" />
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-4">
                  Registo Submetido com Sucesso!
                </h2>
                <p className="text-muted-foreground mb-8">
                  O seu perfil de profissional foi criado. Para ser visível na página de serviços,
                  complete o seu perfil com as informações adicionais.
                </p>
                <div className="flex gap-4 justify-center">
                  <Button variant="outline" onClick={() => navigate("/servicos")}>
                    Ver Marketplace
                  </Button>
                  <Button variant="accent" onClick={() => navigate("/completar-perfil-profissional")}>
                    Completar Perfil
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-background">
      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-2xl">
          {/* Hero */}
          <div className="text-center mb-12">
            <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-6">
              <Briefcase className="w-8 h-8 text-accent" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Tornar-me Profissional
            </h1>
            <p className="text-lg text-muted-foreground">
              Junte-se ao marketplace de serviços imobiliários e alcance novos clientes.
            </p>
          </div>

          <ProfessionalRegistrationWizard onSuccess={handleSuccess} />
        </div>
      </main>
    </div>
  );
};

export default BecomeProfessional;
