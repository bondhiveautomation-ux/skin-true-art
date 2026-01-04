import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Sparkles, 
  ArrowLeft,
  BookOpen,
  Lightbulb,
  Palette,
  Camera,
  Wand2,
  Users,
  ChevronRight,
  MessageCircle
} from "lucide-react";

const WHATSAPP_NUMBER = "8801234567890"; // Replace with actual WhatsApp number
const WHATSAPP_MESSAGE = encodeURIComponent("Hi, I'd like to request access to Brandify.");

const ARTICLES = [
  {
    id: 1,
    icon: Camera,
    title: "Getting Started with AI Photography",
    excerpt: "Learn how to use Brandify's Photography Studio to create DSLR-quality images from your smartphone photos.",
    category: "Getting Started",
    readTime: "5 min read"
  },
  {
    id: 2,
    icon: Palette,
    title: "Mastering AI Makeup Transfer",
    excerpt: "A comprehensive guide to using the Makeup Studio and Full Look Transfer for professional beauty content.",
    category: "Tutorials",
    readTime: "8 min read"
  },
  {
    id: 3,
    icon: Wand2,
    title: "Character Consistency in AI Generation",
    excerpt: "How to maintain visual identity across all your generated content using the Character Generator.",
    category: "Best Practices",
    readTime: "6 min read"
  },
  {
    id: 4,
    icon: Users,
    title: "Building Your Brand with AI",
    excerpt: "Strategies for using Brandify's tools to create a cohesive brand identity across all platforms.",
    category: "Branding",
    readTime: "7 min read"
  },
  {
    id: 5,
    icon: Lightbulb,
    title: "Creative Workflows for Fashion Content",
    excerpt: "Optimize your content creation process with these proven workflows for fashion creators.",
    category: "Workflows",
    readTime: "10 min read"
  },
  {
    id: 6,
    icon: BookOpen,
    title: "Understanding Gems & Credits",
    excerpt: "Everything you need to know about Brandify's gem system and how to maximize your usage.",
    category: "Platform Guide",
    readTime: "4 min read"
  }
];

const Info = () => {
  const navigate = useNavigate();

  const handleWhatsAppClick = () => {
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MESSAGE}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-charcoal-deep relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-gold/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 left-1/4 w-[300px] h-[300px] bg-rose-gold/4 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1.5s" }} />
        <div className="absolute inset-0 noise-texture" />
      </div>

      {/* Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 header-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo */}
            <button 
              onClick={() => navigate("/")}
              className="flex items-center gap-2 sm:gap-3 group"
            >
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg gold-icon flex items-center justify-center group-hover:animate-pulse-glow transition-all duration-300">
                <Sparkles className="w-4 h-4 text-gold" />
              </div>
              <span className="font-serif text-lg sm:text-xl lg:text-2xl font-semibold text-cream tracking-tight group-hover:text-gold transition-colors duration-300">
                Brandify
              </span>
            </button>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-6 lg:gap-8">
              <button
                onClick={() => navigate("/")}
                className="text-xs font-medium text-cream/60 hover:text-gold transition-colors duration-300 tracking-wide uppercase"
              >
                Home
              </button>
              <Button
                onClick={() => navigate("/auth")}
                variant="ghost"
                className="text-sm font-medium text-cream/70 hover:text-gold hover:bg-gold/5"
              >
                Sign In
              </Button>
              <Button
                onClick={handleWhatsAppClick}
                variant="gold"
                size="sm"
                className="btn-glow"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Request Access
              </Button>
            </nav>

            {/* Mobile Nav */}
            <div className="flex md:hidden items-center gap-2">
              <Button
                onClick={() => navigate("/auth")}
                variant="ghost"
                size="sm"
                className="text-cream/70 hover:text-gold"
              >
                Sign In
              </Button>
              <Button
                onClick={handleWhatsAppClick}
                variant="gold"
                size="sm"
              >
                <MessageCircle className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative pt-28 sm:pt-36 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          {/* Back Button */}
          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-2 text-sm text-cream/50 hover:text-gold transition-colors duration-300 mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </button>

          {/* Page Header */}
          <div className="text-center mb-16 sm:mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold/10 border border-gold/25 mb-6 backdrop-blur-sm">
              <BookOpen className="w-3.5 h-3.5 text-gold" />
              <span className="text-xs font-semibold text-gold uppercase tracking-widest">Knowledge Hub</span>
            </div>
            
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-cream tracking-tight mb-6">
              Brandify <span className="gradient-text">Knowledge Hub</span>
            </h1>
            
            <p className="text-lg text-cream/50 max-w-xl mx-auto font-light leading-relaxed">
              Guides, insights, and best practices for creators using AI professionally.
            </p>
          </div>

          {/* Articles Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {ARTICLES.map((article) => (
              <article
                key={article.id}
                className="group p-6 sm:p-8 rounded-2xl bg-card/30 border border-gold/10 backdrop-blur-sm hover:border-gold/25 transition-all duration-500 cursor-pointer"
              >
                {/* Category & Read Time */}
                <div className="flex items-center gap-3 mb-4">
                  <span className="px-3 py-1 text-[10px] font-semibold text-gold uppercase tracking-wider bg-gold/10 rounded-full">
                    {article.category}
                  </span>
                  <span className="text-xs text-cream/40">
                    {article.readTime}
                  </span>
                </div>

                {/* Icon & Title */}
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl gold-icon flex items-center justify-center flex-shrink-0 group-hover:shadow-gold transition-all duration-500">
                    <article.icon className="w-5 h-5 text-gold" />
                  </div>
                  <h2 className="font-serif text-xl font-semibold text-cream group-hover:text-gold transition-colors duration-300 leading-tight">
                    {article.title}
                  </h2>
                </div>

                {/* Excerpt */}
                <p className="text-sm text-cream/50 leading-relaxed mb-5">
                  {article.excerpt}
                </p>

                {/* Read More */}
                <div className="flex items-center gap-2 text-gold/70 group-hover:text-gold transition-colors duration-300">
                  <span className="text-xs font-semibold uppercase tracking-wider">Read More</span>
                  <ChevronRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" />
                </div>
              </article>
            ))}
          </div>

          {/* Coming Soon Note */}
          <div className="mt-16 text-center">
            <div className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-card/30 border border-gold/10">
              <Lightbulb className="w-4 h-4 text-gold" />
              <span className="text-sm text-cream/50">
                More articles coming soon. Have a topic suggestion?{" "}
                <button
                  onClick={handleWhatsAppClick}
                  className="text-gold hover:text-gold/80 transition-colors"
                >
                  Let us know
                </button>
              </span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative py-12 border-t border-gold/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg gold-icon flex items-center justify-center">
                <Sparkles className="w-3 h-3 text-gold" />
              </div>
              <span className="font-serif text-sm font-semibold text-cream">
                Brandify
              </span>
              <span className="text-xs text-cream/30 ml-2">
                Private access platform
              </span>
            </div>
            
            <p className="text-[10px] text-cream/25 tracking-wider uppercase">
              © {new Date().getFullYear()} Brandify. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Info;
