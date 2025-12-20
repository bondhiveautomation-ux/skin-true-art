import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useCredits } from "@/hooks/useCredits";
import { useAdmin } from "@/hooks/useAdmin";
import { LeadCaptureModal } from "@/components/classes/LeadCaptureModal";
import { ClassesFAQ } from "@/components/classes/ClassesFAQ";
import { 
  GraduationCap, 
  Clock, 
  Users, 
  Star, 
  CheckCircle2, 
  Phone,
  Sparkles,
  Target,
  Palette,
  Megaphone,
  TrendingUp,
  Zap,
  MessageCircle
} from "lucide-react";

const Classes = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { credits } = useCredits();
  const { isAdmin } = useAdmin();
  const heroRef = useRef<HTMLDivElement>(null);
  
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<"3_days" | "5_days">("3_days");

  const handleNavigate = (section: string) => {
    if (section === "hero") {
      navigate("/");
    } else {
      navigate("/");
      setTimeout(() => {
        const el = document.getElementById(section);
        el?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  };

  const openEnrollModal = (program: "3_days" | "5_days") => {
    setSelectedProgram(program);
    setModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <Navbar
        onNavigate={handleNavigate}
        onSignOut={user ? signOut : undefined}
        userEmail={user?.email}
        credits={credits}
        isAdmin={isAdmin}
      />

      {/* Hero Section */}
      <section ref={heroRef} className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-b from-gold/5 via-transparent to-transparent pointer-events-none" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-rose-gold/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold/10 border border-gold/30 mb-8 animate-fade-in">
            <GraduationCap className="w-4 h-4 text-gold" />
            <span className="text-sm font-medium text-gold">BondHive Education</span>
          </div>

          {/* Main Title */}
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 animate-fade-in">
            <span className="gradient-text">BondHive</span>
            <span className="text-cream"> — The CEO Launchpad</span>
          </h1>

          {/* Bangla Subtitle */}
          <p className="text-lg sm:text-xl text-cream/70 max-w-3xl mx-auto leading-relaxed mb-12 animate-fade-in" style={{ animationDelay: "0.1s" }}>
            "এফ-কমার্স ব্যবসাকে <span className="text-gold font-semibold">Stable, Organized & Predictable Profit System</span> এ রূপান্তর করার প্রোগ্রাম"
          </p>
        </div>
      </section>

      {/* Course Cards Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            {/* 3 Days Program Card */}
            <div className="group relative bg-card/50 backdrop-blur-sm border border-gold/20 rounded-3xl p-8 hover:border-gold/40 transition-all duration-500 hover:shadow-[0_0_60px_-15px_rgba(212,175,55,0.3)]">
              {/* Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-gold/5 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="relative z-10">
                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl gold-icon flex items-center justify-center">
                    <Zap className="w-6 h-6 text-gold" />
                  </div>
                  <div>
                    <span className="text-xs uppercase tracking-wider text-gold/70">Fast Track</span>
                    <h3 className="font-serif text-xl font-semibold text-cream">3 Days Program</h3>
                  </div>
                </div>

                {/* Title */}
                <h2 className="font-serif text-2xl font-bold text-cream mb-6">
                  The 3 Days F-Commerce CEO Fast Track Program
                </h2>

                {/* Key Promises */}
                <div className="space-y-4 mb-8">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-gold/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Target className="w-3.5 h-3.5 text-gold" />
                    </div>
                    <div>
                      <p className="text-cream font-medium">CEO Foundation</p>
                      <p className="text-cream/60 text-sm">Business Plan + Dream Customer Persona</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-gold/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-gold" />
                    </div>
                    <div>
                      <p className="text-cream font-medium">Unstoppable Page Setup</p>
                      <p className="text-cream/60 text-sm">+ Trust Policies</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-gold/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Palette className="w-3.5 h-3.5 text-gold" />
                    </div>
                    <div>
                      <p className="text-cream font-medium">Visual Authority</p>
                      <p className="text-cream/60 text-sm">Brand kit + AI-powered premium visuals + CapCut reels</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-gold/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Megaphone className="w-3.5 h-3.5 text-gold" />
                    </div>
                    <div>
                      <p className="text-cream font-medium">Ad Manager Gateway</p>
                      <p className="text-cream/60 text-sm">Stop wasting money on Boost Post; messages objective + targeting</p>
                    </div>
                  </div>
                </div>

                {/* Program Format */}
                <div className="flex items-center gap-4 mb-8 p-4 bg-secondary/30 rounded-xl border border-gold/10">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gold" />
                    <span className="text-sm text-cream/70">3 Days Online</span>
                  </div>
                  <div className="w-px h-4 bg-gold/20" />
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-gold" />
                    <span className="text-sm text-cream/70">6 Hours</span>
                  </div>
                  <div className="w-px h-4 bg-gold/20" />
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gold" />
                    <span className="text-sm text-cream/70">Long Term Support</span>
                  </div>
                </div>

                {/* Price Section */}
                <div className="mb-6">
                  <p className="text-sm text-cream/50 mb-1">Training Fee</p>
                  <p className="text-3xl font-serif font-bold text-gold">৳3,000 <span className="text-base font-normal text-cream/50">BDT</span></p>
                  <p className="text-sm text-cream/50 mt-2 flex items-center gap-2">
                    <MessageCircle className="w-4 h-4" />
                    bKash: 01328845972
                  </p>
                </div>

                {/* CTA Button */}
                <Button 
                  onClick={() => openEnrollModal("3_days")}
                  variant="gold" 
                  size="lg" 
                  className="w-full btn-glow group"
                >
                  <Phone className="w-4 h-4 mr-2 group-hover:animate-pulse" />
                  Get a Call / Enroll Interest
                </Button>
              </div>
            </div>

            {/* 5 Days Program Card */}
            <div className="group relative bg-card/50 backdrop-blur-sm border border-rose-gold/30 rounded-3xl p-8 hover:border-rose-gold/50 transition-all duration-500 hover:shadow-[0_0_60px_-15px_rgba(183,110,121,0.3)]">
              {/* Popular Badge */}
              <div className="absolute -top-3 right-6 px-4 py-1.5 bg-gradient-to-r from-rose-gold to-gold rounded-full text-xs font-semibold text-background">
                Most Popular
              </div>
              
              {/* Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-rose-gold/5 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="relative z-10">
                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-gold/20 to-gold/20 border border-rose-gold/30 flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-rose-gold" />
                  </div>
                  <div>
                    <span className="text-xs uppercase tracking-wider text-rose-gold/70">Masterclass</span>
                    <h3 className="font-serif text-xl font-semibold text-cream">5 Days Program</h3>
                  </div>
                </div>

                {/* Title */}
                <h2 className="font-serif text-2xl font-bold text-cream mb-6">
                  The 5 Days F-Commerce Masterclass
                </h2>

                {/* Key Promises */}
                <div className="space-y-4 mb-8">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-rose-gold/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Target className="w-3.5 h-3.5 text-rose-gold" />
                    </div>
                    <div>
                      <p className="text-cream font-medium">Day 1: CEO Foundation</p>
                      <p className="text-cream/60 text-sm">Persona + page structure + trust</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-rose-gold/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Palette className="w-3.5 h-3.5 text-rose-gold" />
                    </div>
                    <div>
                      <p className="text-cream font-medium">Day 2: Visual Authority</p>
                      <p className="text-cream/60 text-sm">Brand kit + AI visuals + reels</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-rose-gold/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Zap className="w-3.5 h-3.5 text-rose-gold" />
                    </div>
                    <div>
                      <p className="text-cream font-medium">Day 3: AI Content Engine</p>
                      <p className="text-cream/60 text-sm">Hook–Story–Offer, weekly copy system, automation</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-rose-gold/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Megaphone className="w-3.5 h-3.5 text-rose-gold" />
                    </div>
                    <div>
                      <p className="text-cream font-medium">Day 4: Ad Manager Gateway</p>
                      <p className="text-cream/60 text-sm">Strategic spending, targeting, messages objective</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-rose-gold/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <TrendingUp className="w-3.5 h-3.5 text-rose-gold" />
                    </div>
                    <div>
                      <p className="text-cream font-medium">Day 5: Profit Launch & Roadmap</p>
                      <p className="text-cream/60 text-sm">Metrics + decision making + roadmap</p>
                    </div>
                  </div>
                </div>

                {/* Program Format */}
                <div className="flex items-center gap-4 mb-8 p-4 bg-secondary/30 rounded-xl border border-rose-gold/10">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-rose-gold" />
                    <span className="text-sm text-cream/70">5 Days Online</span>
                  </div>
                  <div className="w-px h-4 bg-rose-gold/20" />
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-rose-gold" />
                    <span className="text-sm text-cream/70">10 Hours</span>
                  </div>
                  <div className="w-px h-4 bg-rose-gold/20" />
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-rose-gold" />
                    <span className="text-sm text-cream/70">Long Term Support</span>
                  </div>
                </div>

                {/* Price Section */}
                <div className="mb-6">
                  <p className="text-sm text-cream/50 mb-1">Training Fee</p>
                  <p className="text-3xl font-serif font-bold bg-gradient-to-r from-rose-gold to-gold bg-clip-text text-transparent">৳5,000 <span className="text-base font-normal text-cream/50">BDT</span></p>
                  <p className="text-sm text-cream/50 mt-2 flex items-center gap-2">
                    <MessageCircle className="w-4 h-4" />
                    bKash: 01328845972
                  </p>
                </div>

                {/* CTA Button */}
                <Button 
                  onClick={() => openEnrollModal("5_days")}
                  className="w-full h-12 bg-gradient-to-r from-rose-gold to-gold hover:from-rose-gold/90 hover:to-gold/90 text-background font-semibold shadow-lg hover:shadow-rose-gold/25 transition-all duration-300"
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Get a Call / Enroll Interest
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <ClassesFAQ />

      <Footer />

      {/* Lead Capture Modal */}
      <LeadCaptureModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        selectedProgram={selectedProgram}
      />
    </div>
  );
};

export default Classes;
