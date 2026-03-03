import * as React from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { Dialog, DialogContent, DialogPortal, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface PropertyFullscreenGalleryProps {
    isOpen: boolean;
    onClose: () => void;
    images: string[];
    initialIndex: number;
}

export function PropertyFullscreenGallery({
    isOpen,
    onClose,
    images,
    initialIndex,
}: PropertyFullscreenGalleryProps) {
    const [currentIndex, setCurrentIndex] = React.useState(initialIndex);
    const isMobile = useIsMobile();

    // Reset index when opened with a specific image
    React.useEffect(() => {
        if (isOpen) {
            setCurrentIndex(initialIndex);
        }
    }, [isOpen, initialIndex]);

    const handlePrevious = React.useCallback(() => {
        setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    }, [images.length]);

    const handleNext = React.useCallback(() => {
        setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    }, [images.length]);

    // Handle keyboard navigation
    React.useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "ArrowLeft") handlePrevious();
            if (e.key === "ArrowRight") handleNext();
            if (e.key === "Escape") onClose();
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, handlePrevious, handleNext, onClose]);

    // Scroll active thumbnail into view
    const thumbnailRefs = React.useRef<(HTMLButtonElement | null)[]>([]);
    React.useEffect(() => {
        if (isOpen && thumbnailRefs.current[currentIndex]) {
            thumbnailRefs.current[currentIndex]?.scrollIntoView({
                behavior: "smooth",
                block: "nearest",
                inline: "center",
            });
        }
    }, [currentIndex, isOpen]);

    if (!isOpen) return null;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogPortal>
                <DialogContent
                    className="fixed inset-0 z-[100] flex flex-col items-center justify-center border-none bg-transparent backdrop-blur-xl p-0 max-w-none w-screen h-screen outline-none animate-in fade-in duration-300 pointer-events-auto top-0 left-0 translate-x-0 translate-y-0"
                    onPointerDownOutside={(e) => e.preventDefault()}
                >
                    <DialogTitle className="sr-only">Galeria de Imagens em Tela Cheia</DialogTitle>

                    {/* Header */}
                    <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-[120] bg-gradient-to-b from-black/40 to-transparent">
                        <div className="text-white font-medium px-4 bg-black/40 backdrop-blur-md rounded-full py-1 text-sm border border-white/10">
                            {currentIndex + 1} / {images.length}
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-white hover:bg-white/20 hover:text-white transition-all rounded-full h-10 w-10 border border-white/10 bg-black/40 backdrop-blur-md"
                            onClick={onClose}
                        >
                            <X className="h-6 w-6" />
                        </Button>
                    </div>

                    {/* Main Image Container */}
                    <div className="relative flex-1 w-full flex items-center justify-center overflow-hidden">
                        {!isMobile && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute left-6 z-[120] text-white/70 hover:text-white hover:bg-white/20 w-14 h-14 rounded-full transition-all border border-white/5 bg-black/20 backdrop-blur-sm"
                                onClick={handlePrevious}
                            >
                                <ChevronLeft className="h-10 w-10" />
                            </Button>
                        )}

                        <div className="relative w-full h-full flex items-center justify-center p-4 sm:p-12 select-none">
                            <img
                                key={currentIndex}
                                src={images[currentIndex]}
                                alt={`Imagem ${currentIndex + 1}`}
                                className="max-w-full max-h-full object-contain animate-in fade-in zoom-in-95 duration-500 shadow-2xl rounded-lg"
                                draggable={false}
                            />
                        </div>

                        {!isMobile && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute right-6 z-[120] text-white/70 hover:text-white hover:bg-white/20 w-14 h-14 rounded-full transition-all border border-white/5 bg-black/20 backdrop-blur-sm"
                                onClick={handleNext}
                            >
                                <ChevronRight className="h-10 w-10" />
                            </Button>
                        )}
                    </div>

                    {/* Mobile Navigation Area (Invisible overlay for taps) */}
                    {isMobile && (
                        <div className="absolute inset-0 z-[105] flex">
                            <div
                                className="w-1/3 h-full cursor-pointer"
                                onClick={handlePrevious}
                            />
                            <div
                                className="w-1/3 h-full cursor-pointer"
                                onClick={onClose}
                            />
                            <div
                                className="w-1/3 h-full cursor-pointer"
                                onClick={handleNext}
                            />
                        </div>
                    )}

                    {/* Thumbnails Footer */}
                    <div className="w-full bg-black/20 backdrop-blur-xl p-6 flex flex-col gap-4 border-t border-white/10 z-[120]">
                        <div className="flex gap-3 overflow-x-auto pb-2 px-4 scrollbar-none justify-start sm:justify-center no-scrollbar">
                            {images.map((image, index) => (
                                <button
                                    key={index}
                                    ref={(el) => (thumbnailRefs.current[index] = el)}
                                    onClick={() => setCurrentIndex(index)}
                                    className={cn(
                                        "relative flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border-2 transition-all duration-300",
                                        currentIndex === index
                                            ? "border-white opacity-100 scale-110 shadow-[0_0_15px_rgba(255,255,255,0.4)]"
                                            : "border-transparent opacity-40 hover:opacity-70"
                                    )}
                                >
                                    <img
                                        src={image}
                                        alt={`Miniatura ${index + 1}`}
                                        className="w-full h-full object-cover"
                                    />
                                </button>
                            ))}
                        </div>
                    </div>
                </DialogContent>
            </DialogPortal>
        </Dialog>
    );
}
