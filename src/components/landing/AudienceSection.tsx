import { 
  Palette, 
  ShoppingBag, 
  Store, 
  Building2, 
  User, 
  Video, 
  Users, 
  Calendar 
} from "lucide-react";

const audiences = [
  {
    icon: Palette,
    bangla: "মেকআপ আর্টিস্ট / সেলুন",
    english: "Showcase your work like a pro"
  },
  {
    icon: ShoppingBag,
    bangla: "কাপড়/বুটিক/ফ্যাশন সেলার",
    english: "Present products with premium style"
  },
  {
    icon: Store,
    bangla: "অনলাইন সেলার (FB/IG)",
    english: "Post-ready content faster"
  },
  {
    icon: Building2,
    bangla: "ছোট ব্যবসা (যেকোনো নীচ)",
    english: "Make your brand look big"
  },
  {
    icon: User,
    bangla: "পার্সোনাল ব্র্যান্ড / উদ্যোক্তা",
    english: "Build a consistent identity"
  },
  {
    icon: Video,
    bangla: "কনটেন্ট ক্রিয়েটর / ইনফ্লুয়েন্সার",
    english: "Stand out in crowded feeds"
  },
  {
    icon: Users,
    bangla: "এজেন্সি / সোশ্যাল মিডিয়া ম্যানেজার",
    english: "Create for multiple clients"
  },
  {
    icon: Calendar,
    bangla: "ইভেন্ট/ওয়েডিং/লোকাল সার্ভিস",
    english: "Sell services with premium visuals"
  }
];

export const AudienceSection = () => {
  return (
    <section className="py-16 sm:py-24 lg:py-32 relative overflow-hidden px-4 sm:px-6 lg:px-8">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-charcoal to-transparent" />
      
      <div className="relative max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="font-bangla text-2xl sm:text-3xl lg:text-4xl font-semibold text-cream mb-2">
            BH Studio <span className="gradient-text">কার জন্য?</span>
          </h2>
          <p className="text-sm sm:text-base text-cream/50 font-light">
            If you sell, promote, or build a brand — this is for you.
          </p>
        </div>

        {/* Audience Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          {audiences.map((audience, index) => (
            <div
              key={audience.bangla}
              className={`group p-4 sm:p-5 lg:p-6 rounded-xl sm:rounded-2xl bg-card/20 border border-gold/10 text-center hover:border-gold/25 transition-all duration-500 section-animate delay-${Math.min(index + 1, 8)}`}
            >
              <div className="w-11 h-11 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-lg sm:rounded-xl gold-icon flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:shadow-gold transition-all duration-500">
                <audience.icon className="w-5 h-5 sm:w-6 sm:h-6 text-gold" />
              </div>
              <h3 className="font-bangla text-sm sm:text-base font-semibold text-cream mb-1 sm:mb-2 group-hover:text-gold transition-colors duration-300 leading-tight">
                {audience.bangla}
              </h3>
              <p className="text-[10px] sm:text-xs text-cream/40 font-light leading-relaxed">
                {audience.english}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
