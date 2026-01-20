import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useCredits } from "@/hooks/useCredits";
import { useAdmin } from "@/hooks/useAdmin";
import { useClasses, ClassItem } from "@/hooks/useClasses";
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
  MessageCircle,
  Crown,
  Loader2
} from "lucide-react";

const ICON_MAP: Record<string, React.ElementType> = {
  target: Target,
  check: CheckCircle2,
  palette: Palette,
  megaphone: Megaphone,
  trending: TrendingUp,
  zap: Zap,
  star: Star,
};

const HEADER_ICON_MAP: Record<string, React.ElementType> = {
  zap: Zap,
  sparkles: Sparkles,
  star: Star,
  crown: Crown,
  graduation: GraduationCap,
};

const Classes = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { credits } = useCredits();
  const { isAdmin } = useAdmin();
  const { classes, pageSettings, loading } = useClasses();
  const heroRef = useRef<HTMLDivElement>(null);
  
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<string>("default");

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

  const handleCTA = (classItem: ClassItem) => {
    switch (classItem.cta_type) {
      case 'whatsapp':
        if (classItem.cta_link) {
          const cleanNumber = classItem.cta_link.replace(/[^0-9]/g, '');
          window.open(`https://wa.me/${cleanNumber}`, '_blank');
        }
        break;
      case 'phone':
        if (classItem.cta_link) {
          window.open(`tel:${classItem.cta_link}`, '_blank');
        }
        break;
      case 'link':
        if (classItem.cta_link) {
          window.open(classItem.cta_link, '_blank');
        }
        break;
      case 'modal':
      default:
        setSelectedProgram(classItem.id);
        setModalOpen(true);
        break;
    }
  };

  const getFeatureIcon = (iconName: string) => {
    const Icon = ICON_MAP[iconName] || Target;
    return Icon;
  };

  const getHeaderIcon = (iconType: string) => {
    const Icon = HEADER_ICON_MAP[iconType] || Zap;
    return Icon;
  };

  const renderClassCard = (classItem: ClassItem) => {
    const isRoseGold = classItem.color_theme === 'rose-gold';
    const themeColor = isRoseGold ? 'rose-gold' : 'gold';
    const HeaderIcon = getHeaderIcon(classItem.icon_type);

    return (
      <div 
        key={classItem.id}
        className={`group relative bg-card/50 backdrop-blur-sm border rounded-2xl sm:rounded-3xl p-5 sm:p-8 transition-all duration-500 ${
          isRoseGold 
            ? 'border-rose-gold/30 hover:border-rose-gold/50 hover:shadow-[0_0_60px_-15px_rgba(183,110,121,0.3)]' 
            : 'border-gold/20 hover:border-gold/40 hover:shadow-[0_0_60px_-15px_rgba(212,175,55,0.3)]'
        }`}
      >
        {/* Popular Badge */}
        {classItem.is_popular && (
          <div className="absolute -top-3 right-4 sm:right-6 px-3 sm:px-4 py-1 sm:py-1.5 bg-gradient-to-r from-rose-gold to-gold rounded-full text-[10px] sm:text-xs font-semibold text-background">
            Most Popular
          </div>
        )}
        
        {/* Glow Effect */}
        <div className={`absolute inset-0 bg-gradient-to-br ${isRoseGold ? 'from-rose-gold/5' : 'from-gold/5'} to-transparent rounded-2xl sm:rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
        
        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              isRoseGold 
                ? 'bg-gradient-to-br from-rose-gold/20 to-gold/20 border border-rose-gold/30' 
                : 'gold-icon'
            }`}>
              <HeaderIcon className={`w-6 h-6 ${isRoseGold ? 'text-rose-gold' : 'text-gold'}`} />
            </div>
            <div>
              <span className={`text-xs uppercase tracking-wider ${isRoseGold ? 'text-rose-gold/70' : 'text-gold/70'}`}>
                {classItem.badge_text}
              </span>
              <h3 className="font-serif text-xl font-semibold text-cream">{classItem.duration_text}</h3>
            </div>
          </div>

          {/* Title */}
          <h2 className="font-serif text-2xl font-bold text-cream mb-6">
            {classItem.title}
          </h2>

          {/* Features */}
          <div className="space-y-4 mb-8">
            {classItem.features.map((feature, idx) => {
              const FeatureIcon = getFeatureIcon(feature.icon);
              return (
                <div key={idx} className="flex items-start gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    isRoseGold ? 'bg-rose-gold/10' : 'bg-gold/10'
                  }`}>
                    <FeatureIcon className={`w-3.5 h-3.5 ${isRoseGold ? 'text-rose-gold' : 'text-gold'}`} />
                  </div>
                  <div>
                    <p className="text-cream font-medium">{feature.title}</p>
                    <p className="text-cream/60 text-sm">{feature.description}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Program Format */}
          <div className={`flex flex-wrap items-center gap-3 sm:gap-4 mb-8 p-3 sm:p-4 bg-secondary/30 rounded-xl border ${
            isRoseGold ? 'border-rose-gold/10' : 'border-gold/10'
          }`}>
            <div className="flex items-center gap-2">
              <Clock className={`w-4 h-4 flex-shrink-0 ${isRoseGold ? 'text-rose-gold' : 'text-gold'}`} />
              <span className="text-xs sm:text-sm text-cream/70 whitespace-nowrap">{classItem.days_online}</span>
            </div>
            <div className="hidden sm:block w-px h-4 bg-gold/20" />
            <div className="flex items-center gap-2">
              <Star className={`w-4 h-4 flex-shrink-0 ${isRoseGold ? 'text-rose-gold' : 'text-gold'}`} />
              <span className="text-xs sm:text-sm text-cream/70 whitespace-nowrap">{classItem.hours}</span>
            </div>
            <div className="hidden sm:block w-px h-4 bg-gold/20" />
            <div className="flex items-center gap-2">
              <Users className={`w-4 h-4 flex-shrink-0 ${isRoseGold ? 'text-rose-gold' : 'text-gold'}`} />
              <span className="text-xs sm:text-sm text-cream/70 whitespace-nowrap">{classItem.support_text}</span>
            </div>
          </div>

          {/* Price Section */}
          <div className="mb-6">
            <p className="text-sm text-cream/50 mb-1">{classItem.price_label}</p>
            <p className={`text-3xl font-serif font-bold ${
              isRoseGold 
                ? 'bg-gradient-to-r from-rose-gold to-gold bg-clip-text text-transparent' 
                : 'text-gold'
            }`}>
              ৳{classItem.price.toLocaleString()} <span className="text-base font-normal text-cream/50">BDT</span>
            </p>
            {classItem.bkash_number && (
              <p className="text-sm text-cream/50 mt-2 flex items-center gap-2">
                <MessageCircle className="w-4 h-4" />
                bKash: {classItem.bkash_number}
              </p>
            )}
          </div>

          {/* CTA Button */}
          <Button 
            onClick={() => handleCTA(classItem)}
            className={`w-full h-12 font-semibold shadow-lg transition-all duration-300 ${
              isRoseGold 
                ? 'bg-gradient-to-r from-rose-gold to-gold hover:from-rose-gold/90 hover:to-gold/90 text-background hover:shadow-rose-gold/25' 
                : 'btn-glow'
            }`}
            variant={isRoseGold ? 'default' : 'gold'}
            size="lg"
          >
            <Phone className="w-4 h-4 mr-2" />
            {classItem.cta_text}
          </Button>
        </div>
      </div>
    );
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
            <span className="text-sm font-medium text-gold">
              {pageSettings.hero_badge || 'Creators Studio Education'}
            </span>
          </div>

          {/* Main Title */}
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 animate-fade-in">
            <span className="gradient-text">{pageSettings.hero_title_highlight || 'Creators Studio'}</span>
            <span className="text-cream">{pageSettings.hero_title_suffix || ' — The CEO Launchpad'}</span>
          </h1>

          {/* Bangla Subtitle */}
          <p 
            className="text-lg sm:text-xl text-cream/70 max-w-3xl mx-auto leading-relaxed mb-12 animate-fade-in" 
            style={{ animationDelay: "0.1s" }}
            dangerouslySetInnerHTML={{ 
              __html: pageSettings.hero_subtitle || '"এফ-কমার্স ব্যবসাকে <span class="text-gold font-semibold">Stable, Organized & Predictable Profit System</span> এ রূপান্তর করার প্রোগ্রাম"'
            }}
          />
        </div>
      </section>

      {/* Course Cards Section */}
      <section className="py-10 sm:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-gold" />
            </div>
          ) : classes.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-cream/50 text-lg">No classes available at the moment.</p>
              <p className="text-cream/30 text-sm mt-2">Check back soon for new programs!</p>
            </div>
          ) : (
            <div className={`grid grid-cols-1 gap-6 sm:gap-8 ${classes.length === 1 ? 'max-w-xl mx-auto' : 'md:grid-cols-2'}`}>
              {classes.filter(c => c.is_active).map(renderClassCard)}
            </div>
          )}
        </div>
      </section>

      {/* FAQ Section */}
      <ClassesFAQ />

      <Footer />

      {/* Lead Capture Modal */}
      <LeadCaptureModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        selectedProgram={selectedProgram === "default" ? "3_days" : selectedProgram as "3_days" | "5_days"}
      />
    </div>
  );
};

export default Classes;
