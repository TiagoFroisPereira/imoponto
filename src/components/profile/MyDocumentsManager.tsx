import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Building2,
  FolderOpen,
  ChevronRight,
  ArrowLeft,
  Eye,
  ShieldCheck,
} from "lucide-react";
import { useProperties } from "@/hooks/useProperties";
import { useBuyerVaultAccess } from "@/hooks/useBuyerVaultAccess";
import { Skeleton } from "@/components/ui/skeleton";
import PropertyVault from "@/components/property/vault/PropertyVault";

interface MyDocumentsManagerProps {
  userId?: string;
}

export function MyDocumentsManager({ userId }: MyDocumentsManagerProps) {
  const { properties, loading } = useProperties();
  const { data: buyerVaultProperties = [], isLoading: buyerLoading } = useBuyerVaultAccess();
  const [selectedProperty, setSelectedProperty] = useState<{
    id: string;
    title: string;
    address: string;
    isBuyerAccess?: boolean;
  } | null>(null);

  const isLoading = loading || buyerLoading;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
        </div>
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Skeleton className="w-12 h-12 rounded-lg" />
                <div className="flex-1">
                  <Skeleton className="h-5 w-48 mb-2" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // If a property is selected, show its vault
  if (selectedProperty) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedProperty(null)}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h2 className="text-xl font-semibold text-foreground">{selectedProperty.title}</h2>
            <div className="flex items-center gap-2">
              <p className="text-sm text-muted-foreground">{selectedProperty.address}</p>
              {selectedProperty.isBuyerAccess && (
                <Badge variant="secondary" className="text-xs">
                  <Eye className="w-3 h-3 mr-1" />
                  Acesso Comprador
                </Badge>
              )}
            </div>
          </div>
        </div>

        <PropertyVault
          propertyId={selectedProperty.id}
          propertyTitle={selectedProperty.title}
        />
      </div>
    );
  }

  const hasOwnProperties = properties.length > 0;
  const hasBuyerAccess = buyerVaultProperties.length > 0;
  const hasNothing = !hasOwnProperties && !hasBuyerAccess;

  if (hasNothing) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <FolderOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold text-foreground">Sem documentação</h3>
          <p className="text-muted-foreground mt-2">
            Crie um imóvel ou solicite acesso ao cofre de um imóvel para ver documentação aqui.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      {/* Own properties */}
      {hasOwnProperties && (
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Os Meus Imóveis</h2>
            <p className="text-sm text-muted-foreground">
              Selecione um imóvel para gerir o seu cofre digital
            </p>
          </div>

          <div className="grid gap-4">
            {properties.map((property) => (
              <Card
                key={property.id}
                className="cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => setSelectedProperty({
                  id: property.id,
                  title: property.title,
                  address: property.address,
                })}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium text-foreground">{property.title}</h3>
                        <p className="text-sm text-muted-foreground">{property.address}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            <FileText className="w-3 h-3 mr-1" />
                            Cofre Digital
                          </Badge>
                          <Badge variant={property.status === 'active' ? 'secondary' : 'outline'} className="text-xs">
                            {property.status === 'active' ? 'Ativo' : 'Pendente'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Buyer vault access */}
      {hasBuyerAccess && (
        <div className="space-y-4">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold text-foreground">Cofres com Acesso</h2>
            </div>
            <p className="text-sm text-muted-foreground">
              Imóveis cujo cofre digital lhe foi disponibilizado
            </p>
          </div>

          <div className="grid gap-4">
            {buyerVaultProperties.map((prop) => (
              <Card
                key={prop.accessId}
                className="cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => setSelectedProperty({
                  id: prop.id,
                  title: prop.title,
                  address: prop.address,
                  isBuyerAccess: true,
                })}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                        <Eye className="w-6 h-6 text-emerald-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-foreground">{prop.title}</h3>
                        <p className="text-sm text-muted-foreground">{prop.address}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-xs bg-emerald-500/10 text-emerald-600">
                            <ShieldCheck className="w-3 h-3 mr-1" />
                            Acesso Pago
                          </Badge>
                          {prop.expiresAt && (
                            <Badge variant="outline" className="text-xs">
                              Expira: {new Date(prop.expiresAt).toLocaleDateString("pt-PT")}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
