import { ImageIcon, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface LandingExample {
  id: string;
  category_key: string;
  category_name: string;
  category_name_bn: string;
  image_url: string | null;
  display_order: number;
  is_active: boolean;
}

export const ExamplesSection = () => {
  const { data: examples, isLoading } = useQuery({
    queryKey: ["landing-examples"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("landing_examples")
        .select("*")
        .eq("is_active", true)
        .order("display_order");

      if (error) throw error;
      return data as LandingExample[];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  if (isLoading) {
    return (
      <section id="examples" className="py-16 sm:py-24 lg:py-32 relative overflow-hidden px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-gold" />
        </div>
      </section>
    );
  }

  // Don't render if no examples with images
  const examplesWithImages = examples?.filter(e => e.image_url) || [];
  if (examplesWithImages.length === 0 && (!examples || examples.length === 0)) {
    return null; // Hide section if no examples at all
  }

  return (
    <section id="examples" className="py-16 sm:py-24 lg:py-32 relative overflow-hidden px-4 sm:px-6 lg:px-8">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-charcoal to-transparent" />
      
      <div className="relative max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="font-bangla text-2xl sm:text-3xl lg:text-4xl font-semibold text-cream mb-2">
            কিছু <span className="gradient-text">উদাহরণ দেখুন</span>
          </h2>
          <p className="text-sm sm:text-base text-cream/50 font-light">
            See what you can create with BH Studio.
          </p>
        </div>

        {/* Example Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
          {examples?.map((example, index) => (
            <div
              key={example.id}
              className={`group aspect-[4/3] rounded-xl sm:rounded-2xl overflow-hidden border border-gold/10 backdrop-blur-sm hover:border-gold/25 transition-all duration-500 relative section-animate delay-${Math.min(index + 1, 6)}`}
            >
              {example.image_url ? (
                <>
                  <img
                    src={example.image_url}
                    alt={example.category_name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {/* Overlay with category name */}
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal/90 via-charcoal/20 to-transparent flex flex-col justify-end p-3 sm:p-4">
                    <p className="font-bangla text-sm sm:text-base font-medium text-cream">
                      {example.category_name_bn}
                    </p>
                    <p className="text-[10px] sm:text-xs text-cream/60">
                      {example.category_name}
                    </p>
                  </div>
                </>
              ) : (
                <div className="w-full h-full bg-card/30 flex flex-col items-center justify-center p-4">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl gold-icon flex items-center justify-center mb-3 group-hover:shadow-gold transition-all duration-300">
                    <ImageIcon className="w-6 h-6 sm:w-8 sm:h-8 text-gold/60" />
                  </div>
                  <p className="font-bangla text-xs sm:text-sm font-medium text-cream/60 text-center group-hover:text-cream/80 transition-colors">
                    {example.category_name_bn}
                  </p>
                  <p className="text-[10px] text-cream/30 mt-1">
                    Coming soon
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
