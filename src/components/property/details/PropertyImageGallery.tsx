import { useState, useEffect, useCallback } from "react";
import { Heart, Share2 } from "lucide-react";
import {
  DocumentationStatus,
  type DocumentationLevel,
} from "@/components/property/DocumentationStatus";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";

interface PropertyImageGalleryProps {
  images: string[];
  selectedImage: number;
  onSelectImage: (index: number) => void;
  documentationLevel: DocumentationLevel;
  isFavorite: boolean;
  isAuthenticated: boolean;
  onToggleFavorite: () => void;
  onShare: () => void;
}

export function PropertyImageGallery({
  images,
  selectedImage,
  onSelectImage,
  documentationLevel,
  isFavorite,
  isAuthenticated,
  onToggleFavorite,
  onShare,
}: PropertyImageGalleryProps) {
  const isMobile = useIsMobile();
  const [api, setApi] = useState<CarouselApi>();
  const [currentSlide, setCurrentSlide] = useState(0);

  const onSelect = useCallback(() => {
    if (!api) return;
    const index = api.selectedScrollSnap();
    setCurrentSlide(index);
    onSelectImage(index);
  }, [api, onSelectImage]);

  useEffect(() => {
    if (!api) return;
    api.on("select", onSelect);
    onSelect();
    return () => {
      api.off("select", onSelect);
    };
  }, [api, onSelect]);

  // Sync external selectedImage changes to carousel
  useEffect(() => {
    if (!api) return;
    if (api.selectedScrollSnap() !== selectedImage) {
      api.scrollTo(selectedImage);
    }
  }, [api, selectedImage]);

  const overlayButtons = (
    <>
      <div className="absolute top-4 left-4 z-10">
        <DocumentationStatus level={documentationLevel} />
      </div>
      <div className="absolute top-4 right-4 flex gap-2 z-10">
        <button
          className={`w-10 h-10 rounded-full bg-card/90 backdrop-blur-sm flex items-center justify-center hover:bg-card transition-colors ${
            isFavorite ? "text-rose-500" : "text-muted-foreground"
          }`}
          onClick={(e) => {
            e.preventDefault();
            onToggleFavorite();
          }}
        >
          <Heart className={`w-5 h-5 ${isFavorite ? "fill-current" : ""}`} />
        </button>
        <button
          className="w-10 h-10 rounded-full bg-card/90 backdrop-blur-sm flex items-center justify-center hover:bg-card transition-colors"
          onClick={onShare}
        >
          <Share2 className="w-5 h-5 text-muted-foreground" />
        </button>
      </div>
    </>
  );

  if (isMobile && images.length > 1) {
    return (
      <div className="relative rounded-2xl overflow-hidden">
        <Carousel setApi={setApi} opts={{ startIndex: selectedImage }}>
          <CarouselContent className="-ml-0">
            {images.map((image, index) => (
              <CarouselItem key={index} className="pl-0">
                <div className="aspect-[16/10]">
                  <img
                    src={image}
                    alt={`Imóvel ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
        {overlayButtons}
        <div className="absolute bottom-4 right-4 bg-black/60 text-white text-sm px-3 py-1 rounded-full z-10">
          {currentSlide + 1} / {images.length}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="relative rounded-2xl overflow-hidden aspect-[16/10]">
        <img
          src={images[selectedImage]}
          alt="Imóvel"
          className="w-full h-full object-cover"
        />
        {overlayButtons}
      </div>

      {images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-2">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => onSelectImage(index)}
              className={`flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden border-2 transition-all ${
                selectedImage === index
                  ? "border-primary"
                  : "border-transparent opacity-70 hover:opacity-100"
              }`}
            >
              <img src={image} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </>
  );
}
