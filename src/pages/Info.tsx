import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useArticles, Article } from "@/hooks/useArticles";
import { useContent } from "@/hooks/useSiteContent";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  MessageCircle,
  Target,
  Zap,
  Loader2,
  Facebook,
  X
} from "lucide-react";

const WHATSAPP_NUMBER = "17059884080";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  BookOpen,
  Camera,
  Palette,
  Wand2,
  Users,
  Lightbulb,
  Sparkles,
  Target,
  Zap,
};

const Info = () => {
  const navigate = useNavigate();
  const { articles, loading, fetchArticles } = useArticles();
  const { content: headerContent } = useContent("header");
  const { content: infoContent } = useContent("info");
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  useEffect(() => {
    fetchArticles(true); // Fetch only published articles
  }, [fetchArticles]);

  const handleReadMore = (article: Article) => {
    setSelectedArticle(article);
  };

  const brandName = headerContent.brand_name || "BH Studio";
  const whatsappMessage = encodeURIComponent(infoContent.whatsapp_message || "Hi, I'd like to request access to BH Studio.");
  
  // Info page content
  const pageBadge = infoContent.page_badge || "Knowledge Hub";
  const pageTitle1 = infoContent.page_title_1 || "BH Studio";
  const pageTitle2 = infoContent.page_title_2 || "Knowledge Hub";
  const pageSubtitle = infoContent.page_subtitle || "Guides, insights, and best practices for creators using AI professionally.";
  const comingSoonText = infoContent.coming_soon_text || "More articles coming soon. Have a topic suggestion?";
  
  // Footer
  const footerTagline = infoContent.footer_tagline || "Private access platform";
  const footerCopyright = (infoContent.footer_copyright || "© {year} BH Studio. All rights reserved.")
    .replace("{year}", new Date().getFullYear().toString());

  const handleWhatsAppClick = () => {
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${whatsappMessage}`, "_blank");
  };

  const getIconComponent = (iconName: string | null) => {
    return ICON_MAP[iconName || "BookOpen"] || BookOpen;
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
                {brandName}
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
              <span className="text-xs font-semibold text-gold uppercase tracking-widest">{pageBadge}</span>
            </div>
            
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-cream tracking-tight mb-6">
              {pageTitle1} <span className="gradient-text">{pageTitle2}</span>
            </h1>
            
            <p className="text-lg text-cream/50 max-w-xl mx-auto font-light leading-relaxed">
              {pageSubtitle}
            </p>
          </div>

          {/* Articles Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-gold" />
            </div>
          ) : articles.length === 0 ? (
            <div className="text-center py-20">
              <BookOpen className="w-16 h-16 text-gold/20 mx-auto mb-4" />
              <p className="text-cream/50">No articles published yet. Check back soon!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {articles.map((article) => {
                const IconComponent = getIconComponent(article.icon);
                const shareUrl = `${window.location.origin}/info?article=${article.id}`;
                const shareText = encodeURIComponent(`${article.title} - ${article.excerpt}`);
                
                const handleFacebookShare = (e: React.MouseEvent) => {
                  e.stopPropagation();
                  window.open(
                    `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${shareText}`,
                    '_blank',
                    'width=600,height=400'
                  );
                };
                
                return (
                  <article
                    key={article.id}
                    className="group p-6 sm:p-8 rounded-2xl bg-card/30 border border-gold/10 backdrop-blur-sm hover:border-gold/25 transition-all duration-500"
                  >
                    {/* Category, Read Time & Share */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <span className="px-3 py-1 text-[10px] font-semibold text-gold uppercase tracking-wider bg-gold/10 rounded-full">
                          {article.category}
                        </span>
                        <span className="text-xs text-cream/40">
                          {article.read_time}
                        </span>
                      </div>
                      
                      {/* Share Button */}
                      <button
                        onClick={handleFacebookShare}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1877F2]/10 hover:bg-[#1877F2]/20 border border-[#1877F2]/20 hover:border-[#1877F2]/40 transition-all duration-300 group/share"
                        title="Share on Facebook"
                      >
                        <Facebook className="w-3.5 h-3.5 text-[#1877F2]" />
                        <span className="text-[10px] font-medium text-[#1877F2] uppercase tracking-wide">Share</span>
                      </button>
                    </div>

                    {/* Icon & Title */}
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-12 h-12 rounded-xl gold-icon flex items-center justify-center flex-shrink-0 group-hover:shadow-gold transition-all duration-500">
                        <IconComponent className="w-5 h-5 text-gold" />
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
                    <button
                      onClick={() => handleReadMore(article)}
                      className="flex items-center gap-2 text-gold/70 hover:text-gold transition-colors duration-300"
                    >
                      <span className="text-xs font-semibold uppercase tracking-wider">Read More</span>
                      <ChevronRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" />
                    </button>
                  </article>
                );
              })}
            </div>
          )}

          {/* Coming Soon Note */}
          <div className="mt-16 text-center">
            <div className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-card/30 border border-gold/10">
              <Lightbulb className="w-4 h-4 text-gold" />
              <span className="text-sm text-cream/50">
                {comingSoonText}{" "}
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
                {brandName}
              </span>
              <span className="text-xs text-cream/30 ml-2">
                {footerTagline}
              </span>
            </div>
            
            <p className="text-[10px] text-cream/25 tracking-wider uppercase">
              {footerCopyright}
            </p>
          </div>
        </div>
      </footer>

      {/* Article Detail Dialog */}
      <Dialog open={!!selectedArticle} onOpenChange={() => setSelectedArticle(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] bg-charcoal-deep border-gold/20 p-0 overflow-hidden">
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-gold/10">
            <div className="flex items-center gap-3 mb-2">
              <span className="px-3 py-1 text-[10px] font-semibold text-gold uppercase tracking-wider bg-gold/10 rounded-full">
                {selectedArticle?.category}
              </span>
              <span className="text-xs text-cream/40">
                {selectedArticle?.read_time}
              </span>
            </div>
            <DialogTitle className="font-serif text-xl sm:text-2xl font-semibold text-cream leading-tight pr-8">
              {selectedArticle?.title}
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] px-6 py-6">
            <div className="prose prose-invert prose-gold max-w-none
              prose-headings:font-serif prose-headings:text-cream prose-headings:font-semibold
              prose-h2:text-xl prose-h2:mt-8 prose-h2:mb-4 prose-h2:border-b prose-h2:border-gold/10 prose-h2:pb-2
              prose-h3:text-lg prose-h3:mt-6 prose-h3:mb-3 prose-h3:text-gold
              prose-p:text-cream/70 prose-p:leading-relaxed prose-p:mb-4
              prose-strong:text-cream prose-strong:font-semibold
              prose-ul:text-cream/70 prose-li:mb-2
              prose-hr:border-gold/10 prose-hr:my-8
            ">
              {selectedArticle?.content?.split('\n').map((line, index) => {
                // Handle headers
                if (line.startsWith('## ')) {
                  return <h2 key={index}>{line.replace('## ', '')}</h2>;
                }
                if (line.startsWith('### ')) {
                  return <h3 key={index}>{line.replace('### ', '')}</h3>;
                }
                // Handle horizontal rules
                if (line === '---') {
                  return <hr key={index} />;
                }
                // Handle empty lines
                if (line.trim() === '') {
                  return null;
                }
                // Handle bold text and regular paragraphs
                const processedLine = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                return (
                  <p key={index} dangerouslySetInnerHTML={{ __html: processedLine }} />
                );
              })}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Info;
