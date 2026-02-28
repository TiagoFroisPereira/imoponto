import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Image, X, Check, Plus, Video, Play, Lock } from "lucide-react";
import type { UploadedImage } from "./propertyFormConstants";
import type { PlanLimits } from "@/hooks/usePlanLimits";

interface StepMediaProps {
  images: UploadedImage[];
  videos: any[];
  virtualTourUrl: string;
  setVirtualTourUrl: (v: string) => void;
  limits: PlanLimits;
  hasFeature: (f: string) => boolean;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onVideoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  removeImage: (id: string) => void;
  removeVideo: (id: string) => void;
  setMainImage: (id: string) => void;
  openPlanModal: (title: string, desc: string) => void;
}

const StepMedia = ({
  images, videos, virtualTourUrl, setVirtualTourUrl,
  limits, hasFeature,
  onImageUpload, onVideoUpload, removeImage, removeVideo, setMainImage,
  openPlanModal,
}: StepMediaProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Fotografias e Vídeo</CardTitle>
        <CardDescription>Adicione média de qualidade para atrair mais interessados</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Images Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-base font-semibold">Fotografias (Máx. {limits.photos})</Label>
            <Button type="button" variant="outline" size="sm" onClick={() => document.getElementById('image-upload')?.click()} disabled={images.length >= limits.photos}>
              <Plus className="w-4 h-4 mr-2" /> Adicionar
            </Button>
          </div>
          <div className="border-2 border-dashed rounded-xl p-8 text-center hover:border-primary/50 transition-colors bg-muted/20">
            <input type="file" accept="image/*" multiple onChange={onImageUpload} className="hidden" id="image-upload" />
            <label htmlFor="image-upload" className="cursor-pointer">
              <Image className="h-10 w-10 mx-auto mb-3 text-muted-foreground opacity-50" />
              <p className="text-sm font-medium mb-1">Arraste ou clique para carregar</p>
              <p className="text-xs text-muted-foreground">PNG, JPG até 10MB ({images.length}/{limits.photos})</p>
            </label>
          </div>

          {images.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
              {images.map((img) => (
                <div key={img.id} className={`relative group rounded-xl overflow-hidden border-2 transition-all ${img.isMain ? "border-primary shadow-md" : "border-border shadow-sm"}`}>
                  <img src={img.preview} alt={img.name} className="w-full aspect-square object-cover" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                    {!img.isMain && (
                      <Button size="icon" variant="secondary" className="h-7 w-7" onClick={() => setMainImage(img.id)}><Check className="h-3.5 w-3.5" /></Button>
                    )}
                    <Button size="icon" variant="destructive" className="h-7 w-7" onClick={() => removeImage(img.id)}><X className="h-3.5 w-3.5" /></Button>
                  </div>
                  {img.isMain && <Badge className="absolute top-1.5 left-1.5 px-1.5 py-0.5 text-[9px] bg-primary uppercase tracking-tight">Capa</Badge>}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Videos Section */}
        <div className="space-y-4 pt-6 border-t font-sans">
          <div className="flex items-center justify-between">
            <Label className="text-base font-semibold">Vídeos (Máx. {limits.videos})</Label>
            <Button type="button" variant="outline" size="sm" onClick={() => document.getElementById('video-upload')?.click()} disabled={videos.length >= limits.videos}>
              <Plus className="w-4 h-4 mr-2" /> Adicionar
            </Button>
          </div>
          <input type="file" accept="video/*" multiple onChange={onVideoUpload} className="hidden" id="video-upload" />

          {videos.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {videos.map((video) => (
                <div key={video.id} className="relative group aspect-video bg-muted rounded-xl overflow-hidden border border-border shadow-sm">
                  <video src={video.url} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Play className="w-10 h-10 text-white fill-white" />
                  </div>
                  <button type="button" onClick={() => removeVideo(video.id)} className="absolute top-2 right-2 p-1.5 bg-background/80 hover:bg-destructive hover:text-white rounded-full transition-colors shadow-sm">
                    <X className="w-4 h-4" />
                  </button>
                  <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                    <p className="text-[10px] text-white truncate font-medium">{video.name}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="border-2 border-dashed rounded-xl p-8 text-center bg-muted/20 hover:bg-muted/30 transition-colors cursor-pointer" onClick={() => document.getElementById('video-upload')?.click()}>
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <Video className="w-5 h-5 text-primary" />
              </div>
              <p className="text-sm font-medium mb-1">Demonstre o seu imóvel em movimento</p>
              <p className="text-xs text-muted-foreground mb-3">Imóveis com vídeo têm 3x mais visibilidade.</p>
              <Badge variant="secondary" className="px-2 py-0.5 text-[10px] font-semibold bg-primary/10 text-primary border-none">
                {limits.videos === 0 ? "Upgrade para vídeo" : `Até ${limits.videos} vídeo`}
              </Badge>
            </div>
          )}
        </div>

        {/* 3D Virtual Tour Section */}
        <div className="space-y-4 pt-6 border-t">
          <div className="flex items-center justify-between">
            <Label className="text-base font-semibold flex items-center gap-2">
              Visita Virtual 3D
              {!hasFeature('3d_virtual_tour') && <Badge variant="secondary" className="text-[10px] h-4 bg-amber-500/10 text-amber-600 border-amber-500/20">PRO</Badge>}
            </Label>
          </div>
          <div className="relative group">
            <Input
              placeholder="Link para a visita virtual (ex: Matterport, Kuula...)"
              value={virtualTourUrl}
              onChange={(e) => setVirtualTourUrl(e.target.value)}
              disabled={!hasFeature('3d_virtual_tour')}
              className={!hasFeature('3d_virtual_tour') ? "pr-10 bg-muted/30" : ""}
            />
            {!hasFeature('3d_virtual_tour') && (
              <div className="absolute inset-x-0 inset-y-0 z-10 flex items-center justify-end pr-3">
                <Button
                  variant="ghost" size="sm" type="button"
                  className="h-7 text-[10px] font-bold text-primary hover:bg-primary/10"
                  onClick={() => openPlanModal("Visita Virtual 3D", "Destaque o seu imóvel com uma visita virtual 3D imersiva. Pode desbloquear esta funcionalidade com o Power-up de Vídeo & 3D ou aderir ao plano Profissional Pro.")}
                >
                  <Lock className="w-3 h-3 mr-1" /> UPGRADE
                </Button>
              </div>
            )}
          </div>
          <p className="text-xs text-muted-foreground">Adicione um link para a sua visita virtual 3D (Matterport, Kuula, etc).</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default StepMedia;
