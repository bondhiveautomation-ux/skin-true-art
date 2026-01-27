import { MessageCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useContent } from "@/hooks/useSiteContent";

interface WhatsAppFloatProps {
  isVisible?: boolean;
}

export const WhatsAppFloat = ({ isVisible = true }: WhatsAppFloatProps) => {
  const [hasPulsed, setHasPulsed] = useState(false);
  const { content: headerContent } = useContent("header");
  
  const whatsappNumber = headerContent.whatsapp_number || "17059884080";
  const whatsappMessage = encodeURIComponent("হাই, আমার সহায়তা প্রয়োজন। Hi, I need help with BH Studio.");

  useEffect(() => {
    // Trigger pulse animation once after page load
    const timer = setTimeout(() => {
      setHasPulsed(true);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  const handleClick = () => {
    window.open(`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`, "_blank");
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        "fixed bottom-6 right-6 z-50",
        "flex items-center gap-2 px-4 py-3",
        "rounded-full bg-green-600 hover:bg-green-500",
        "text-white font-medium text-sm",
        "shadow-lg shadow-green-600/30 hover:shadow-xl hover:shadow-green-600/40",
        "transition-all duration-300 hover:scale-105",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-green-400",
        hasPulsed ? "" : "animate-pulse"
      )}
      aria-label="WhatsApp Support"
    >
      <MessageCircle className="w-5 h-5" />
      <span className="font-bangla hidden sm:inline">সহায়তা প্রয়োজন?</span>
      <span className="sm:hidden">Help</span>
    </button>
  );
};
