import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  FileText,
  Loader2,
  MapPin,
  Package,
  Shirt,
  Utensils,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import type { Location, Trip } from "../backend.d";
import { useNavigation } from "../context/NavigationContext";
import { useAllTrips, usePostParcel } from "../hooks/useQueries";

const PARCEL_TYPES = [
  { id: "Documents", label: "Docs", icon: <FileText size={16} /> },
  { id: "Clothes", label: "Clothes", icon: <Shirt size={16} /> },
  { id: "Food", label: "Food", icon: <Utensils size={16} /> },
  { id: "Electronics", label: "Electronics", icon: <Zap size={16} /> },
];

function TripCard({ trip }: { trip: Trip }) {
  const whatsappUrl = `https://wa.me/${String(trip.traveler)}`;
  const travelDateMs = Number(trip.travelDate / 1_000_000n);
  const dateStr = new Date(travelDateMs).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  return (
    <div className="bg-carry-panel rounded-2xl p-4 border border-border">
      <div className="flex items-center gap-2 mb-2">
        <MapPin size={14} className="text-carry-blue" />
        <span className="text-sm font-semibold">
          {trip.fromLocation.city} → {trip.toLocation.city}
        </span>
      </div>
      <p className="text-xs text-muted-foreground mb-1">
        {trip.capacityDescription}
      </p>
      <p className="text-xs text-muted-foreground mb-3">📅 {dateStr}</p>
      <div className="flex items-center gap-2">
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          data-ocid="available_travelers.whatsapp.button"
          className="flex-1 flex items-center justify-center gap-1.5 bg-green-500 text-white text-xs font-semibold px-3 py-2 rounded-full"
        >
          Contact via WhatsApp
        </a>
      </div>
    </div>
  );
}

export function SendParcelPage() {
  const { goBack } = useNavigation();
  const postParcel = usePostParcel();
  const { data: allTrips = [] } = useAllTrips();

  const [pickupCity, setPickupCity] = useState("");
  const [pickupCountry, setPickupCountry] = useState("");
  const [dropCity, setDropCity] = useState("");
  const [dropCountry, setDropCountry] = useState("");
  const [parcelType, setParcelType] = useState("Documents");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submittedDropCity, setSubmittedDropCity] = useState("");

  const matchedTrips = useMemo(() => {
    if (!submittedDropCity) return [];
    return allTrips.filter(
      (trip) =>
        trip.active === true &&
        trip.toLocation.city.toLowerCase() ===
          submittedDropCity.trim().toLowerCase(),
    );
  }, [allTrips, submittedDropCity]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pickupCity || !pickupCountry || !dropCity || !dropCountry || !price) {
      toast.error("Please fill in all required fields");
      return;
    }
    const pickup: Location = {
      city: pickupCity.trim(),
      country: pickupCountry.trim(),
      address: "",
    };
    const drop: Location = {
      city: dropCity.trim(),
      country: dropCountry.trim(),
      address: "",
    };
    try {
      await postParcel.mutateAsync({
        pickupLocation: pickup,
        dropLocation: drop,
        parcelType,
        priceOffered: BigInt(Math.round(Number(price))),
        description: description.trim(),
      });
      toast.success("Parcel posted successfully!");
      setSubmittedDropCity(dropCity);
      setSubmitted(true);
    } catch (err) {
      console.error(err);
      toast.error("Failed to post parcel");
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background pb-10">
        <header className="bg-charcoal px-5 pt-12 pb-5">
          <div className="flex items-center gap-3">
            <button
              type="button"
              data-ocid="available_travelers.back.button"
              onClick={() => setSubmitted(false)}
              className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white"
            >
              <ArrowLeft size={18} />
            </button>
            <h1 className="text-lg font-extrabold text-white">
              Available Travelers
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
                ✅ Parcel Posted! We found {matchedTrips.length} traveler(s)
                heading to {submittedDropCity}.
              </p>
            </div>

            {matchedTrips.length > 0 ? (
              <div className="space-y-3">
                <h2 className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground">
                  Travelers to {submittedDropCity}
                </h2>
                {matchedTrips.map((trip, i) => (
                  // biome-ignore lint/suspicious/noArrayIndexKey: stable order
                  <TripCard key={i} trip={trip} />
                ))}
              </div>
            ) : (
              <div
                data-ocid="available_travelers.empty_state"
                className="bg-carry-panel rounded-2xl p-6 text-center"
              >
                <p className="text-sm font-semibold text-muted-foreground">
                  No travelers heading to {submittedDropCity} right now.
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  We'll notify you when one becomes available!
                </p>
              </div>
            )}

            <Button
              type="button"
              data-ocid="available_travelers.post_another.button"
              onClick={() => {
                setSubmitted(false);
                setSubmittedDropCity("");
              }}
              className="w-full rounded-full bg-carry-blue text-white h-12 font-bold"
            >
              Post Another Parcel
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
            data-ocid="send_parcel.back.button"
            onClick={goBack}
            className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white"
          >
            <ArrowLeft size={18} />
          </button>
          <h1 className="text-lg font-extrabold text-white">Send Parcel</h1>
        </div>
      </header>

      <div className="px-5 pt-5">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-carry-panel rounded-2xl p-4 space-y-4">
            <h2 className="font-extrabold text-xs uppercase tracking-wider text-muted-foreground">
              Pickup Location
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">City</Label>
                <Input
                  data-ocid="send_parcel.pickup_city.input"
                  placeholder="Mumbai"
                  value={pickupCity}
                  onChange={(e) => setPickupCity(e.target.value)}
                  className="rounded-xl h-11"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Country</Label>
                <Input
                  data-ocid="send_parcel.pickup_country.input"
                  placeholder="India"
                  value={pickupCountry}
                  onChange={(e) => setPickupCountry(e.target.value)}
                  className="rounded-xl h-11"
                />
              </div>
            </div>
          </div>

          <div className="bg-carry-panel rounded-2xl p-4 space-y-4">
            <h2 className="font-extrabold text-xs uppercase tracking-wider text-muted-foreground">
              Drop Location
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">City</Label>
                <Input
                  data-ocid="send_parcel.drop_city.input"
                  placeholder="Delhi"
                  value={dropCity}
                  onChange={(e) => setDropCity(e.target.value)}
                  className="rounded-xl h-11"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Country</Label>
                <Input
                  data-ocid="send_parcel.drop_country.input"
                  placeholder="India"
                  value={dropCountry}
                  onChange={(e) => setDropCountry(e.target.value)}
                  className="rounded-xl h-11"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Parcel Type
            </Label>
            <div className="grid grid-cols-4 gap-2">
              {PARCEL_TYPES.map((type) => (
                <button
                  key={type.id}
                  type="button"
                  data-ocid={`send_parcel.type_${type.id.toLowerCase()}.toggle`}
                  onClick={() => setParcelType(type.id)}
                  className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border-2 text-xs font-semibold transition-all ${
                    parcelType === type.id
                      ? "border-carry-blue bg-carry-panel text-carry-blue"
                      : "border-border bg-white text-muted-foreground"
                  }`}
                >
                  {type.icon}
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="price"
              className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
            >
              Offered Price (₹)
            </Label>
            <Input
              id="price"
              data-ocid="send_parcel.price.input"
              type="number"
              placeholder="500"
              min="0"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="rounded-xl h-12"
            />
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="description"
              className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
            >
              Description
            </Label>
            <Textarea
              id="description"
              data-ocid="send_parcel.description.textarea"
              placeholder="Describe your parcel (size, weight, special instructions)..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="rounded-xl resize-none"
              rows={3}
            />
          </div>

          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
            🚫 No illegal items allowed. CarryGo is not responsible for the
            contents of parcels.
          </div>

          <Button
            type="submit"
            data-ocid="send_parcel.post.button"
            disabled={postParcel.isPending}
            className="w-full rounded-full bg-carry-blue hover:bg-carry-blue/90 text-white font-extrabold text-base py-3.5 h-13"
          >
            {postParcel.isPending ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <>
                <Package size={18} className="mr-2" /> Post Parcel
              </>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
