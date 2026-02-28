import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Download, 
  Eye, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Building2,
  FolderOpen
} from "lucide-react";
import { useVaultDocuments } from "@/hooks/useVaultDocuments";
import { Skeleton } from "@/components/ui/skeleton";

interface MyDocumentsProps {
  userId?: string;
}

export function MyDocuments({ userId }: MyDocumentsProps) {
  const { documents, loading } = useVaultDocuments();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <Badge variant="secondary" className="bg-green-500/10 text-green-600">
            <CheckCircle className="w-3 h-3 mr-1" />
            Aprovado
          </Badge>
        );
      case "pending":
        return (
          <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-600">
            <Clock className="w-3 h-3 mr-1" />
            Pendente
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="secondary" className="bg-red-500/10 text-red-600">
            <AlertCircle className="w-3 h-3 mr-1" />
            Rejeitado
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary">
            {status}
          </Badge>
        );
    }
  };

  const groupedByProperty = documents.reduce((acc, doc) => {
    const propertyAddress = doc.property?.address || 'Sem imóvel associado';
    if (!acc[propertyAddress]) {
      acc[propertyAddress] = [];
    }
    acc[propertyAddress].push(doc);
    return acc;
  }, {} as Record<string, typeof documents>);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-6 w-24" />
        </div>
        {[1, 2].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-64" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[1, 2, 3].map((j) => (
                  <div key={j} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <Skeleton className="w-10 h-10 rounded-lg" />
                    <Skeleton className="h-5 w-48" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <FolderOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold text-foreground">Sem documentos</h3>
          <p className="text-muted-foreground mt-2">
            Os documentos dos seus imóveis aparecerão aqui.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Meus Documentos</h2>
          <p className="text-sm text-muted-foreground">
            Documentação de todos os seus imóveis
          </p>
        </div>
        <Badge variant="outline">
          {documents.length} documento{documents.length !== 1 ? "s" : ""}
        </Badge>
      </div>

      {Object.entries(groupedByProperty).map(([address, docs]) => (
        <Card key={address}>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary" />
              <CardTitle className="text-lg">{address}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {docs.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{doc.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Enviado em {new Date(doc.created_at).toLocaleDateString("pt-PT")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {getStatusBadge(doc.status)}
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                        <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                          <Eye className="w-4 h-4" />
                        </a>
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                        <a href={doc.file_url} download>
                          <Download className="w-4 h-4" />
                        </a>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
