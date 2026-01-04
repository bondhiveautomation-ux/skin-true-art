import { Upload, X } from "lucide-react";
import { Button } from "./button";

interface ImageUploaderProps {
  id: string;
  image: string | null;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: () => void;
  label: string;
  description?: string;
  className?: string;
  aspectRatio?: "square" | "portrait" | "landscape" | "auto";
}

export const ImageUploader = ({
  id,
  image,
  onUpload,
  onRemove,
  label,
  description,
  className = "",
  aspectRatio = "auto",
}: ImageUploaderProps) => {
  const aspectClasses = {
    square: "aspect-square",
    portrait: "aspect-[3/4]",
    landscape: "aspect-video",
    auto: "",
  };

  return (
    <div className={className}>
      {label && (
        <label className="block text-xs sm:text-sm font-medium text-cream mb-1.5 sm:mb-2">
          {label}
        </label>
      )}
      {description && (
        <p className="text-[10px] sm:text-xs text-cream/40 mb-2 sm:mb-3 font-light">{description}</p>
      )}
      
      <input
        type="file"
        accept="image/*"
        onChange={onUpload}
        className="hidden"
        id={id}
      />
      
      {!image ? (
        <label htmlFor={id} className="block cursor-pointer group">
          <div className={`upload-zone flex flex-col items-center justify-center gap-2 sm:gap-3 p-4 sm:p-6 ${aspectClasses[aspectRatio]} min-h-[140px] sm:min-h-[180px] group-hover:border-gold/50`}>
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg gold-icon flex items-center justify-center group-hover:shadow-gold transition-all duration-300">
              <Upload className="w-4 h-4 sm:w-5 sm:h-5 text-gold" />
            </div>
            <div className="text-center">
              <p className="text-xs sm:text-sm font-medium text-cream/80 mb-0.5">
                Click to upload
              </p>
              <p className="text-[10px] sm:text-xs text-cream/40 font-light">
                PNG, JPG up to 20MB
              </p>
            </div>
          </div>
        </label>
      ) : (
        <div className={`relative rounded-lg sm:rounded-xl overflow-hidden border border-gold/20 bg-charcoal ${aspectClasses[aspectRatio]}`}>
          <img
            src={image}
            alt="Uploaded"
            className="w-full h-full object-cover"
          />
          <Button
            onClick={(e) => {
              e.preventDefault();
              onRemove();
            }}
            variant="destructive"
            size="icon"
            className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 w-7 h-7 sm:w-8 sm:h-8 rounded-lg"
          >
            <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </Button>
        </div>
      )}
    </div>
  );
};
