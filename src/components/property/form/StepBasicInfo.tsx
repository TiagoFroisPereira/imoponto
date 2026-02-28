import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { propertyTypes } from "./propertyFormConstants";

interface StepBasicInfoProps {
  title: string;
  setTitle: (v: string) => void;
  propertyType: string;
  setPropertyType: (v: string) => void;
  description: string;
  setDescription: (v: string) => void;
}

const StepBasicInfo = ({ title, setTitle, propertyType, setPropertyType, description, setDescription }: StepBasicInfoProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Informações Básicas</CardTitle>
        <CardDescription>Defina o título, tipo e descrição do seu imóvel</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label htmlFor="title">Título do Anúncio</Label>
          <Input id="title" autoFocus placeholder="Ex: Apartamento T3 com Vista Mar" value={title} onChange={(e) => setTitle(e.target.value)} className="mt-2" />
        </div>
        <div>
          <Label className="text-sm font-medium mb-3 block">Tipo de Imóvel</Label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {propertyTypes.map((type) => {
              const Icon = type.icon;
              return (
                <button key={type.id} type="button" onClick={() => setPropertyType(type.id)}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                    propertyType === type.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                  }`}>
                  <Icon className="h-6 w-6" />
                  <span className="text-sm font-medium">{type.label}</span>
                </button>
              );
            })}
          </div>
        </div>
        <div>
          <Label htmlFor="description">Descrição</Label>
          <Textarea id="description" placeholder="Descreva o seu imóvel em detalhe..." value={description} onChange={(e) => setDescription(e.target.value)} className="mt-2 min-h-32" />
        </div>
      </CardContent>
    </Card>
  );
};

export default StepBasicInfo;
