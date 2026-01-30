import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const faqs = [
  {
    question: "BH Studio কি ফ্রি ব্যবহার করা যায়?",
    questionEn: "Is BH Studio free to use?",
    answer: "হ্যাঁ, সাইন আপ করলে ৫০টি ফ্রি জেমস পাবেন যা দিয়ে আপনি বিভিন্ন টুল ট্রাই করতে পারবেন।",
    answerEn: "Yes, you get 50 free gems on signup to try out various tools."
  },
  {
    question: "আমি কি মোবাইল থেকে ব্যবহার করতে পারব?",
    questionEn: "Can I use it on mobile?",
    answer: "অবশ্যই! BH Studio পুরোপুরি মোবাইল-ফ্রেন্ডলি। আপনার ফোন থেকেই সব কাজ করতে পারবেন।",
    answerEn: "Absolutely! BH Studio is fully mobile-friendly."
  },
  {
    question: "আমার কোনো ডিজাইন স্কিল নেই, তাও কি পারব?",
    questionEn: "I have no design skills, can I still use it?",
    answer: "হ্যাঁ, এটাই BH Studio-এর সবচেয়ে বড় সুবিধা। শুধু ছবি আপলোড করুন, অপশন সিলেক্ট করুন— বাকি সব AI করে দেবে।",
    answerEn: "Yes, that's the best part. Just upload and select — AI does the rest."
  },
  {
    question: "আমার ছবির কোয়ালিটি কেমন হবে?",
    questionEn: "What quality output will I get?",
    answer: "প্রফেশনাল স্টুডিও-কোয়ালিটি আউটপুট। সোশ্যাল মিডিয়া, মার্কেটপ্লেস বা প্রিন্ট— সব জায়গায় ব্যবহার করতে পারবেন।",
    answerEn: "Professional studio-quality output suitable for any platform."
  },
  {
    question: "পেমেন্ট কিভাবে করব?",
    questionEn: "How do I pay?",
    answer: "বিকাশ, নগদ বা অন্যান্য মোবাইল পেমেন্ট মেথড দিয়ে সহজেই পেমেন্ট করতে পারবেন।",
    answerEn: "Easy payment via bKash, Nagad, or other mobile payment methods."
  }
];

export const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="py-16 sm:py-24 lg:py-32 relative overflow-hidden px-4 sm:px-6 lg:px-8">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-charcoal-deep to-background" />
      
      <div className="relative max-w-3xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="font-bangla text-2xl sm:text-3xl lg:text-4xl font-semibold text-cream mb-2">
            সাধারণ <span className="gradient-text">প্রশ্নাবলী</span>
          </h2>
          <p className="text-sm sm:text-base text-cream/50 font-light">
            Frequently Asked Questions
          </p>
        </div>

        {/* FAQ Items */}
        <div className="space-y-3 sm:space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="rounded-xl sm:rounded-2xl bg-card/30 border border-gold/10 overflow-hidden transition-all duration-300 hover:border-gold/20"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full p-4 sm:p-5 flex items-start justify-between text-left"
              >
                <div className="flex-1 pr-4">
                  <p className="font-bangla text-sm sm:text-base font-medium text-cream mb-0.5">
                    {faq.question}
                  </p>
                  <p className="text-xs sm:text-sm text-cream/40">
                    {faq.questionEn}
                  </p>
                </div>
                <ChevronDown 
                  className={cn(
                    "w-5 h-5 text-gold/60 flex-shrink-0 transition-transform duration-300 mt-1",
                    openIndex === index && "rotate-180"
                  )}
                />
              </button>
              
              {openIndex === index && (
                <div className="px-4 sm:px-5 pb-4 sm:pb-5 animate-fade-in">
                  <div className="pt-2 border-t border-gold/10">
                    <p className="font-bangla text-sm sm:text-base text-cream/70 mt-3 leading-relaxed">
                      {faq.answer}
                    </p>
                    <p className="text-xs sm:text-sm text-cream/40 mt-1">
                      {faq.answerEn}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
