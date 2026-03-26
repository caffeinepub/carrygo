import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, Loader2, Package } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useNavigation } from "../context/NavigationContext";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useCreateProfile } from "../hooks/useQueries";

interface Props {
  needsProfile: boolean;
}

export function AuthPage({ needsProfile }: Props) {
  const { login, isLoggingIn } = useInternetIdentity();
  const { navigate } = useNavigation();
  const createProfile = useCreateProfile();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

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
      if (msg.includes("Phone number already in use")) {
        toast.error(
          "This phone number is already registered. Please use a different number.",
        );
      } else {
        toast.error("Failed to create profile. Please try again.");
      }
    }
  };

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
            Tell us a bit about yourself to get started.
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
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                data-ocid="profile.phone.input"
                placeholder="+91 9876543210"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="rounded-xl h-12"
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

  return (
    <div className="min-h-screen bg-charcoal flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-xs w-full"
        >
          <div className="flex items-center justify-center gap-3 mb-10">
            <div className="w-12 h-12 rounded-2xl bg-carry-blue flex items-center justify-center">
              <Package size={24} className="text-white" />
            </div>
            <span className="text-3xl font-extrabold text-white tracking-tight">
              CarryGo
            </span>
          </div>

          <h1 className="text-3xl font-extrabold text-white uppercase tracking-wide leading-tight mb-3">
            Ship Smarter.
            <br />
            Earn on the Go.
          </h1>
          <p className="text-gray-400 text-sm mb-10">
            Connect senders with travelers. Deliver parcels between cities and
            earn money on your journey.
          </p>

          <Button
            data-ocid="auth.login.button"
            onClick={() => login()}
            disabled={isLoggingIn}
            className="w-full h-13 rounded-full bg-carry-blue hover:bg-carry-blue/90 text-white font-bold text-base py-3.5"
          >
            {isLoggingIn ? (
              <>
                <Loader2 size={18} className="animate-spin mr-2" />{" "}
                Connecting...
              </>
            ) : (
              <>
                Get Started <ArrowRight size={18} className="ml-2" />
              </>
            )}
          </Button>

          <p className="mt-6 text-xs text-gray-500">
            No illegal items allowed. By continuing, you agree to our{" "}
            <span className="text-gray-400 underline cursor-pointer">
              Terms &amp; Privacy Policy
            </span>
            .
          </p>
        </motion.div>
      </div>

      <footer className="text-center pb-8 text-xs text-gray-600">
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
