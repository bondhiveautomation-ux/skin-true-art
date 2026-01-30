import { Upload, MousePointerClick, Sparkles } from "lucide-react";

const steps = [
  {
    icon: Upload,
    number: "১",
    bangla: "আপনার ছবি/কনটেন্ট দিন",
    english: "Upload"
  },
  {
    icon: MousePointerClick,
    number: "২",
    bangla: "আপনার দরকারটা সিলেক্ট করুন",
    english: "Choose"
  },
  {
    icon: Sparkles,
    number: "৩",
    bangla: "ফলাফল নিয়ে পোস্ট করুন",
    english: "Generate & Use"
  }
];

export const HowItWorksSection = () => {
  return (
    <section className="py-16 sm:py-24 lg:py-32 relative overflow-hidden px-4 sm:px-6 lg:px-8">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-charcoal to-transparent" />
      
      <div className="relative max-w-5xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="font-bangla text-2xl sm:text-3xl lg:text-4xl font-semibold text-cream mb-2">
            কীভাবে <span className="gradient-text">কাজ করে?</span>
          </h2>
          <p className="text-sm sm:text-base text-cream/50 font-light">
            3 simple steps.
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 lg:gap-12 mb-10">
          {steps.map((step, index) => (
            <div
              key={step.english}
              className={`text-center section-animate delay-${index + 1}`}
            >
              {/* Step number badge */}
              <div className="relative inline-flex items-center justify-center mb-4 sm:mb-6">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl gold-icon flex items-center justify-center">
                  <step.icon className="w-7 h-7 sm:w-8 sm:h-8 text-gold" />
                </div>
                <span className="absolute -top-2 -right-2 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-gold to-gold-dark flex items-center justify-center font-bangla font-bold text-charcoal-deep text-sm sm:text-base">
                  {step.number}
                </span>
              </div>
              
              {/* Step text */}
              <p className="text-sm sm:text-base font-semibold text-cream/80 mb-1 uppercase tracking-wide">
                {step.english}
              </p>
              <p className="font-bangla text-sm sm:text-base text-cream/60">
                {step.bangla}
              </p>
            </div>
          ))}
        </div>

        {/* Reassurance */}
        <div className="text-center">
          <div className="luxury-divider max-w-xs mx-auto mb-4" />
          <p className="font-bangla text-sm sm:text-base text-cream/50">
            কোনো ডিজাইন শেখা লাগবে না। শুধু সিলেক্ট করুন— বাকিটা BH Studio।
          </p>
        </div>
      </div>
    </section>
  );
};
