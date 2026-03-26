import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileText, Loader2, LogOut, Settings, Shield } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { StarRating } from "../components/StarRating";
import { useNavigation } from "../context/NavigationContext";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useCreateProfile,
  useIsAdmin,
  useOwnProfile,
} from "../hooks/useQueries";

export function ProfilePage() {
  const { navigate } = useNavigation();
  const { data: profile, isLoading } = useOwnProfile();
  const { data: isAdmin } = useIsAdmin();
  const { clear } = useInternetIdentity();
  const updateProfile = useCreateProfile();

  const [editOpen, setEditOpen] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const openEdit = () => {
    setName(profile?.name ?? "");
    setPhone(profile?.phone ?? "");
    setEditOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile.mutateAsync({
        name: name.trim(),
        phone: phone.trim(),
      });
      toast.success("Profile updated!");
      setEditOpen(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("Phone number already in use")) {
        toast.error(
          "This phone number is already registered to another account.",
        );
      } else {
        toast.error("Failed to update profile. Please try again.");
      }
    }
  };

  const initials = (profile?.name ?? "U")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="bg-charcoal px-5 pt-12 pb-8">
        <h1 className="text-xl font-extrabold text-white mb-5">Profile</h1>
        {!isLoading && profile && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4"
          >
            <div className="w-16 h-16 rounded-full bg-carry-blue flex items-center justify-center shrink-0">
              <span className="text-2xl font-extrabold text-white">
                {initials}
              </span>
            </div>
            <div>
              <p className="text-lg font-extrabold text-white">
                {profile.name}
              </p>
              <p className="text-gray-400 text-sm">{profile.phone}</p>
              <StarRating rating={profile.rating} />
            </div>
          </motion.div>
        )}
      </header>

      <div className="px-5 pt-5 space-y-3">
        {profile && (
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-2xl p-4 shadow-card border border-border text-center">
              <p className="text-3xl font-extrabold text-foreground">
                {profile.completedDeliveries.toString()}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Deliveries</p>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-card border border-border text-center">
              <p className="text-3xl font-extrabold text-foreground">
                {profile.rating.toFixed(1)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Rating</p>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-card border border-border overflow-hidden">
          <button
            type="button"
            data-ocid="profile.edit.button"
            onClick={openEdit}
            className="w-full flex items-center gap-3 px-4 py-4 text-sm font-semibold text-foreground hover:bg-muted/50 transition-colors border-b border-border"
          >
            <Settings size={18} className="text-carry-blue" />
            Edit Profile
          </button>

          {isAdmin && (
            <button
              type="button"
              data-ocid="profile.admin.button"
              onClick={() => navigate("admin")}
              className="w-full flex items-center gap-3 px-4 py-4 text-sm font-semibold text-foreground hover:bg-muted/50 transition-colors border-b border-border"
            >
              <Shield size={18} className="text-carry-blue" />
              Admin Panel
            </button>
          )}

          <button
            type="button"
            data-ocid="profile.terms.button"
            onClick={() => navigate("terms")}
            className="w-full flex items-center gap-3 px-4 py-4 text-sm font-semibold text-foreground hover:bg-muted/50 transition-colors border-b border-border"
          >
            <FileText size={18} className="text-muted-foreground" />
            Terms &amp; Privacy Policy
          </button>

          <button
            type="button"
            data-ocid="profile.logout.button"
            onClick={() => clear()}
            className="w-full flex items-center gap-3 px-4 py-4 text-sm font-semibold text-red-500 hover:bg-red-50 transition-colors"
          >
            <LogOut size={18} />
            Log Out
          </button>
        </div>

        <p className="text-xs text-muted-foreground text-center px-4">
          🚫 No illegal items allowed. CarryGo is not responsible for goods
          transported.
        </p>

        <p className="text-xs text-muted-foreground text-center pb-2">
          © {new Date().getFullYear()}. Built with ♥ using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            caffeine.ai
          </a>
        </p>
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent
          data-ocid="profile.edit.dialog"
          className="rounded-2xl max-w-sm mx-4"
        >
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="edit-name">Full Name</Label>
              <Input
                id="edit-name"
                data-ocid="profile.edit.name.input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-phone">Phone</Label>
              <Input
                id="edit-phone"
                data-ocid="profile.edit.phone.input"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="rounded-xl"
              />
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                data-ocid="profile.edit.cancel.button"
                onClick={() => setEditOpen(false)}
                className="flex-1 rounded-full"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                data-ocid="profile.edit.save.button"
                disabled={updateProfile.isPending}
                className="flex-1 rounded-full bg-carry-blue text-white font-bold"
              >
                {updateProfile.isPending ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  "Save"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
