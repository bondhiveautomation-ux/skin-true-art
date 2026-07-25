import { ReactNode } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/landing/Footer";
import { useAuth } from "@/hooks/useAuth";
import { useGems } from "@/hooks/useGems";
import { useAdmin } from "@/hooks/useAdmin";
import { Briefcase, LayoutDashboard, Package, Building2, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/business-machine", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/business-machine/brands", label: "Brand Profiles", icon: Building2 },
  { to: "/business-machine/products/new", label: "New Product", icon: Package },
];

export const BMLayout = ({ children, title, subtitle, showBack }: { children: ReactNode; title?: string; subtitle?: string; showBack?: boolean }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut } = useAuth();
  const { gems } = useGems();
  const { isAdmin, loading: adminLoading } = useAdmin();

  return (
    <div className="min-h-screen bg-background">
      <Navbar onNavigate={() => {}} onSignOut={signOut} credits={gems} isAdmin={isAdmin} adminLoading={adminLoading} />

      <section className="pt-24 sm:pt-28 pb-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-charcoal/40 to-background" />
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-gradient-to-tl from-primary/5 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-4">
            {showBack && (
              <button
                onClick={() => navigate(-1)}
                className="inline-flex items-center gap-2 text-cream/60 hover:text-primary transition-colors text-sm"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
            )}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/25">
              <Briefcase className="w-3.5 h-3.5 text-primary" />
              <span className="text-[10px] font-semibold text-primary uppercase tracking-widest">Business Machine</span>
            </div>
          </div>
          {title && (
            <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-semibold text-cream tracking-tight mb-2">{title}</h1>
          )}
          {subtitle && <p className="text-cream/60 max-w-2xl">{subtitle}</p>}
        </div>
      </section>

      <section className="relative pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-[220px_1fr] gap-6">
            <aside className="hidden lg:block">
              <nav className="sticky top-24 flex flex-col gap-1 p-2 rounded-2xl border border-primary/15 bg-charcoal/40 backdrop-blur">
                {NAV.map((item) => {
                  const active = item.exact ? location.pathname === item.to : location.pathname.startsWith(item.to);
                  return (
                    <button
                      key={item.to}
                      onClick={() => navigate(item.to)}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-left transition-colors",
                        active ? "bg-primary/15 text-primary" : "text-cream/70 hover:text-cream hover:bg-primary/5"
                      )}
                    >
                      <item.icon className="w-4 h-4" />
                      {item.label}
                    </button>
                  );
                })}
              </nav>
            </aside>

            <div className="min-w-0">
              <div className="lg:hidden mb-4 flex gap-2 overflow-x-auto">
                {NAV.map((item) => {
                  const active = item.exact ? location.pathname === item.to : location.pathname.startsWith(item.to);
                  return (
                    <button
                      key={item.to}
                      onClick={() => navigate(item.to)}
                      className={cn(
                        "whitespace-nowrap flex items-center gap-2 px-3 py-2 rounded-full text-xs border",
                        active
                          ? "bg-primary/15 text-primary border-primary/40"
                          : "text-cream/70 border-primary/15 bg-charcoal/40"
                      )}
                    >
                      <item.icon className="w-3.5 h-3.5" />
                      {item.label}
                    </button>
                  );
                })}
              </div>

              {children}
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};
