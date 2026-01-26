import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, ZoomIn, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface ImageGalleryProps {
  images: string[];
  productTitle: string;
}

export const ImageGallery = ({ images, productTitle }: ImageGalleryProps) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });
  const [showLightbox, setShowLightbox] = useState(false);
  const imageRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageRef.current || !isZoomed) return;
    
    const rect = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    setZoomPosition({ x, y });
  };

  const goToPrevious = () => {
    setSelectedIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setSelectedIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="space-y-4">
      {/* Main Image with Zoom */}
      <div 
        ref={imageRef}
        className="relative group overflow-hidden rounded-2xl bg-slate-900/50 border border-border cursor-zoom-in"
        onMouseEnter={() => setIsZoomed(true)}
        onMouseLeave={() => setIsZoomed(false)}
        onMouseMove={handleMouseMove}
        onClick={() => setShowLightbox(true)}
      >
        <AspectRatio ratio={1}>
          <motion.img
            key={selectedIndex}
            src={images[selectedIndex]}
            alt={`${productTitle} - Image ${selectedIndex + 1}`}
            className="w-full h-full object-cover"
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: 1,
              scale: isZoomed ? 2 : 1,
              transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`
            }}
            transition={{ 
              opacity: { duration: 0.3 },
              scale: { duration: 0.2 }
            }}
          />
        </AspectRatio>

        {/* Zoom Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isZoomed ? 0 : 1 }}
          className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-sm rounded-full px-3 py-1.5 flex items-center gap-2"
        >
          <ZoomIn className="w-4 h-4 text-white" />
          <span className="text-xs text-white">Hover to zoom</span>
        </motion.div>

        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              whileHover={{ opacity: 1 }}
              className="absolute left-4 top-1/2 -translate-y-1/2"
            >
              <Button
                variant="secondary"
                size="icon"
                className="rounded-full bg-black/60 backdrop-blur-sm hover:bg-black/80"
                onClick={(e) => {
                  e.stopPropagation();
                  goToPrevious();
                }}
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              whileHover={{ opacity: 1 }}
              className="absolute right-4 top-1/2 -translate-y-1/2"
            >
              <Button
                variant="secondary"
                size="icon"
                className="rounded-full bg-black/60 backdrop-blur-sm hover:bg-black/80"
                onClick={(e) => {
                  e.stopPropagation();
                  goToNext();
                }}
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            </motion.div>
          </>
        )}

        {/* Image Counter */}
        {images.length > 1 && (
          <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-sm rounded-full px-3 py-1">
            <span className="text-xs text-white">
              {selectedIndex + 1} / {images.length}
            </span>
          </div>
        )}
      </div>

      {/* Thumbnail Strip */}
      {images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-2">
          {images.map((image, index) => (
            <motion.button
              key={index}
              onClick={() => setSelectedIndex(index)}
              className={`relative flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                selectedIndex === index 
                  ? 'border-primary ring-2 ring-primary/30' 
                  : 'border-border hover:border-primary/50'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <img
                src={image}
                alt={`Thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
              />
              {selectedIndex === index && (
                <motion.div
                  layoutId="thumbnail-indicator"
                  className="absolute inset-0 bg-primary/20"
                />
              )}
            </motion.button>
          ))}
        </div>
      )}

      {/* Lightbox Dialog */}
      <Dialog open={showLightbox} onOpenChange={setShowLightbox}>
        <DialogContent className="max-w-[90vw] max-h-[90vh] p-0 bg-black/95 border-none">
          <div className="relative w-full h-full flex items-center justify-center">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 z-50 rounded-full bg-white/10 hover:bg-white/20 text-white"
              onClick={() => setShowLightbox(false)}
            >
              <X className="w-5 h-5" />
            </Button>
            
            <motion.img
              key={selectedIndex}
              src={images[selectedIndex]}
              alt={productTitle}
              className="max-w-full max-h-[85vh] object-contain"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            />

            {images.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 hover:bg-white/20 text-white h-12 w-12"
                  onClick={goToPrevious}
                >
                  <ChevronLeft className="w-6 h-6" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 hover:bg-white/20 text-white h-12 w-12"
                  onClick={goToNext}
                >
                  <ChevronRight className="w-6 h-6" />
                </Button>
              </>
            )}

            {/* Lightbox Thumbnails */}
            {images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedIndex(index)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      selectedIndex === index 
                        ? 'bg-white w-6' 
                        : 'bg-white/50 hover:bg-white/80'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
