import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, Loader2, Package } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useNavigation } from "../context/NavigationContext";
import { usePhoneAuth } from "../hooks/usePhoneAuth";
import { useCreateProfile } from "../hooks/useQueries";

function isValidPhone(phone: string): boolean {
  return /^\d{10}$/.test(phone.trim());
}

interface Props {
  needsProfile: boolean;
}

export function AuthPage({ needsProfile }: Props) {
  const { login, phone: sessionPhone } = usePhoneAuth();
  const { navigate } = useNavigation();
  const createProfile = useCreateProfile();

  const [phone, setPhone] = useState(sessionPhone ?? "");
  const [name, setName] = useState("");

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = phone.trim();
    if (!trimmed) {
      toast.error("Please enter your phone number");
      return;
    }
    if (!isValidPhone(trimmed)) {
      toast.warning("Phone number looks unusual — expected 10 digits", {
        duration: 3000,
      });
    }
    login(trimmed);
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      toast.error("Please fill in all fields");
      return;
    }
    try {
      await createProfile.mutateAsync({
        name: name.trim(),
        phone: phone.trim(),
      });
      toast.success("Profile created!");
      navigate("home");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error(
        msg.includes("Phone")
          ? msg
          : "Failed to create profile. Please try again.",
      );
    }
  };

  // ── Profile Setup Screen (new users only) ───────────────────────────────────
  if (needsProfile) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm"
        >
          <div className="flex items-center gap-2 mb-8">
            <div className="w-9 h-9 rounded-xl bg-carry-blue flex items-center justify-center">
              <Package size={18} className="text-white" />
            </div>
            <span className="text-xl font-extrabold text-foreground">
              CarryGo
            </span>
          </div>

          <h1 className="text-2xl font-extrabold text-foreground mb-1">
            Set up your profile
          </h1>
          <p className="text-muted-foreground text-sm mb-6">
            Tell us your name to get started.
          </p>

          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                data-ocid="profile.name.input"
                placeholder="Jane Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="rounded-xl h-12"
                autoFocus
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone-display">Phone Number</Label>
              <Input
                id="phone-display"
                data-ocid="profile.phone.input"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="rounded-xl h-12"
                type="tel"
              />
            </div>

            <div className="p-3 rounded-xl bg-orange-50 border border-orange-200 text-xs text-orange-700">
              ⚠️ No illegal items allowed. By using CarryGo, you agree to our{" "}
              <button
                type="button"
                className="underline font-semibold"
                onClick={() => navigate("terms")}
              >
                Terms &amp; Privacy Policy
              </button>
              .
            </div>

            <Button
              type="submit"
              data-ocid="profile.submit_button"
              disabled={createProfile.isPending}
              className="w-full h-12 rounded-full bg-carry-blue hover:bg-carry-blue/90 text-white font-bold text-sm"
            >
              {createProfile.isPending ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <>
                  Continue <ArrowRight size={16} className="ml-1" />
                </>
              )}
            </Button>
          </form>
        </motion.div>
      </div>
    );
  }

  // ── Phone Input Screen ─────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-charcoal flex flex-col overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-carry-blue/20 blur-3xl" />
        <div className="absolute top-1/2 -left-32 w-64 h-64 rounded-full bg-carry-blue/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 w-48 h-48 rounded-full bg-carry-blue/15 blur-2xl" />
      </div>

      <div className="relative flex-1 flex flex-col items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-xs"
        >
          {/* Logo */}
          <div className="flex items-center justify-center gap-3 mb-10">
            <div className="w-12 h-12 rounded-2xl bg-carry-blue flex items-center justify-center shadow-lg shadow-carry-blue/40">
              <Package size={24} className="text-white" />
            </div>
            <span className="text-3xl font-extrabold text-white tracking-tight">
              CarryGo
            </span>
          </div>

          <h1 className="text-2xl font-extrabold text-white mb-1 text-center">
            Get Started
          </h1>
          <p className="text-gray-400 text-sm mb-8 text-center">
            Enter your phone number to continue.
          </p>

          <form onSubmit={handlePhoneSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="phone-input" className="text-gray-300">
                Phone Number
              </Label>
              <Input
                id="phone-input"
                data-ocid="auth.phone.input"
                placeholder="+91 9876543210"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="rounded-xl h-12 bg-white/5 border-white/10 text-white placeholder:text-gray-600"
                autoFocus
              />
              {phone.trim().length > 0 && !isValidPhone(phone.trim()) && (
                <p className="text-xs text-yellow-400/80">
                  Expected 10 digits — you can still continue.
                </p>
              )}
            </div>
            <Button
              type="submit"
              data-ocid="auth.phone.submit_button"
              className="w-full h-12 rounded-full bg-carry-blue hover:bg-carry-blue/90 text-white font-bold text-sm shadow-lg shadow-carry-blue/30"
            >
              Continue <ArrowRight size={16} className="ml-1" />
            </Button>
          </form>

          {/* Trust badges */}
          <div className="flex items-center justify-center gap-5 mt-10">
            <div className="flex flex-col items-center gap-1">
              <span className="text-white font-extrabold text-base">500+</span>
              <span className="text-gray-600 text-xs">Deliveries</span>
            </div>
            <div className="w-px h-7 bg-gray-700" />
            <div className="flex flex-col items-center gap-1">
              <span className="text-white font-extrabold text-base">50+</span>
              <span className="text-gray-600 text-xs">Cities</span>
            </div>
            <div className="w-px h-7 bg-gray-700" />
            <div className="flex flex-col items-center gap-1">
              <span className="text-white font-extrabold text-base">4.8★</span>
              <span className="text-gray-600 text-xs">Rating</span>
            </div>
          </div>
        </motion.div>
      </div>

      <footer className="relative text-center pb-8 text-xs text-gray-700">
        © {new Date().getFullYear()}. Built with ♥ using{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-500 underline"
        >
          caffeine.ai
        </a>
      </footer>
    </div>
  );
}
