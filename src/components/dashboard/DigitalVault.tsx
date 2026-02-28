import { useState, useRef } from "react";
import { FileText, Lock, Unlock, Upload, Eye, Download, Trash2, FolderOpen, Loader2, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useVaultDocuments } from "@/hooks/useVaultDocuments";
import { useProperties } from "@/hooks/useProperties";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { DOCUMENT_CATEGORIES, getCategoryLabel, getCategoryWhereToGet } from "@/data/documentCategories";

export function DigitalVault() {
  const [selectedProperty, setSelectedProperty] = useState<string>("all");
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadPropertyId, setUploadPropertyId] = useState<string>("");
  const [uploadCategory, setUploadCategory] = useState<string>("outros");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { documents, loading, createDocument, deleteDocument, toggleVisibility } = useVaultDocuments();
  const { properties } = useProperties();
  const { toast } = useToast();

  const filteredDocuments = selectedProperty === "all" 
    ? documents 
    : documents.filter(doc => doc.property_id === selectedProperty);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "Ficheiro demasiado grande",
          description: "O tamanho máximo é 10MB",
          variant: "destructive"
        });
        return;
      }
      setSelectedFile(file);
      // Open dialog after file is selected
      setUploadDialogOpen(true);
    }
  };

  const handleUploadButtonClick = () => {
    // Directly open file explorer
    fileInputRef.current?.click();
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast({
        title: "Erro",
        description: "Selecione um ficheiro",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Erro",
          description: "Precisa estar autenticado",
          variant: "destructive"
        });
        return;
      }

      // Create unique file path: userId/timestamp-filename
      const timestamp = Date.now();
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${user.id}/${timestamp}-${selectedFile.name}`;

      // Upload to storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('vault-documents')
        .upload(fileName, selectedFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        toast({
          title: "Erro no upload",
          description: uploadError.message,
          variant: "destructive"
        });
        return;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('vault-documents')
        .getPublicUrl(fileName);

      // Create document record
      await createDocument({
        property_id: uploadPropertyId && uploadPropertyId !== "none" ? uploadPropertyId : undefined,
        name: selectedFile.name,
        file_type: fileExt || 'unknown',
        file_url: publicUrl,
        file_size: formatFileSize(selectedFile.size),
        is_public: false
      });

      // Reset form
      setSelectedFile(null);
      setUploadPropertyId("");
      setUploadCategory("outros");
      setUploadDialogOpen(false);
      
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao carregar o documento",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (doc: typeof documents[0]) => {
    // Extract file path from URL
    const urlParts = doc.file_url.split('/vault-documents/');
    if (urlParts.length > 1) {
      const filePath = urlParts[1];
      
      // Delete from storage
      await supabase.storage
        .from('vault-documents')
        .remove([filePath]);
    }
    
    // Delete from database
    await deleteDocument(doc.id);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="bg-card border border-border/50 rounded-xl p-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-4 py-4 border-b last:border-0">
              <Skeleton className="w-10 h-10 rounded-lg" />
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-5 w-24 ml-auto" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const UploadButton = () => (
    <>
      <Input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
        onChange={handleFileChange}
      />
      <Button variant="accent" onClick={handleUploadButtonClick}>
        <Upload className="w-4 h-4 mr-2" />
        Carregar Documento
      </Button>
      
      <Dialog open={uploadDialogOpen} onOpenChange={(open) => {
        setUploadDialogOpen(open);
        if (!open) {
          setSelectedFile(null);
          setUploadPropertyId("");
          setUploadCategory("outros");
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Configurar Documento</DialogTitle>
            <DialogDescription>
              Configure as opções do documento antes de carregar.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {selectedFile && (
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <FileText className="w-8 h-8 text-primary" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">{selectedFile.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatFileSize(selectedFile.size)}
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label>Imóvel (opcional)</Label>
              <Select value={uploadPropertyId} onValueChange={setUploadPropertyId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um imóvel" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sem imóvel associado</SelectItem>
                  {properties.map((property) => (
                    <SelectItem key={property.id} value={property.id}>
                      {property.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select value={uploadCategory} onValueChange={setUploadCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <TooltipProvider>
                    {DOCUMENT_CATEGORIES.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        <div className="flex items-center gap-2">
                          <span>{cat.label}</span>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="w-3.5 h-3.5 text-muted-foreground hover:text-primary cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent side="right" className="max-w-xs">
                              <p className="text-xs">{cat.whereToGet}</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </SelectItem>
                    ))}
                  </TooltipProvider>
                </SelectContent>
              </Select>
            </div>

            <Button 
              onClick={handleUpload} 
              disabled={!selectedFile || uploading}
              className="w-full"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  A carregar...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Carregar Documento
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );

  if (documents.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex justify-end">
          <UploadButton />
        </div>
        
        <div className="bg-card border border-border/50 rounded-xl p-12 text-center">
          <FolderOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold text-foreground">Cofre vazio</h3>
          <p className="text-muted-foreground mt-2">
            Os documentos dos seus imóveis aparecerão aqui.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Upload & Filter */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <select 
          className="px-4 py-2 rounded-lg border border-border bg-card text-foreground"
          value={selectedProperty}
          onChange={(e) => setSelectedProperty(e.target.value)}
        >
          <option value="all">Todos os imóveis</option>
          {properties.map((property) => (
            <option key={property.id} value={property.id}>{property.title}</option>
          ))}
        </select>
        <UploadButton />
      </div>

      {/* Documents List */}
      <div className="bg-card border border-border/50 rounded-xl overflow-hidden">
        <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-muted/50 text-sm font-medium text-muted-foreground border-b border-border/50">
          <div className="col-span-5">Documento</div>
          <div className="col-span-2">Imóvel</div>
          <div className="col-span-2">Visibilidade</div>
          <div className="col-span-1">Tamanho</div>
          <div className="col-span-2 text-right">Ações</div>
        </div>
        {filteredDocuments.map((doc) => (
          <div 
            key={doc.id}
            className="grid grid-cols-12 gap-4 px-4 py-4 items-center border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors"
          >
            <div className="col-span-5 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground">{doc.name}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(doc.created_at).toLocaleDateString('pt-PT')}
                </p>
              </div>
            </div>
            <div className="col-span-2 text-sm text-muted-foreground truncate">
              {doc.property?.title || 'Sem imóvel'}
            </div>
            <div className="col-span-2">
              <Badge 
                variant={doc.is_public ? "default" : "secondary"}
                className="gap-1 cursor-pointer"
                onClick={() => toggleVisibility(doc.id, doc.is_public)}
              >
                {doc.is_public ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                {doc.is_public ? "Público" : "Privado"}
              </Badge>
            </div>
            <div className="col-span-1 text-sm text-muted-foreground">
              {doc.file_size || '-'}
            </div>
            <div className="col-span-2 flex justify-end gap-1">
              <Button variant="ghost" size="icon" asChild>
                <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                  <Eye className="w-4 h-4" />
                </a>
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <a href={doc.file_url} download>
                  <Download className="w-4 h-4" />
                </a>
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-destructive"
                onClick={() => handleDelete(doc)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}