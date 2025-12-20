import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Phone, Store, CheckCircle2, Loader2, Sparkles } from "lucide-react";

interface LeadCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedProgram: "3_days" | "5_days";
}

export const LeadCaptureModal = ({ isOpen, onClose, selectedProgram }: LeadCaptureModalProps) => {
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [businessPageName, setBusinessPageName] = useState("");
  const [program, setProgram] = useState<"3_days" | "5_days">(selectedProgram);
  const [businessCategory, setBusinessCategory] = useState("");
  const [monthlyAdSpend, setMonthlyAdSpend] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Validate Bangladesh phone format
  const validateWhatsApp = (number: string): boolean => {
    // Allow +880 or 01 format
    const cleanNumber = number.replace(/\s+/g, "").replace(/-/g, "");
    const bdPattern = /^(\+880|880|01)[0-9]{9}$/;
    return bdPattern.test(cleanNumber);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateWhatsApp(whatsappNumber)) {
      toast({
        title: "Invalid WhatsApp Number",
        description: "Please enter a valid Bangladesh number (e.g., +8801XXXXXXXXX or 01XXXXXXXXX)",
        variant: "destructive",
      });
      return;
    }

    if (!businessPageName.trim()) {
      toast({
        title: "Business Page Name Required",
        description: "Please enter your Facebook page name",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.from("class_leads").insert({
        whatsapp_number: whatsappNumber.trim(),
        business_page_name: businessPageName.trim(),
        program: program,
        business_category: businessCategory || null,
        monthly_ad_spend: monthlyAdSpend || null,
      });

      if (error) throw error;

      setIsSuccess(true);
      toast({
        title: "Request Submitted!",
        description: "Thanks! We'll contact you on WhatsApp soon.",
      });

      // Reset form after a delay
      setTimeout(() => {
        setIsSuccess(false);
        setWhatsappNumber("");
        setBusinessPageName("");
        setBusinessCategory("");
        setMonthlyAdSpend("");
        onClose();
      }, 2500);
    } catch (error: any) {
      console.error("Error submitting lead:", error);
      toast({
        title: "Submission Failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update program when modal opens with new selection
  if (selectedProgram !== program && isOpen && !isSubmitting) {
    setProgram(selectedProgram);
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-card border-gold/20">
        {isSuccess ? (
          <div className="py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center mx-auto mb-6 animate-scale-in">
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            </div>
            <h3 className="font-serif text-2xl font-bold text-cream mb-3">Thank You!</h3>
            <p className="text-cream/60">We'll contact you on WhatsApp soon.</p>
          </div>
        ) : (
          <>
            <DialogHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl gold-icon flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-gold" />
                </div>
                <DialogTitle className="font-serif text-xl text-cream">Request a Call</DialogTitle>
              </div>
              <DialogDescription className="text-cream/60">
                Fill in your details and we'll reach out on WhatsApp to discuss enrollment.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-5 mt-4">
              {/* WhatsApp Number */}
              <div className="space-y-2">
                <Label htmlFor="whatsapp" className="text-cream/80 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gold" />
                  WhatsApp Number <span className="text-rose-gold">*</span>
                </Label>
                <Input
                  id="whatsapp"
                  type="tel"
                  placeholder="+8801XXXXXXXXX or 01XXXXXXXXX"
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  className="bg-secondary/50 border-gold/20 focus:border-gold/50 text-cream placeholder:text-cream/40"
                  required
                />
              </div>

              {/* Business Page Name */}
              <div className="space-y-2">
                <Label htmlFor="pageName" className="text-cream/80 flex items-center gap-2">
                  <Store className="w-4 h-4 text-gold" />
                  Business Page Name <span className="text-rose-gold">*</span>
                </Label>
                <Input
                  id="pageName"
                  type="text"
                  placeholder="Your Facebook page name"
                  value={businessPageName}
                  onChange={(e) => setBusinessPageName(e.target.value)}
                  className="bg-secondary/50 border-gold/20 focus:border-gold/50 text-cream placeholder:text-cream/40"
                  required
                />
              </div>

              {/* Program Selection */}
              <div className="space-y-2">
                <Label className="text-cream/80">Which Program?</Label>
                <Select value={program} onValueChange={(v) => setProgram(v as "3_days" | "5_days")}>
                  <SelectTrigger className="bg-secondary/50 border-gold/20 text-cream">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-gold/20">
                    <SelectItem value="3_days" className="text-cream hover:bg-gold/10">
                      3 Days Fast Track Program (৳3,000)
                    </SelectItem>
                    <SelectItem value="5_days" className="text-cream hover:bg-gold/10">
                      5 Days Masterclass (৳5,000)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Business Category (Optional) */}
              <div className="space-y-2">
                <Label className="text-cream/80">Business Category <span className="text-cream/40">(Optional)</span></Label>
                <Select value={businessCategory} onValueChange={setBusinessCategory}>
                  <SelectTrigger className="bg-secondary/50 border-gold/20 text-cream">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-gold/20">
                    <SelectItem value="fashion" className="text-cream hover:bg-gold/10">Fashion</SelectItem>
                    <SelectItem value="beauty" className="text-cream hover:bg-gold/10">Beauty</SelectItem>
                    <SelectItem value="food" className="text-cream hover:bg-gold/10">Food</SelectItem>
                    <SelectItem value="electronics" className="text-cream hover:bg-gold/10">Electronics</SelectItem>
                    <SelectItem value="home" className="text-cream hover:bg-gold/10">Home & Living</SelectItem>
                    <SelectItem value="other" className="text-cream hover:bg-gold/10">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Monthly Ad Spend (Optional) */}
              <div className="space-y-2">
                <Label className="text-cream/80">Monthly Ad Spend <span className="text-cream/40">(Optional)</span></Label>
                <Select value={monthlyAdSpend} onValueChange={setMonthlyAdSpend}>
                  <SelectTrigger className="bg-secondary/50 border-gold/20 text-cream">
                    <SelectValue placeholder="Select range" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-gold/20">
                    <SelectItem value="0-5000" className="text-cream hover:bg-gold/10">৳0 - ৳5,000</SelectItem>
                    <SelectItem value="5000-15000" className="text-cream hover:bg-gold/10">৳5,000 - ৳15,000</SelectItem>
                    <SelectItem value="15000-50000" className="text-cream hover:bg-gold/10">৳15,000 - ৳50,000</SelectItem>
                    <SelectItem value="50000+" className="text-cream hover:bg-gold/10">৳50,000+</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                variant="gold"
                size="lg"
                className="w-full btn-glow"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Phone className="w-4 h-4 mr-2" />
                    Request a Call
                  </>
                )}
              </Button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
