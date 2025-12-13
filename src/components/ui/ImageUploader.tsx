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
        <label className="block text-sm font-medium text-foreground mb-2">
          {label}
        </label>
      )}
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
          <div className={`upload-zone flex flex-col items-center justify-center gap-3 p-8 ${aspectClasses[aspectRatio]} min-h-[180px]`}>
            <div className="w-12 h-12 rounded-xl bg-accent/50 flex items-center justify-center">
              <Upload className="w-5 h-5 text-muted-foreground" />
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
        <div className={`relative rounded-xl overflow-hidden border border-border bg-secondary/30 ${aspectClasses[aspectRatio]}`}>
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
            className="absolute top-2 right-2 w-7 h-7 rounded-lg"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
};
