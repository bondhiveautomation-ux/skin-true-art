import { Sparkles } from "lucide-react";

interface NavbarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const navItems = [
  { id: "hero", label: "Home" },
  { id: "skin-enhancement", label: "Skin Enhancement" },
  { id: "character-generator", label: "Character Generator" },
  { id: "prompt-extractor", label: "Prompt Extractor" },
  { id: "dress-extractor", label: "Dress Extractor" },
  { id: "background-saver", label: "Background Saver" },
  { id: "pose-transfer", label: "Pose Transfer" },
  { id: "makeup-studio", label: "Makeup Studio" },
  { id: "full-look-transfer", label: "Full Look Transfer" },
];

export const Navbar = ({ activeSection, onSectionChange }: NavbarProps) => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary-foreground" />
              </div>
              <div className="absolute -inset-1 rounded-xl bg-primary/20 blur-lg -z-10" />
            </div>
            <span className="font-display text-xl font-semibold text-foreground">
              Influencer Tool
            </span>
          </div>

          {/* Navigation - Hidden on mobile, scrollable on tablet */}
          <div className="hidden lg:flex items-center gap-1">
            {navItems.slice(0, 6).map((item) => (
              <button
                key={item.id}
                onClick={() => onSectionChange(item.id)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                  activeSection === item.id
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* CTA Button */}
          <button className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-all duration-300 glow-button">
            <Sparkles className="w-4 h-4" />
            Get Started
          </button>
        </div>
      </div>
    </nav>
  );
};
