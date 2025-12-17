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
        <label className="block text-sm font-medium text-cream mb-2">
          {label}
        </label>
      )}
      {description && (
        <p className="text-xs text-cream/40 mb-3 font-light">{description}</p>
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
          <div className={`upload-zone flex flex-col items-center justify-center gap-4 p-8 ${aspectClasses[aspectRatio]} min-h-[180px] group-hover:border-gold/50`}>
            <div className="w-14 h-14 rounded-xl gold-icon flex items-center justify-center group-hover:shadow-gold transition-all duration-300">
              <Upload className="w-6 h-6 text-gold" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-cream/80 mb-1">
                Click to upload
              </p>
              <p className="text-xs text-cream/40 font-light">
                PNG, JPG up to 20MB
              </p>
            </div>
          </div>
        </label>
      ) : (
        <div className={`relative rounded-xl overflow-hidden border border-gold/20 bg-charcoal ${aspectClasses[aspectRatio]}`}>
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
            className="absolute top-2 right-2 w-8 h-8 rounded-lg"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
};
