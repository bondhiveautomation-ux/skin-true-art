import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { useEffect, useRef } from "react";
import { useContent } from "@/hooks/useSiteContent";

interface HeroProps {
  onExplore: () => void;
}

// Sparkle particle component
const SparkleParticles = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const particles: { x: number; y: number; size: number; speedX: number; speedY: number; opacity: number; fadeSpeed: number }[] = [];
    
    const createParticle = () => {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2 + 1,
        speedX: (Math.random() - 0.5) * 0.3,
        speedY: (Math.random() - 0.5) * 0.3,
        opacity: Math.random(),
        fadeSpeed: Math.random() * 0.01 + 0.005
      });
    };

    // Initial particles
    for (let i = 0; i < 50; i++) createParticle();

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((particle, index) => {
        particle.x += particle.speedX;
        particle.y += particle.speedY;
        particle.opacity += particle.fadeSpeed;

        if (particle.opacity > 1 || particle.opacity < 0) {
          particle.fadeSpeed *= -1;
        }

        if (particle.x < 0 || particle.x > canvas.width || particle.y < 0 || particle.y > canvas.height) {
          particles.splice(index, 1);
          createParticle();
        }

        // Gold sparkle
        const gradient = ctx.createRadialGradient(particle.x, particle.y, 0, particle.x, particle.y, particle.size * 2);
        gradient.addColorStop(0, `hsla(43, 74%, 55%, ${particle.opacity})`);
        gradient.addColorStop(1, `hsla(43, 74%, 49%, 0)`);

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
      });

      requestAnimationFrame(animate);
    };

    animate();

    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />;
};

export const Hero = ({ onExplore }: HeroProps) => {
  const { content } = useContent("hero");
  
  // Default values in case content hasn't loaded yet
  const badgeText = content.badge_text || "AI Fashion & Beauty Studio";
  const headline1 = content.headline_1 || "Where Fashion";
  const headline2 = content.headline_2 || "Meets AI";
  const subheadline = content.subheadline || "The ultimate creative studio for makeup artists, influencers, and fashion brands. Transform your vision with precision AI technology.";
  const ctaPrimary = content.cta_primary || "Enter Studio";
  const ctaSecondary = content.cta_secondary || "Explore Features";
  const trustText = content.trust_text || "Trusted by creators & brands worldwide";

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Dark cinematic background */}
      <div className="absolute inset-0">
        {/* Deep dark gradient base */}
        <div className="absolute inset-0 bg-gradient-to-b from-charcoal-deep via-charcoal to-background" />
        
        {/* Subtle gold accent gradients */}
        <div className="absolute top-0 left-1/4 w-[800px] h-[800px] bg-gradient-to-br from-gold/8 via-transparent to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-gradient-to-tl from-rose-gold/5 via-transparent to-transparent rounded-full blur-3xl" />
        <div className="absolute top-1/3 right-0 w-[400px] h-[600px] bg-gradient-to-l from-gold/5 to-transparent blur-3xl" />
        
        {/* Sparkle particles */}
        <SparkleParticles />
        
        {/* Noise texture overlay */}
        <div className="absolute inset-0 noise-texture" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        {/* Fashion badge */}
        <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gold/10 border border-gold/25 mb-10 section-animate backdrop-blur-sm">
          <Sparkles className="w-4 h-4 text-gold animate-pulse-glow" />
          <span className="text-sm font-medium text-cream tracking-widest uppercase">{badgeText}</span>
        </div>

        {/* Main headline - Editorial Serif */}
        <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-semibold text-cream leading-[1.05] tracking-tight mb-8 section-animate delay-1">
          {headline1}
          <br />
          <span className="gradient-text">{headline2}</span>
        </h1>

        {/* Sub-headline */}
        <p className="text-lg sm:text-xl text-cream/60 max-w-2xl mx-auto mb-14 leading-relaxed section-animate delay-2 font-light">
          {subheadline}
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-5 section-animate delay-3">
          <Button 
            onClick={onExplore}
            variant="gold"
            size="xl"
            className="min-w-[220px] btn-glow"
          >
            {ctaPrimary}
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <Button 
            onClick={onExplore}
            variant="luxury"
            size="xl"
            className="min-w-[220px]"
          >
            {ctaSecondary}
          </Button>
        </div>

        {/* Trust indicator */}
        <div className="mt-24 section-animate delay-4">
          <div className="luxury-divider max-w-xs mx-auto mb-6" />
          <p className="text-sm text-cream/40 tracking-widest uppercase font-light">
            {trustText}
          </p>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};
