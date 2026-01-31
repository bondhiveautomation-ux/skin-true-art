import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Camera, Palette, Award, ImageIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useRef } from "react";

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

    for (let i = 0; i < 40; i++) createParticle();

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

        const gradient = ctx.createRadialGradient(particle.x, particle.y, 0, particle.x, particle.y, particle.size * 2);
        gradient.addColorStop(0, `hsla(280, 70%, 65%, ${particle.opacity})`);
        gradient.addColorStop(1, `hsla(320, 80%, 60%, 0)`);

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

const outcomeTiles = [
  {
    icon: Camera,
    bangla: "প্রফেশনাল ছবি",
    english: "Studio-quality look"
  },
  {
    icon: Palette,
    bangla: "লুক ট্রান্সফর্ম",
    english: "Makeup, style, aesthetic"
  },
  {
    icon: Award,
    bangla: "ব্র্যান্ডিং রেডি",
    english: "Logo + brand consistency"
  },
  {
    icon: ImageIcon,
    bangla: "কনটেন্ট-রেডি",
    english: "Post-ready visuals"
  }
];

export const LandingHero = () => {
  const navigate = useNavigate();

  const scrollToExamples = () => {
    document.getElementById("examples")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative min-h-[100svh] flex flex-col items-center justify-center overflow-hidden pt-24 pb-12 px-4 sm:px-6">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-charcoal-deep via-charcoal to-background" />
        <div className="absolute top-0 left-1/4 w-[400px] sm:w-[800px] h-[400px] sm:h-[800px] bg-gradient-to-br from-gold/8 via-transparent to-transparent rounded-full blur-3xl" />
        <div className="hidden sm:block absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-gradient-to-tl from-rose-gold/5 via-transparent to-transparent rounded-full blur-3xl" />
        <SparkleParticles />
        <div className="absolute inset-0 noise-texture" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto text-center flex-1 flex flex-col justify-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full bg-gold/10 border border-gold/25 mb-6 sm:mb-8 section-animate backdrop-blur-sm mx-auto">
          <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gold animate-pulse-glow" />
          <span className="text-[10px] sm:text-xs font-medium text-cream tracking-widest uppercase">
            ব্যবসার জন্য প্রিমিয়াম কনটেন্ট টুল
          </span>
        </div>
        <p className="text-[10px] sm:text-xs text-cream/50 uppercase tracking-wider mb-6 section-animate delay-1">
          Premium content tools for business
        </p>

        {/* Main Headline - Bangla Primary */}
        <h1 className="font-bangla text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold text-cream leading-[1.3] sm:leading-[1.2] tracking-tight mb-3 sm:mb-4 section-animate delay-1 px-2">
          আপনার বিজনেসের ছবি, লুক, ব্র্যান্ডিং কনটেন্ট — <br className="hidden sm:block" />
          <span className="gradient-text">এখন প্রফেশনালভাবে তৈরি করুন</span>
        </h1>
        
        {/* Supporting Paragraph - Bangla */}
        <div className="max-w-2xl mx-auto mb-4 section-animate delay-2 px-4">
          <p className="font-bangla text-sm sm:text-base text-cream/60 leading-relaxed">
            BH Studio হলো একটাই প্ল্যাটফর্ম— যেখানে আপনি আপনার প্রোডাক্ট/সার্ভিসের জন্য প্রফেশনাল কনটেন্ট বানাতে পারবেন।
            <br />
            সেল বাড়ানোর মতো ছবি, ব্র্যান্ড লুক, ক্যাপশন-রেডি কনটেন্ট— সব এক জায়গায়।
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 section-animate delay-3 px-4 w-full max-w-md sm:max-w-none mx-auto mb-4">
          <Button 
            onClick={() => navigate("/auth")}
            variant="gold"
            size="lg"
            className="w-full sm:w-auto sm:min-w-[200px] btn-glow h-12 sm:h-14 text-base"
          >
            Sign Up Free
            <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
          <Button 
            onClick={scrollToExamples}
            variant="luxury"
            size="lg"
            className="w-full sm:w-auto sm:min-w-[180px] h-12 sm:h-14"
          >
            See Examples
          </Button>
        </div>

        {/* Micro-trust line */}
        <p className="font-bangla text-[11px] sm:text-xs text-cream/50 section-animate delay-3 mb-8">
          শিখতে হবে না • মোবাইল থেকেই হবে • ১ মিনিটে ফলাফল
        </p>

        {/* Outcome Tiles */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-3xl mx-auto section-animate delay-4 px-2">
          {outcomeTiles.map((tile, index) => (
            <div
              key={tile.bangla}
              className="p-3 sm:p-4 rounded-xl bg-card/30 border border-gold/10 backdrop-blur-sm hover:border-gold/25 transition-all duration-300 group"
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg gold-icon flex items-center justify-center mx-auto mb-2 sm:mb-3 group-hover:shadow-gold transition-all duration-300">
                <tile.icon className="w-5 h-5 sm:w-6 sm:h-6 text-gold" />
              </div>
              <p className="font-bangla text-xs sm:text-sm font-medium text-cream mb-0.5">
                {tile.bangla}
              </p>
              <p className="text-[10px] sm:text-xs text-cream/40 font-light">
                {tile.english}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-24 sm:h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};
