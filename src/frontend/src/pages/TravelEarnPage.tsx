import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Loader2, MapPin, TrendingUp } from "lucide-react";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import type { Location, Parcel } from "../backend.d";
import { ParcelStatus } from "../backend.d";
import { StatusBadge } from "../components/StatusBadge";
import { useNavigation } from "../context/NavigationContext";
import { useAllParcels, usePostTrip } from "../hooks/useQueries";

function ParcelCard({ parcel }: { parcel: Parcel }) {
  return (
    <div className="bg-carry-panel rounded-2xl p-4 border border-border">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <MapPin size={14} className="text-carry-blue" />
          <span className="text-sm font-semibold">
            {parcel.pickupLocation.city} → {parcel.dropLocation.city}
          </span>
        </div>
        <StatusBadge status={parcel.status} />
      </div>
      <div className="flex items-center gap-3 mb-3">
        <span className="text-xs bg-muted text-muted-foreground rounded-full px-2 py-0.5">
          {parcel.parcelType}
        </span>
        <span className="text-xs font-bold text-carry-blue">
          ₹{parcel.priceOffered.toString()}
        </span>
      </div>
      {parcel.description && (
        <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
          {parcel.description}
        </p>
      )}
      <a
        href={`https://wa.me/${String(parcel.sender)}`}
        target="_blank"
        rel="noopener noreferrer"
        data-ocid="available_parcels.whatsapp.button"
        className="flex items-center justify-center gap-1.5 w-full bg-green-500 text-white text-xs font-semibold px-3 py-2 rounded-full"
      >
        Contact via WhatsApp
      </a>
    </div>
  );
}

export function TravelEarnPage() {
  const { goBack } = useNavigation();
  const postTrip = usePostTrip();
  const { data: allParcels = [] } = useAllParcels();

  const [fromCity, setFromCity] = useState("");
  const [fromCountry, setFromCountry] = useState("");
  const [toCity, setToCity] = useState("");
  const [toCountry, setToCountry] = useState("");
  const [travelDate, setTravelDate] = useState("");
  const [capacity, setCapacity] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submittedToCity, setSubmittedToCity] = useState("");

  const matchedParcels = useMemo(() => {
    if (!submittedToCity) return [];
    return allParcels.filter(
      (parcel) =>
        parcel.status === ParcelStatus.requested &&
        parcel.dropLocation.city.toLowerCase() ===
          submittedToCity.trim().toLowerCase(),
    );
  }, [allParcels, submittedToCity]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !fromCity ||
      !fromCountry ||
      !toCity ||
      !toCountry ||
      !travelDate ||
      !capacity
    ) {
      toast.error("Please fill in all required fields");
      return;
    }
    const from: Location = {
      city: fromCity.trim(),
      country: fromCountry.trim(),
      address: "",
    };
    const to: Location = {
      city: toCity.trim(),
      country: toCountry.trim(),
      address: "",
    };
    const dateMs = new Date(travelDate).getTime();
    const dateNs = BigInt(dateMs) * 1_000_000n;
    try {
      await postTrip.mutateAsync({
        fromLocation: from,
        toLocation: to,
        travelDate: dateNs,
        capacityDescription: capacity.trim(),
      });
      toast.success("Trip posted successfully!");
      setSubmittedToCity(toCity);
      setSubmitted(true);
    } catch (err) {
      console.error(err);
      toast.error("Failed to post trip");
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background pb-10">
        <header className="bg-charcoal px-5 pt-12 pb-5">
          <div className="flex items-center gap-3">
            <button
              type="button"
              data-ocid="available_parcels.back.button"
              onClick={() => setSubmitted(false)}
              className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white"
            >
              <ArrowLeft size={18} />
            </button>
            <h1 className="text-lg font-extrabold text-white">
              Available Parcels
            </h1>
          </div>
        </header>

        <div className="px-5 pt-5">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            <div className="bg-green-50 border border-green-200 rounded-2xl px-4 py-3">
              <p className="text-sm font-bold text-green-700">
                ✅ Trip Posted! We found {matchedParcels.length} parcel(s)
                heading to {submittedToCity}.
              </p>
            </div>

            {matchedParcels.length > 0 ? (
              <div className="space-y-3">
                <h2 className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground">
                  Parcels to {submittedToCity}
                </h2>
                {matchedParcels.map((parcel, i) => (
                  // biome-ignore lint/suspicious/noArrayIndexKey: stable order
                  <ParcelCard key={i} parcel={parcel} />
                ))}
              </div>
            ) : (
              <div
                data-ocid="available_parcels.empty_state"
                className="bg-carry-panel rounded-2xl p-6 text-center"
              >
                <p className="text-sm font-semibold text-muted-foreground">
                  No parcels heading to {submittedToCity} right now.
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Senders will be notified of your trip!
                </p>
              </div>
            )}

            <Button
              type="button"
              data-ocid="available_parcels.post_another.button"
              onClick={() => {
                setSubmitted(false);
                setSubmittedToCity("");
              }}
              className="w-full rounded-full bg-carry-blue text-white h-12 font-bold"
            >
              Post Another Trip
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-10">
      <header className="bg-charcoal px-5 pt-12 pb-5">
        <div className="flex items-center gap-3">
          <button
            type="button"
            data-ocid="travel_earn.back.button"
            onClick={goBack}
            className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white"
          >
            <ArrowLeft size={18} />
          </button>
          <h1 className="text-lg font-extrabold text-white">
            Travel &amp; Earn
          </h1>
        </div>
      </header>

      <div className="px-5 pt-5">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-carry-panel rounded-2xl p-4 space-y-4">
            <h2 className="font-extrabold text-xs uppercase tracking-wider text-muted-foreground">
              From
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">City</Label>
                <Input
                  data-ocid="travel_earn.from_city.input"
                  placeholder="Mumbai"
                  value={fromCity}
                  onChange={(e) => setFromCity(e.target.value)}
                  className="rounded-xl h-11"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Country</Label>
                <Input
                  data-ocid="travel_earn.from_country.input"
                  placeholder="India"
                  value={fromCountry}
                  onChange={(e) => setFromCountry(e.target.value)}
                  className="rounded-xl h-11"
                />
              </div>
            </div>
          </div>

          <div className="bg-carry-panel rounded-2xl p-4 space-y-4">
            <h2 className="font-extrabold text-xs uppercase tracking-wider text-muted-foreground">
              To
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">City</Label>
                <Input
                  data-ocid="travel_earn.to_city.input"
                  placeholder="Delhi"
                  value={toCity}
                  onChange={(e) => setToCity(e.target.value)}
                  className="rounded-xl h-11"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Country</Label>
                <Input
                  data-ocid="travel_earn.to_country.input"
                  placeholder="India"
                  value={toCountry}
                  onChange={(e) => setToCountry(e.target.value)}
                  className="rounded-xl h-11"
                />
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="travelDate"
              className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
            >
              Travel Date &amp; Time
            </Label>
            <Input
              id="travelDate"
              data-ocid="travel_earn.date.input"
              type="datetime-local"
              value={travelDate}
              onChange={(e) => setTravelDate(e.target.value)}
              className="rounded-xl h-12"
            />
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="capacity"
              className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
            >
              Available Capacity
            </Label>
            <Input
              id="capacity"
              data-ocid="travel_earn.capacity.input"
              placeholder="e.g. 5 kg, small bag, 2 parcels"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              className="rounded-xl h-12"
            />
          </div>

          <Button
            type="submit"
            data-ocid="travel_earn.post.button"
            disabled={postTrip.isPending}
            className="w-full rounded-full bg-carry-blue hover:bg-carry-blue/90 text-white font-extrabold text-base py-3.5 h-13"
          >
            {postTrip.isPending ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <>
                <TrendingUp size={18} className="mr-2" /> Post Trip
              </>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
