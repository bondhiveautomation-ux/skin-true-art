import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  Loader2, 
  Eye, 
  EyeOff, 
  Sparkles, 
  Camera, 
  Type, 
  Shield, 
  Palette,
  Mail,
  ArrowRight
} from "lucide-react";

const FEATURES = [
  { icon: Camera, title: "Photography Studio", description: "DSLR-quality upgrades" },
  { icon: Type, title: "Caption Studio", description: "Bangla/English captions" },
  { icon: Shield, title: "Branding Studio", description: "Logo batch processing" },
  { icon: Palette, title: "Makeup & Pose Tools", description: "Full look transfer" },
];

const Auth = () => {
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [forgotPassword, setForgotPassword] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Validation states
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session?.user) {
          navigate("/");
        }
        setCheckingAuth(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        navigate("/");
      }
      setCheckingAuth(false);
    });

    return () => subscription.unsubscribe();
  }, [navigate, toast]);

  const validateSignup = () => {
    const newErrors: Record<string, string> = {};
    
    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email";
    }
    
    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }
    
    if (activeTab === "signup") {
      if (!confirmPassword) {
        newErrors.confirmPassword = "Please confirm your password";
      } else if (password !== confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    if (!email.trim() || !password.trim()) {
      toast({
        title: "Missing credentials",
        description: "Please enter both email and password.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        let errorMessage = error.message;
        if (error.message.includes("Invalid login credentials")) {
          errorMessage = "Invalid email or password. Please try again.";
        }
        toast({
          title: "Login failed",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateSignup()) return;

    setLoading(true);

    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: fullName.trim() || undefined,
          }
        }
      });

      if (error) {
        let errorMessage = error.message;
        if (error.message.includes("already registered")) {
          errorMessage = "This email is already registered. Please log in instead.";
        }
        toast({
          title: "Signup failed",
          description: errorMessage,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Account created! 🎉",
          description: "You're now signed in with 10 free credits.",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setErrors({ email: "Please enter your email address" });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/auth`,
      });

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      } else {
        setResetSent(true);
        toast({
          title: "Reset link sent",
          description: "Check your email for the password reset link.",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send reset email. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gold" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-charcoal-deep flex flex-col lg:flex-row relative overflow-hidden">
      {/* Animated background - reduced effects on mobile */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[300px] sm:w-[600px] h-[300px] sm:h-[600px] bg-gold/5 rounded-full blur-3xl animate-pulse" />
        <div className="hidden sm:block absolute bottom-1/3 right-1/4 w-[500px] h-[500px] bg-rose-gold/4 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="hidden sm:block absolute top-1/2 left-1/2 w-[400px] h-[400px] bg-gold/3 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "2s" }} />
        {/* Sparkle particles - fewer on mobile */}
        <div className="absolute inset-0">
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-gold/30 rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
              }}
            />
          ))}
        </div>
        <div className="absolute inset-0 noise-texture" />
      </div>

      {/* Left Side - Brand & Value (Desktop only) */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-center px-12 xl:px-20 relative z-10">
        <div className="max-w-lg">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-12">
            <div className="w-12 h-12 rounded-xl gold-icon flex items-center justify-center animate-pulse-glow">
              <Sparkles className="w-6 h-6 text-gold" />
            </div>
            <span className="font-serif text-2xl font-semibold text-cream">Influencer Tool</span>
          </div>

          {/* Headline */}
          <h1 className="font-serif text-4xl xl:text-5xl font-bold text-cream leading-tight mb-6">
            Your All-in-One{" "}
            <span className="gradient-text">Content Studio</span>
          </h1>

          {/* Subtext */}
          <p className="text-lg text-cream/60 leading-relaxed mb-10">
            Photo upgrade, captions, branding, and creator tools — built for Bangladeshi sellers, influencers, and makeup artists.
          </p>

          {/* Feature Bullets */}
          <div className="space-y-4">
            {FEATURES.map((feature, index) => (
              <div 
                key={index}
                className="flex items-center gap-4 p-4 rounded-xl bg-card/30 border border-gold/10 backdrop-blur-sm hover:border-gold/30 transition-all duration-300"
              >
                <div className="w-10 h-10 rounded-lg gold-icon flex items-center justify-center flex-shrink-0">
                  <feature.icon className="w-5 h-5 text-gold" />
                </div>
                <div>
                  <h3 className="font-medium text-cream">{feature.title}</h3>
                  <p className="text-sm text-cream/50">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Side - Auth Card */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-4 sm:px-6 py-8 sm:py-12 relative z-10 min-h-screen lg:min-h-0">
        <div className="w-full max-w-md">
          {/* Mobile Logo & Headline */}
          <div className="lg:hidden text-center mb-6 sm:mb-8">
            <div className="flex items-center justify-center gap-2 sm:gap-3 mb-4">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl gold-icon flex items-center justify-center animate-pulse-glow">
                <Sparkles className="w-5 h-5 text-gold" />
              </div>
            </div>
            <h1 className="font-serif text-xl sm:text-2xl font-semibold text-cream">
              Your All-in-One Content Studio
            </h1>
            <p className="text-cream/50 text-xs sm:text-sm mt-2">
              Built for creators and sellers
            </p>
          </div>

          {/* Auth Card */}
          <div className="glass-card p-5 sm:p-8 border border-gold/15 rounded-2xl sm:rounded-3xl backdrop-blur-md">
            {forgotPassword ? (
              /* Forgot Password Form */
              <div className="space-y-6">
                <div className="text-center">
                  <div className="w-14 h-14 rounded-xl gold-icon mx-auto mb-4 flex items-center justify-center">
                    <Mail className="w-6 h-6 text-gold" />
                  </div>
                  <h2 className="font-serif text-2xl font-semibold text-cream">
                    {resetSent ? "Check Your Email" : "Reset Password"}
                  </h2>
                  <p className="text-sm text-cream/50 mt-2">
                    {resetSent 
                      ? "We've sent a password reset link to your email."
                      : "Enter your email to receive a reset link"}
                  </p>
                </div>

                {!resetSent && (
                  <form onSubmit={handleForgotPassword} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="reset-email" className="text-sm text-cream/70">Email</Label>
                      <Input
                        id="reset-email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => { setEmail(e.target.value); setErrors({}); }}
                        className="bg-charcoal border-gold/20 focus:border-gold/50 h-12 text-cream"
                        disabled={loading}
                      />
                      {errors.email && <p className="text-red-400 text-xs">{errors.email}</p>}
                    </div>

                    <Button type="submit" variant="gold" size="lg" className="w-full btn-glow" disabled={loading}>
                      {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                      Send Reset Link
                    </Button>
                  </form>
                )}

                <button 
                  onClick={() => { setForgotPassword(false); setResetSent(false); }}
                  className="w-full text-center text-sm text-gold hover:text-gold/80 transition-colors"
                >
                  ← Back to Login
                </button>
              </div>
            ) : (
              /* Login/Signup Tabs */
              <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v as "login" | "signup"); setErrors({}); }}>
                <TabsList className="grid w-full grid-cols-2 mb-8 bg-charcoal/50">
                  <TabsTrigger value="login" className="data-[state=active]:bg-gold/20 data-[state=active]:text-gold">
                    Log In
                  </TabsTrigger>
                  <TabsTrigger value="signup" className="data-[state=active]:bg-gold/20 data-[state=active]:text-gold">
                    Sign Up
                  </TabsTrigger>
                </TabsList>

                {/* Login Tab */}
                <TabsContent value="login">
                  <form onSubmit={handleLogin} className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="login-email" className="text-sm text-cream/70">Email</Label>
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="bg-charcoal border-gold/20 focus:border-gold/50 h-12 text-cream placeholder:text-cream/30"
                        disabled={loading}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="login-password" className="text-sm text-cream/70">Password</Label>
                      <div className="relative">
                        <Input
                          id="login-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="bg-charcoal border-gold/20 focus:border-gold/50 h-12 text-cream placeholder:text-cream/30 pr-10"
                          disabled={loading}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-cream/40 hover:text-cream/60"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setForgotPassword(true)}
                      className="text-sm text-gold/70 hover:text-gold transition-colors"
                    >
                      Forgot password?
                    </button>

                    <Button type="submit" variant="gold" size="lg" className="w-full btn-glow" disabled={loading}>
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Signing in...
                        </>
                      ) : (
                        <>
                          Log In
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </Button>
                  </form>

                  <p className="text-center text-sm text-cream/40 mt-6">
                    Don't have an account?{" "}
                    <button onClick={() => setActiveTab("signup")} className="text-gold hover:underline">
                      Sign up
                    </button>
                  </p>
                </TabsContent>

                {/* Signup Tab */}
                <TabsContent value="signup">
                  <form onSubmit={handleSignup} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-name" className="text-sm text-cream/70">Full Name <span className="text-cream/30">(optional)</span></Label>
                      <Input
                        id="signup-name"
                        type="text"
                        placeholder="John Doe"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="bg-charcoal border-gold/20 focus:border-gold/50 h-12 text-cream placeholder:text-cream/30"
                        disabled={loading}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-email" className="text-sm text-cream/70">Email <span className="text-red-400">*</span></Label>
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => { setEmail(e.target.value); setErrors(prev => ({ ...prev, email: "" })); }}
                        className={`bg-charcoal border-gold/20 focus:border-gold/50 h-12 text-cream placeholder:text-cream/30 ${errors.email ? "border-red-400" : ""}`}
                        disabled={loading}
                      />
                      {errors.email && <p className="text-red-400 text-xs">{errors.email}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-password" className="text-sm text-cream/70">Password <span className="text-red-400">*</span></Label>
                      <div className="relative">
                        <Input
                          id="signup-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Min 8 characters"
                          value={password}
                          onChange={(e) => { setPassword(e.target.value); setErrors(prev => ({ ...prev, password: "" })); }}
                          className={`bg-charcoal border-gold/20 focus:border-gold/50 h-12 text-cream placeholder:text-cream/30 pr-10 ${errors.password ? "border-red-400" : ""}`}
                          disabled={loading}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-cream/40 hover:text-cream/60"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {errors.password && <p className="text-red-400 text-xs">{errors.password}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-confirm" className="text-sm text-cream/70">Confirm Password <span className="text-red-400">*</span></Label>
                      <div className="relative">
                        <Input
                          id="signup-confirm"
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Repeat password"
                          value={confirmPassword}
                          onChange={(e) => { setConfirmPassword(e.target.value); setErrors(prev => ({ ...prev, confirmPassword: "" })); }}
                          className={`bg-charcoal border-gold/20 focus:border-gold/50 h-12 text-cream placeholder:text-cream/30 pr-10 ${errors.confirmPassword ? "border-red-400" : ""}`}
                          disabled={loading}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-cream/40 hover:text-cream/60"
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {errors.confirmPassword && <p className="text-red-400 text-xs">{errors.confirmPassword}</p>}
                    </div>

                    <Button type="submit" variant="gold" size="lg" className="w-full btn-glow mt-2" disabled={loading}>
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Creating account...
                        </>
                      ) : (
                        <>
                          Create Account
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </Button>

                    <p className="text-xs text-cream/30 text-center mt-4">
                      By signing up, you agree to our Terms of Service and Privacy Policy.
                    </p>
                  </form>

                  <p className="text-center text-sm text-cream/40 mt-6">
                    Already have an account?{" "}
                    <button onClick={() => setActiveTab("login")} className="text-gold hover:underline">
                      Log in
                    </button>
                  </p>
                </TabsContent>
              </Tabs>
            )}
          </div>

          {/* Trust badge */}
          <p className="text-center text-xs text-cream/30 mt-6">
            🔒 Your data is encrypted and secure
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
