import { ReactNode, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Diamond } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/landing/Footer";
import { useAuth } from "@/hooks/useAuth";
import { useGems } from "@/hooks/useGems";
import { useAdmin } from "@/hooks/useAdmin";
import { useToolConfigs } from "@/hooks/useToolConfigs";
import { getGemCost } from "@/lib/gemCosts";
import { LucideIcon } from "lucide-react";

// Bangla descriptions for each tool
const BANGLA_DESCRIPTIONS: Record<string, string> = {
  "Character Generator": "আপনার চরিত্রের মুখ ও পরিচয় সম্পূর্ণ সামঞ্জস্যপূর্ণ রেখে নতুন ছবি তৈরি করুন। পেশাদার মানের ক্যারেক্টার ইমেজ জেনারেট করুন।",
  "Prompt Extractor": "যেকোনো ছবি থেকে বিস্তারিত AI প্রম্পট বের করুন একই রকম ভিজ্যুয়াল তৈরি করতে। ছবির স্টাইল ও ডিটেইলস ক্যাপচার করুন।",
  "Dress Extractor": "যেকোনো ছবি থেকে পোশাক আলাদা করুন এবং প্রিমিয়াম ব্যাকগ্রাউন্ডে মার্জিত ম্যানেকুইনে প্রদর্শন করুন। ই-কমার্স প্রোডাক্ট ডিসপ্লে ও ফ্যাশন ক্যাটালগের জন্য আদর্শ।",
  "Background Saver": "ব্যাকগ্রাউন্ড অক্ষত রেখে ছবি থেকে অবাঞ্ছিত মানুষ মুছে ফেলুন। পরিষ্কার, পেশাদার ব্যাকগ্রাউন্ড পান।",
  "Pose Transfer": "আপনার চরিত্রের পরিচয় অক্ষত রেখে রেফারেন্স ছবি থেকে পোজ ট্রান্সফার করুন। যেকোনো পোজে আপনার মডেল দেখুন।",
  "Makeup Studio": "AI নির্ভুলতার সাথে পোর্ট্রেটে পেশাদার মেকআপ স্টাইল প্রয়োগ করুন। বিভিন্ন লুক টেস্ট করুন।",
  "Face Swap Studio": "পেশাদার মানের সাথে ছবির মধ্যে নিখুঁতভাবে মুখ অদলবদল করুন। ন্যাচারাল রেজাল্ট পান।",
  "Cinematic Studio": "এক ক্লিকে ছবিকে অসাধারণ সিনেমাটিক শটে রূপান্তর করুন। মুভি-স্টাইল ভিজ্যুয়াল তৈরি করুন।",
  "Background Creator": "আপনার প্রোডাক্ট ফটোগ্রাফির জন্য সুন্দর AI ব্যাকগ্রাউন্ড তৈরি করুন। প্রফেশনাল প্রোডাক্ট শট পান।",
  "Photography Studio": "সাধারণ ছবিকে DSLR-মানের পেশাদার ছবিতে রূপান্তর করুন। স্টুডিও কোয়ালিটি ফটো পান।",
  "Caption Studio": "বাংলা বা ইংরেজিতে হাই-কনভার্টিং প্রোডাক্ট ক্যাপশন তৈরি করুন। সোশ্যাল মিডিয়ার জন্য আদর্শ।",
  "Branding Studio": "আপনার ব্র্যান্ড রক্ষা করতে পেশাদারভাবে লোগো ও ওয়াটারমার্ক যুক্ত করুন। ব্র্যান্ড আইডেন্টিটি বজায় রাখুন।",
  "AI Prompt Engineer": "৫-এজেন্ট AI পাইপলাইন ব্যবহার করে সাধারণ প্রম্পটকে পেশাদার প্রম্পটে রূপান্তর করুন। সেরা রেজাল্ট পান।",
  "Luxury Logo Generator": "মিনিটেই এজেন্সি-মানের বিলাসবহুল লোগো তৈরি করুন। স্টাইল, টাইপোগ্রাফি এবং রঙ বেছে নিন প্রিমিয়াম ব্র্যান্ড আইডেন্টিটি তৈরি করতে।",
};

interface ToolPageLayoutProps {
  children: ReactNode;
  toolId?: string;
  toolName: string;
  toolDescription: string;
  gemCostKey: string;
  icon: LucideIcon;
  badge?: string;
}

export const ToolPageLayout = ({
  children,
  toolId,
  toolName,
  toolDescription,
  gemCostKey,
  icon: Icon,
  badge,
}: ToolPageLayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut } = useAuth();
  const { gems } = useGems();
  const { isAdmin } = useAdmin();
  const { getToolConfig } = useToolConfigs();

  // Scroll to top when tool page loads
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [location.pathname]);

  // Get dynamic config from database if available
  const dbConfig = toolId ? getToolConfig(toolId) : null;
  const displayName = dbConfig?.name || toolName;
  const displayBadge = dbConfig?.badge || badge;
  
  // Get Bangla description - prioritize from mapping, fallback to English
  const banglaDescription = BANGLA_DESCRIPTIONS[displayName] || BANGLA_DESCRIPTIONS[toolName] || toolDescription;

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar 
        onNavigate={scrollToSection}
        onSignOut={signOut}
        credits={gems}
        isAdmin={isAdmin}
      />

      {/* Hero Section - Compact on mobile */}
      <section className="pt-20 sm:pt-28 pb-6 sm:pb-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-charcoal to-background" />
        <div className="absolute top-0 left-1/4 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-3xl" />
        <div className="hidden sm:block absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-gradient-to-tl from-primary/5 to-transparent rounded-full blur-3xl" />
        <div className="absolute inset-0 noise-texture" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back button */}
          <button
            onClick={() => navigate("/dashboard")}
            className="inline-flex items-center gap-2 text-cream/60 hover:text-primary transition-colors mb-4 sm:mb-8 group min-h-[44px]"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium">Back to Tools</span>
          </button>

          {/* Header - Mobile optimized */}
          <div className="text-center mb-6 sm:mb-12">
            {/* Badge + Icon - Condensed on mobile */}
            <div className="flex items-center justify-center gap-2 mb-3 sm:mb-6">
              <div className="flex items-center gap-2 px-3 sm:px-5 py-2 sm:py-2.5 rounded-full bg-primary/10 border border-primary/25 backdrop-blur-sm">
                <Icon className="w-4 h-4 text-primary" />
                <span className="text-[10px] sm:text-xs font-semibold text-primary uppercase tracking-widest">
                  {displayBadge || displayName}
                </span>
              </div>
            </div>
            
            {/* Title */}
            <h1 className="font-serif text-2xl sm:text-3xl lg:text-5xl font-semibold text-cream tracking-tight mb-2 sm:mb-4">
              {displayName}
            </h1>
            
            {/* Description in Bangla - Hidden on mobile, shown on tablet+ */}
            <p className="hidden sm:block font-bangla text-cream/50 max-w-xl mx-auto leading-relaxed font-light mb-6">
              {banglaDescription}
            </p>
            
            {/* Gem cost badge */}
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-secondary/30 border border-border/30">
              <Diamond className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-primary" />
              <span className="text-xs sm:text-sm text-cream/70">
                <span className="font-semibold text-primary">{getGemCost(gemCostKey)}</span> gems
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Tool Section */}
      <section className="pb-8 sm:pb-20 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-charcoal via-background to-background" />
        <div className="absolute inset-0 noise-texture" />

        <div className="relative max-w-5xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="glass-card p-4 sm:p-6 md:p-8 lg:p-10 border border-primary/15 hover:border-primary/25 transition-all duration-500 rounded-xl sm:rounded-2xl lg:rounded-3xl">
            {children}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};
