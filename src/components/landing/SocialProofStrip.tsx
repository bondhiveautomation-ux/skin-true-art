import { Briefcase, Layers, Award, User } from "lucide-react";

const trustBullets = [
  { icon: Briefcase, text: "For Business Use" },
  { icon: Layers, text: "Consistent Style" },
  { icon: Award, text: "Premium Output" },
  { icon: User, text: "Built for Non-Technical Users" }
];

export const SocialProofStrip = () => {
  return (
    <section className="py-8 sm:py-12 relative overflow-hidden">
      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gold/5 to-transparent" />
      
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Trust bullets */}
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 lg:gap-12 mb-4">
          {trustBullets.map((bullet) => (
            <div
              key={bullet.text}
              className="flex items-center gap-2 text-cream/50"
            >
              <bullet.icon className="w-4 h-4 text-gold/60" />
              <span className="text-xs sm:text-sm font-medium">
                {bullet.text}
              </span>
            </div>
          ))}
        </div>
        
        {/* Bangla line */}
        <p className="font-bangla text-center text-sm sm:text-base text-cream/40">
          যারা ব্যবসা চালান— তাদের জন্য বানানো।
        </p>
      </div>
    </section>
  );
};
