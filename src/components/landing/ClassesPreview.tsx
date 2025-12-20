import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  GraduationCap, 
  Clock, 
  Users, 
  Star, 
  Zap,
  Sparkles,
  ArrowRight
} from "lucide-react";

export const ClassesPreview = () => {
  const navigate = useNavigate();

  return (
    <section className="py-20 lg:py-28 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gold/5 to-transparent pointer-events-none" />
      <div className="absolute top-1/2 left-1/4 w-80 h-80 bg-gold/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-rose-gold/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-12 lg:mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold/10 border border-gold/30 mb-6 animate-fade-in">
            <GraduationCap className="w-4 h-4 text-gold" />
            <span className="text-sm font-medium text-gold">BondHive Education</span>
          </div>
          
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            <span className="gradient-text">CEO Launchpad</span>
          </h2>
          
          <p className="text-lg text-cream/60 max-w-2xl mx-auto">
            "এফ-কমার্স ব্যবসাকে <span className="text-gold">Stable, Organized & Predictable Profit System</span> এ রূপান্তর করুন"
          </p>
        </div>

        {/* Course Cards */}
        <div className="grid md:grid-cols-2 gap-6 lg:gap-8 mb-12">
          {/* 3 Days Program */}
          <div className="group relative bg-card/50 backdrop-blur-sm border border-gold/20 rounded-2xl p-6 lg:p-8 hover:border-gold/40 transition-all duration-500 hover:shadow-[0_0_40px_-15px_rgba(212,175,55,0.3)]">
            <div className="absolute inset-0 bg-gradient-to-br from-gold/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg gold-icon flex items-center justify-center">
                  <Zap className="w-5 h-5 text-gold" />
                </div>
                <div>
                  <span className="text-xs uppercase tracking-wider text-gold/70">Fast Track</span>
                  <h3 className="font-serif text-lg font-semibold text-cream">3 Days Program</h3>
                </div>
              </div>

              <p className="text-cream/70 mb-4 text-sm leading-relaxed">
                CEO Foundation, Page Setup, Visual Authority & Ad Manager Gateway
              </p>

              <div className="flex items-center gap-3 mb-4 text-xs text-cream/50">
                <div className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>6 Hours</span>
                </div>
                <div className="w-px h-3 bg-gold/20" />
                <div className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" />
                  <span>Long Term Support</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <p className="text-xl font-serif font-bold text-gold">৳3,000</p>
                <Star className="w-4 h-4 text-gold/50" />
              </div>
            </div>
          </div>

          {/* 5 Days Program */}
          <div className="group relative bg-card/50 backdrop-blur-sm border border-rose-gold/30 rounded-2xl p-6 lg:p-8 hover:border-rose-gold/50 transition-all duration-500 hover:shadow-[0_0_40px_-15px_rgba(183,110,121,0.3)]">
            {/* Popular Badge */}
            <div className="absolute -top-2.5 right-5 px-3 py-1 bg-gradient-to-r from-rose-gold to-gold rounded-full text-[10px] font-semibold text-background uppercase tracking-wide">
              Most Popular
            </div>
            
            <div className="absolute inset-0 bg-gradient-to-br from-rose-gold/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-rose-gold/20 to-gold/20 border border-rose-gold/30 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-rose-gold" />
                </div>
                <div>
                  <span className="text-xs uppercase tracking-wider text-rose-gold/70">Masterclass</span>
                  <h3 className="font-serif text-lg font-semibold text-cream">5 Days Program</h3>
                </div>
              </div>

              <p className="text-cream/70 mb-4 text-sm leading-relaxed">
                Complete F-Commerce Mastery: Foundation to Profit Launch & Roadmap
              </p>

              <div className="flex items-center gap-3 mb-4 text-xs text-cream/50">
                <div className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>10 Hours</span>
                </div>
                <div className="w-px h-3 bg-rose-gold/20" />
                <div className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" />
                  <span>Long Term Support</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <p className="text-xl font-serif font-bold bg-gradient-to-r from-rose-gold to-gold bg-clip-text text-transparent">৳5,000</p>
                <Star className="w-4 h-4 text-rose-gold/50 fill-rose-gold/30" />
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Button 
            onClick={() => navigate("/classes")}
            variant="gold"
            size="lg"
            className="btn-glow group"
          >
            Explore Classes
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>
    </section>
  );
};
