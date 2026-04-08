import {
  ChevronRight,
  Clock,
  MapPin,
  MessageCircle,
  Package,
  TrendingUp,
} from "lucide-react";
import { motion } from "motion/react";
import { ParcelStatus } from "../backend.d";
import { StatusBadge } from "../components/StatusBadge";
import { useNavigation } from "../context/NavigationContext";
import {
  useAllParcels,
  useAllTrips,
  useMyParcels,
  useMyTrips,
  useOwnProfile,
} from "../hooks/useQueries";

function formatRoute(
  from: { city: string; country: string },
  to: { city: string; country: string },
) {
  return `${from.city} → ${to.city}`;
}

function whatsappUrl(message: string) {
  return `https://wa.me/?text=${encodeURIComponent(message)}`;
}

export function HomePage() {
  const { navigate } = useNavigation();
  const { data: profile } = useOwnProfile();
  const { data: myParcels = [] } = useMyParcels();
  const { data: myTrips = [] } = useMyTrips();
  const { data: allTrips = [] } = useAllTrips();
  const { data: allParcels = [] } = useAllParcels();

  const activeParcels = myParcels.filter(
    (p) => p.status !== ParcelStatus.delivered,
  );
  const activeTrips = myTrips.filter((t) => t.active);

  // Travelers Near You: trips whose fromLocation.city matches any active parcel's pickupLocation.city
  const myPickupCities = new Set(
    activeParcels.map((p) => p.pickupLocation.city.toLowerCase()),
  );
  const travelersNearYou = allTrips
    .filter(
      (t) => t.active && myPickupCities.has(t.fromLocation.city.toLowerCase()),
    )
    .slice(0, 3);

  // Parcels Near You: parcels whose pickupLocation.city matches any active trip's fromLocation.city
  const myTripFromCities = new Set(
    activeTrips.map((t) => t.fromLocation.city.toLowerCase()),
  );
  const parcelsNearYou = allParcels
    .filter(
      (p) =>
        p.status !== ParcelStatus.delivered &&
        myTripFromCities.has(p.pickupLocation.city.toLowerCase()),
    )
    .slice(0, 3);

  const showTravelersNearYou =
    activeParcels.length > 0 && travelersNearYou.length > 0;
  const showParcelsNearYou =
    activeTrips.length > 0 && parcelsNearYou.length > 0;

  return (
    <div className="pb-24 min-h-screen bg-background">
      <header className="bg-charcoal px-5 pt-12 pb-6">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <p className="text-gray-400 text-sm">Welcome back,</p>
            <h1 className="text-xl font-extrabold text-white">
              {profile?.name ?? "Traveler"} 👋
            </h1>
          </div>
          <div className="w-10 h-10 rounded-full bg-carry-blue flex items-center justify-center">
            <span className="text-white font-bold text-sm">
              {(profile?.name ?? "U").charAt(0).toUpperCase()}
            </span>
          </div>
        </motion.div>
      </header>

      <div className="px-5 -mt-4">
        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 gap-3 mb-6"
        >
          <div className="bg-white rounded-2xl p-4 shadow-card border border-border">
            <p className="text-xs text-muted-foreground font-medium">
              Active Parcels
            </p>
            <p className="text-3xl font-extrabold text-foreground mt-1">
              {activeParcels.length}
            </p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-card border border-border">
            <p className="text-xs text-muted-foreground font-medium">
              Active Trips
            </p>
            <p className="text-3xl font-extrabold text-foreground mt-1">
              {activeTrips.length}
            </p>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="space-y-3 mb-6"
        >
          <button
            type="button"
            data-ocid="home.send_parcel.button"
            onClick={() => navigate("send-parcel")}
            className="w-full flex items-center justify-between bg-carry-blue rounded-2xl px-5 py-4 text-white font-bold text-base shadow-card transition-opacity active:opacity-80"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <Package size={20} />
              </div>
              <div className="text-left">
                <p className="font-extrabold">Send Parcel</p>
                <p className="text-xs text-blue-100 font-normal">
                  Post a parcel for delivery
                </p>
              </div>
            </div>
            <ChevronRight size={20} className="text-blue-200" />
          </button>

          <button
            type="button"
            data-ocid="home.travel_earn.button"
            onClick={() => navigate("travel-earn")}
            className="w-full flex items-center justify-between bg-white border-2 border-carry-blue rounded-2xl px-5 py-4 text-foreground font-bold text-base shadow-card transition-opacity active:opacity-80"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-carry-panel flex items-center justify-center">
                <TrendingUp size={20} className="text-carry-blue" />
              </div>
              <div className="text-left">
                <p className="font-extrabold text-carry-blue">
                  Travel &amp; Earn
                </p>
                <p className="text-xs text-muted-foreground font-normal">
                  Carry parcels on your trip
                </p>
              </div>
            </div>
            <ChevronRight size={20} className="text-carry-blue" />
          </button>
        </motion.div>

        {/* Travelers Near You */}
        {showTravelersNearYou && (
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-6"
          >
            <h2 className="font-extrabold text-sm uppercase tracking-wide text-foreground mb-3">
              Travelers Near You
            </h2>
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-5 px-5 scrollbar-none">
              {travelersNearYou.map((trip, idx) => (
                <div
                  key={`traveler-near-${trip.fromLocation.city}-${trip.toLocation.city}-${idx}`}
                  data-ocid={`travelers_near.item.${idx + 1}`}
                  className="bg-white rounded-2xl p-4 shadow-card border border-border min-w-[200px] shrink-0"
                >
                  <div className="flex items-center gap-1.5 mb-2">
                    <MapPin size={13} className="text-carry-blue shrink-0" />
                    <span className="text-sm font-bold text-foreground truncate">
                      {formatRoute(trip.fromLocation, trip.toLocation)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 mb-3">
                    <Clock size={12} className="text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      {new Date(
                        Number(trip.travelDate / 1_000_000n),
                      ).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3 truncate">
                    {trip.capacityDescription}
                  </p>
                  <a
                    href={whatsappUrl(
                      `Hi! I saw you're traveling from ${trip.fromLocation.city} to ${trip.toLocation.city} on CarryGo. Can you carry a parcel for me?`,
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-ocid={`travelers_near.item.${idx + 1}`}
                    className="flex items-center justify-center gap-1.5 w-full py-2 rounded-xl bg-green-500 text-white text-xs font-bold"
                  >
                    <MessageCircle size={13} /> Contact
                  </a>
                </div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Parcels Near You */}
        {showParcelsNearYou && (
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="mb-6"
          >
            <h2 className="font-extrabold text-sm uppercase tracking-wide text-foreground mb-3">
              Parcels Near You
            </h2>
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-5 px-5 scrollbar-none">
              {parcelsNearYou.map((parcel, idx) => (
                <div
                  key={`parcel-near-${parcel.pickupLocation.city}-${parcel.dropLocation.city}-${idx}`}
                  data-ocid={`parcels_near.item.${idx + 1}`}
                  className="bg-white rounded-2xl p-4 shadow-card border border-border min-w-[200px] shrink-0"
                >
                  <div className="flex items-center gap-1.5 mb-2">
                    <MapPin size={13} className="text-carry-blue shrink-0" />
                    <span className="text-sm font-bold text-foreground truncate">
                      {formatRoute(parcel.pickupLocation, parcel.dropLocation)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-1 truncate">
                    {parcel.parcelType}
                  </p>
                  <p className="text-sm font-extrabold text-carry-blue mb-3">
                    ₹{parcel.priceOffered.toString()}
                  </p>
                  <a
                    href={whatsappUrl(
                      `Hi! I saw you have a parcel from ${parcel.pickupLocation.city} to ${parcel.dropLocation.city} on CarryGo. I'm traveling that route and can carry it!`,
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-ocid={`parcels_near.item.${idx + 1}`}
                    className="flex items-center justify-center gap-1.5 w-full py-2 rounded-xl bg-green-500 text-white text-xs font-bold"
                  >
                    <MessageCircle size={13} /> Contact
                  </a>
                </div>
              ))}
            </div>
          </motion.section>
        )}

        {/* My Parcels */}
        {activeParcels.length > 0 && (
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mb-5"
          >
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-extrabold text-sm uppercase tracking-wide text-foreground">
                My Parcels
              </h2>
              <button
                type="button"
                onClick={() => navigate("my-listings")}
                className="text-xs text-carry-blue font-semibold"
              >
                See all
              </button>
            </div>
            <div className="space-y-2">
              {activeParcels.slice(0, 3).map((parcel, idx) => (
                <div
                  key={`${parcel.pickupLocation.city}-${parcel.dropLocation.city}-${parcel.parcelType}-${idx}`}
                  className="bg-white rounded-2xl p-4 shadow-card border border-border"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <MapPin size={14} className="text-carry-blue shrink-0" />
                      <span className="text-sm font-semibold text-foreground truncate">
                        {parcel.pickupLocation.city} →{" "}
                        {parcel.dropLocation.city}
                      </span>
                    </div>
                    <StatusBadge status={parcel.status} />
                  </div>
                  <div className="mt-1.5 flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {parcel.parcelType}
                    </span>
                    <span className="text-xs text-muted-foreground">·</span>
                    <span className="text-xs font-semibold text-carry-blue">
                      ₹{parcel.priceOffered.toString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.section>
        )}

        {/* My Trips */}
        {activeTrips.length > 0 && (
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35 }}
            className="mb-5"
          >
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-extrabold text-sm uppercase tracking-wide text-foreground">
                My Trips
              </h2>
              <button
                type="button"
                onClick={() => navigate("my-listings")}
                className="text-xs text-carry-blue font-semibold"
              >
                See all
              </button>
            </div>
            <div className="space-y-2">
              {activeTrips.slice(0, 3).map((trip, idx) => (
                <div
                  key={`${trip.fromLocation.city}-${trip.toLocation.city}-${idx}`}
                  className="bg-white rounded-2xl p-4 shadow-card border border-border"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <MapPin size={14} className="text-carry-blue shrink-0" />
                    <span className="text-sm font-semibold text-foreground truncate">
                      {trip.fromLocation.city} → {trip.toLocation.city}
                    </span>
                  </div>
                  <div className="mt-1.5 flex items-center gap-2">
                    <Clock size={12} className="text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      {new Date(
                        Number(trip.travelDate / 1_000_000n),
                      ).toLocaleDateString()}
                    </span>
                    <span className="text-xs text-muted-foreground">·</span>
                    <span className="text-xs text-muted-foreground">
                      {trip.capacityDescription}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.section>
        )}

        {activeParcels.length === 0 && activeTrips.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            data-ocid="home.empty_state"
            className="bg-carry-panel rounded-2xl p-6 text-center"
          >
            <Package size={32} className="text-carry-blue mx-auto mb-3" />
            <p className="text-sm font-semibold text-foreground mb-1">
              No activity yet
            </p>
            <p className="text-xs text-muted-foreground">
              Send a parcel or post a trip to get started!
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
