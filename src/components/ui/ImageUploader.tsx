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
      <label className="block text-sm font-medium text-foreground mb-2">
        {label}
      </label>
      {description && (
        <p className="text-xs text-muted-foreground mb-3">{description}</p>
      )}
      
      <input
        type="file"
        accept="image/*"
        onChange={onUpload}
        className="hidden"
        id={id}
      />
      
      {!image ? (
        <label htmlFor={id} className="block cursor-pointer">
          <div className={`upload-zone flex flex-col items-center justify-center gap-4 ${aspectClasses[aspectRatio]} min-h-[200px]`}>
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center transition-colors group-hover:bg-primary/20">
              <Upload className="w-7 h-7 text-primary" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-foreground mb-1">
                Click to upload
              </p>
              <p className="text-xs text-muted-foreground">
                PNG, JPG up to 20MB
              </p>
            </div>
          </div>
        </label>
      ) : (
        <div className={`relative rounded-2xl overflow-hidden border border-border bg-secondary/30 ${aspectClasses[aspectRatio]}`}>
          <img
            src={image}
            alt="Uploaded"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300">
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
              <span className="text-xs text-foreground font-medium px-2 py-1 rounded bg-background/50 backdrop-blur-sm">
                ✓ Image uploaded
              </span>
            </div>
          </div>
          <Button
            onClick={(e) => {
              e.preventDefault();
              onRemove();
            }}
            variant="destructive"
            size="icon"
            className="absolute top-3 right-3 w-8 h-8 rounded-lg"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
};
