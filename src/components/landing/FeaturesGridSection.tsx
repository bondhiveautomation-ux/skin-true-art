const featureCategories = [
  {
    title: "Identity & Character Control",
    banglaCopy: "একই স্টাইল ধরে রেখে বারবার ব্যবহারযোগ্য ভিজ্যুয়াল আইডেন্টিটি তৈরি করুন।",
    englishCopy: "Keep your content consistent.",
    tools: ["Character Generator", "Pose Transfer", "Face Swap"]
  },
  {
    title: "Fashion & Look Transformation",
    banglaCopy: "লুক, স্টাইল, পোশাক বা প্রেজেন্টেশনকে আরও প্রফেশনালভাবে তুলুন।",
    englishCopy: "Upgrade the look instantly.",
    tools: ["Dress Change", "Makeup Studio", "Dress Extractor"]
  },
  {
    title: "Professional Content Creation",
    banglaCopy: "প্রোডাক্ট/সার্ভিসের জন্য স্টুডিও-স্টাইল কনটেন্ট তৈরি করুন।",
    englishCopy: "Content that looks expensive.",
    tools: ["Photography Studio", "Cinematic Studio", "Background Saver"]
  },
  {
    title: "Branding & Marketing",
    banglaCopy: "পোস্টের ব্র্যান্ড লুক ঠিক রাখুন— ক্যাপশন, লোগো, স্টাইল সব মিলিয়ে।",
    englishCopy: "Marketing-ready assets.",
    tools: ["Caption Studio", "Branding Studio", "Prompt Extractor"]
  }
];

export const FeaturesGridSection = () => {
  return (
    <section id="features" className="py-16 sm:py-24 lg:py-32 relative overflow-hidden px-4 sm:px-6 lg:px-8">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-charcoal-deep to-background" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-gold/5 via-transparent to-gold/5 rounded-full blur-3xl" />
      
      <div className="relative max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="font-bangla text-2xl sm:text-3xl lg:text-4xl font-semibold text-cream mb-2">
            BH Studio দিয়ে আপনি <span className="gradient-text">কী করতে পারবেন?</span>
          </h2>
          <p className="text-sm sm:text-base text-cream/50 font-light">
            Tools organized by outcomes, not tech.
          </p>
        </div>

        {/* Feature Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 mb-8">
          {featureCategories.map((category, index) => (
            <div
              key={category.title}
              className={`group p-5 sm:p-6 lg:p-8 rounded-2xl bg-card/30 border border-gold/10 backdrop-blur-sm hover:border-gold/25 transition-all duration-500 section-animate delay-${Math.min(index + 1, 4)}`}
            >
              <h3 className="font-serif text-lg sm:text-xl font-semibold text-cream mb-1 group-hover:text-gold transition-colors duration-300">
                {category.title}
              </h3>
              <p className="font-bangla text-sm sm:text-base text-cream/70 mb-2 leading-relaxed">
                {category.banglaCopy}
              </p>
              <p className="text-xs sm:text-sm text-cream/40 mb-4 font-light">
                {category.englishCopy}
              </p>
              <div className="flex flex-wrap gap-2">
                {category.tools.map((tool) => (
                  <span
                    key={tool}
                    className="px-3 py-1.5 text-xs font-medium text-gold/70 bg-gold/5 border border-gold/15 rounded-full hover:bg-gold/10 transition-colors"
                  >
                    {tool}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Reassurance line */}
        <div className="text-center">
          <p className="font-bangla text-sm sm:text-base text-cream/60 mb-1">
            টুলগুলো দেখতে টেকি লাগতে পারে— কিন্তু ব্যবহার একদম সহজ।
          </p>
          <p className="text-xs sm:text-sm text-cream/40 font-light">
            Feels premium, works simple.
          </p>
        </div>
      </div>
    </section>
  );
};
