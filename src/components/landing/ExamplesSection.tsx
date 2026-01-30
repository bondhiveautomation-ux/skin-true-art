import { ImageIcon } from "lucide-react";

// Placeholder examples - these would be replaced with real examples
const exampleCategories = [
  "Product Photography",
  "Fashion Lookbook",
  "Brand Identity",
  "Social Media Posts",
  "Makeup Portfolio",
  "Event Visuals"
];

export const ExamplesSection = () => {
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
          {exampleCategories.map((category, index) => (
            <div
              key={category}
              className={`group aspect-[4/3] rounded-xl sm:rounded-2xl bg-card/30 border border-gold/10 backdrop-blur-sm hover:border-gold/25 transition-all duration-500 flex flex-col items-center justify-center p-4 section-animate delay-${Math.min(index + 1, 6)}`}
            >
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl gold-icon flex items-center justify-center mb-3 group-hover:shadow-gold transition-all duration-300">
                <ImageIcon className="w-6 h-6 sm:w-8 sm:h-8 text-gold/60" />
              </div>
              <p className="text-xs sm:text-sm font-medium text-cream/60 text-center group-hover:text-cream/80 transition-colors">
                {category}
              </p>
              <p className="text-[10px] text-cream/30 mt-1">
                Coming soon
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
