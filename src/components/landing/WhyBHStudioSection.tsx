import { Clock, Wallet, Layers, Award } from "lucide-react";

const benefits = [
  {
    icon: Clock,
    bangla: "সময় বাঁচায়",
    english: "Faster content"
  },
  {
    icon: Wallet,
    bangla: "খরচ কমায়",
    english: "Less dependency"
  },
  {
    icon: Layers,
    bangla: "একই ব্র্যান্ড লুক",
    english: "Consistent identity"
  },
  {
    icon: Award,
    bangla: "প্রফেশনাল ইম্প্রেশন",
    english: "Looks premium"
  }
];

export const WhyBHStudioSection = () => {
  return (
    <section className="py-16 sm:py-24 lg:py-32 relative overflow-hidden px-4 sm:px-6 lg:px-8">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-charcoal-deep to-transparent" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-gradient-to-r from-gold/8 via-transparent to-gold/8 rounded-full blur-3xl" />
      
      <div className="relative max-w-5xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="font-bangla text-2xl sm:text-3xl lg:text-4xl font-semibold text-cream mb-2">
            কেন <span className="gradient-text">BH Studio?</span>
          </h2>
          <p className="text-sm sm:text-base text-cream/50 font-light">
            Because consistency sells.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {benefits.map((benefit, index) => (
            <div
              key={benefit.bangla}
              className={`text-center group section-animate delay-${index + 1}`}
            >
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl gold-icon flex items-center justify-center mx-auto mb-4 sm:mb-5 group-hover:shadow-gold transition-all duration-500">
                <benefit.icon className="w-6 h-6 sm:w-7 sm:h-7 text-gold" />
              </div>
              <h3 className="font-bangla text-base sm:text-lg font-semibold text-cream mb-1 group-hover:text-gold transition-colors duration-300">
                {benefit.bangla}
              </h3>
              <p className="text-xs sm:text-sm text-cream/40 font-light">
                {benefit.english}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
