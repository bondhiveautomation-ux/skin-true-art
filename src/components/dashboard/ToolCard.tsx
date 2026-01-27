import { useNavigate } from "react-router-dom";
import { LucideIcon, Diamond } from "lucide-react";
import { getGemCost } from "@/lib/gemCosts";

// Bangla translations for tool descriptions
const BANGLA_DESCRIPTIONS: Record<string, string> = {
  "Character Generator": "আপনার চরিত্রের মুখ ও পরিচয় সম্পূর্ণ সামঞ্জস্যপূর্ণ রেখে নতুন ছবি তৈরি করুন।",
  "Prompt Extractor": "যেকোনো ছবি থেকে বিস্তারিত AI প্রম্পট বের করুন একই রকম ভিজ্যুয়াল তৈরি করতে।",
  "Dress Extractor": "ছবি থেকে পোশাক আলাদা করুন এবং পেশাদার ম্যানেকুইনে প্রদর্শন করুন।",
  "Background Saver": "ব্যাকগ্রাউন্ড অক্ষত রেখে ছবি থেকে অবাঞ্ছিত মানুষ মুছে ফেলুন।",
  "Pose Transfer": "আপনার চরিত্রের পরিচয় অক্ষত রেখে রেফারেন্স ছবি থেকে পোজ ট্রান্সফার করুন।",
  "Makeup Studio": "AI নির্ভুলতার সাথে পোর্ট্রেটে পেশাদার মেকআপ স্টাইল প্রয়োগ করুন।",
  "Face Swap Studio": "পেশাদার মানের সাথে ছবির মধ্যে নিখুঁতভাবে মুখ অদলবদল করুন।",
  "Cinematic Studio": "এক ক্লিকে ছবিকে অসাধারণ সিনেমাটিক শটে রূপান্তর করুন।",
  "Background Creator": "আপনার প্রোডাক্ট ফটোগ্রাফির জন্য সুন্দর AI ব্যাকগ্রাউন্ড তৈরি করুন।",
  "Photography Studio": "সাধারণ ছবিকে DSLR-মানের পেশাদার ছবিতে রূপান্তর করুন।",
  "Caption Studio": "বাংলা বা ইংরেজিতে হাই-কনভার্টিং প্রোডাক্ট ক্যাপশন তৈরি করুন।",
  "Branding Studio": "আপনার ব্র্যান্ড রক্ষা করতে পেশাদারভাবে লোগো ও ওয়াটারমার্ক যুক্ত করুন।",
  "AI Prompt Engineer": "৫-এজেন্ট AI পাইপলাইন ব্যবহার করে সাধারণ প্রম্পটকে পেশাদার প্রম্পটে রূপান্তর করুন।",
};

interface ToolCardProps {
  name: string;
  description: string;
  icon: LucideIcon;
  path: string;
  gemCostKey: string;
  gradient: string;
  delay?: number;
}

export const ToolCard = ({
  name,
  description,
  icon: Icon,
  path,
  gemCostKey,
  gradient,
  delay = 0,
}: ToolCardProps) => {
  const navigate = useNavigate();
  const banglaDescription = BANGLA_DESCRIPTIONS[name] || description;

  return (
    <button
      onClick={() => navigate(path)}
      className="group relative overflow-hidden rounded-xl sm:rounded-2xl lg:rounded-3xl border border-border/50 bg-card/30 backdrop-blur-sm p-3 sm:p-5 lg:p-6 text-left transition-all duration-500 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1 animate-fade-in min-h-[160px] sm:min-h-[200px] active:scale-[0.98]"
      style={{ animationDelay: `${delay * 50}ms` }}
    >
      {/* Gradient background on hover */}
      <div 
        className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${gradient}`}
      />
      
      {/* Icon container */}
      <div className="relative mb-3 sm:mb-5">
        <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-lg sm:rounded-xl lg:rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center group-hover:scale-110 group-hover:bg-primary/20 transition-all duration-300">
          <Icon className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-primary" />
        </div>
      </div>

      {/* Content */}
      <div className="relative space-y-1.5 sm:space-y-2">
        {/* English heading */}
        <h3 className="font-serif text-sm sm:text-lg lg:text-xl font-semibold text-cream group-hover:text-primary transition-colors duration-300 leading-tight">
          {name}
        </h3>
        {/* Bangla description */}
        <p className="font-bangla text-[11px] sm:text-xs lg:text-sm text-cream/60 leading-relaxed line-clamp-2">
          {banglaDescription}
        </p>
      </div>

      {/* Gem cost badge */}
      <div className="relative mt-2 sm:mt-4 lg:mt-5 flex items-center gap-1">
        <Diamond className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-primary/70" />
        <span className="text-[10px] sm:text-xs text-cream/40">
          {getGemCost(gemCostKey)}
        </span>
      </div>

      {/* Arrow indicator - Desktop only */}
      <div className="hidden sm:block absolute top-4 right-4 lg:top-6 lg:right-6 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
        <svg className="w-4 h-4 lg:w-5 lg:h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
        </svg>
      </div>
    </button>
  );
};
