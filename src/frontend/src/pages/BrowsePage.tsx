import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, Loader2, MapPin, MessageCircle } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { Parcel } from "../backend.d";
import { ParcelStatus } from "../backend.d";
import { StatusBadge } from "../components/StatusBadge";
import {
  useAcceptParcel,
  useAllParcels,
  useAllTrips,
} from "../hooks/useQueries";

interface ParcelCardProps {
  parcel: Parcel;
  index: number;
}

function ParcelBrowseCard({ parcel, index }: ParcelCardProps) {
  const acceptParcel = useAcceptParcel();
  const [accepting, setAccepting] = useState(false);

  const handleAccept = async () => {
    setAccepting(true);
    try {
      await acceptParcel.mutateAsync(BigInt(index));
      toast.success("Parcel accepted! Contact the sender to coordinate.");
    } catch {
      toast.error("Failed to accept parcel");
    } finally {
      setAccepting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      data-ocid={`browse.parcel.item.${index + 1}`}
      className="bg-white rounded-2xl p-4 shadow-card border border-border"
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <MapPin size={14} className="text-carry-blue" />
          <span className="text-sm font-bold">
            {parcel.pickupLocation.city} → {parcel.dropLocation.city}
          </span>
        </div>
        <StatusBadge status={parcel.status} />
      </div>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs bg-muted text-muted-foreground rounded-full px-2 py-0.5">
          {parcel.parcelType}
        </span>
        <span className="text-xs font-extrabold text-carry-blue">
          ₹{parcel.priceOffered.toString()}
        </span>
        <span className="text-xs text-muted-foreground ml-auto">
          {parcel.pickupLocation.country}
        </span>
      </div>
      {parcel.description && (
        <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
          {parcel.description}
        </p>
      )}
      <div className="flex gap-2">
        {parcel.status === ParcelStatus.requested && (
          <Button
            size="sm"
            data-ocid={`browse.parcel.accept.button.${index + 1}`}
            onClick={handleAccept}
            disabled={accepting}
            className="flex-1 rounded-full bg-carry-blue text-white text-xs h-9 font-bold"
          >
            {accepting ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              "Accept Parcel"
            )}
          </Button>
        )}
        <a
          href={`https://wa.me/${String(parcel.sender)}`}
          target="_blank"
          rel="noopener noreferrer"
          data-ocid={`browse.parcel.whatsapp.button.${index + 1}`}
          className="flex items-center gap-1.5 border border-green-500 text-green-600 text-xs font-semibold px-3 py-1.5 rounded-full hover:bg-green-50 transition-colors"
        >
          <MessageCircle size={12} /> WhatsApp
        </a>
      </div>
    </motion.div>
  );
}

export function BrowsePage() {
  const { data: allParcels = [], isLoading: parcelsLoading } = useAllParcels();
  const { data: allTrips = [], isLoading: tripsLoading } = useAllTrips();

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="bg-charcoal px-5 pt-12 pb-5">
        <h1 className="text-xl font-extrabold text-white">Browse</h1>
        <p className="text-gray-400 text-sm mt-0.5">
          Find parcels to carry or trips to ship with
        </p>
      </header>

      <div className="px-5 pt-5">
        <Tabs defaultValue="parcels">
          <TabsList className="w-full rounded-full bg-muted p-1 h-11 mb-5">
            <TabsTrigger
              value="parcels"
              data-ocid="browse.parcels.tab"
              className="flex-1 rounded-full font-semibold"
            >
              All Parcels
            </TabsTrigger>
            <TabsTrigger
              value="trips"
              data-ocid="browse.trips.tab"
              className="flex-1 rounded-full font-semibold"
            >
              All Trips
            </TabsTrigger>
          </TabsList>

          <TabsContent value="parcels">
            {parcelsLoading ? (
              <div
                className="space-y-3"
                data-ocid="browse.parcels.loading_state"
              >
                {[1, 2, 3].map((n) => (
                  <Skeleton key={n} className="h-32 rounded-2xl" />
                ))}
              </div>
            ) : allParcels.length === 0 ? (
              <div
                className="text-center py-16"
                data-ocid="browse.parcels.empty_state"
              >
                <p className="text-sm font-semibold">No parcels available</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Check back soon!
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {allParcels.map((parcel, i) => (
                  <ParcelBrowseCard
                    key={`${parcel.pickupLocation.city}-${parcel.dropLocation.city}-${parcel.parcelType}-${i}`}
                    parcel={parcel}
                    index={i}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="trips">
            {tripsLoading ? (
              <div className="space-y-3" data-ocid="browse.trips.loading_state">
                {[1, 2, 3].map((n) => (
                  <Skeleton key={n} className="h-24 rounded-2xl" />
                ))}
              </div>
            ) : allTrips.length === 0 ? (
              <div
                className="text-center py-16"
                data-ocid="browse.trips.empty_state"
              >
                <p className="text-sm font-semibold">No trips available</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Check back soon!
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {allTrips.map((trip, i) => (
                  <motion.div
                    key={`${trip.fromLocation.city}-${trip.toLocation.city}-${i}`}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    data-ocid={`browse.trip.item.${i + 1}`}
                    className="bg-white rounded-2xl p-4 shadow-card border border-border"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin size={14} className="text-carry-blue" />
                      <span className="text-sm font-bold">
                        {trip.fromLocation.city} → {trip.toLocation.city}
                      </span>
                      {trip.active && (
                        <span className="ml-auto text-xs bg-carry-mint text-carry-mint rounded-full px-2 py-0.5 font-semibold">
                          Active
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <Clock size={12} className="text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {new Date(
                            Number(trip.travelDate / 1_000_000n),
                          ).toLocaleDateString()}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {trip.capacityDescription}
                      </span>
                    </div>
                    <div className="mt-3">
                      <a
                        href={`https://wa.me/${String(trip.traveler)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        data-ocid={`browse.trip.whatsapp.button.${i + 1}`}
                        className="flex items-center gap-1.5 border border-green-500 text-green-600 text-xs font-semibold px-3 py-1.5 rounded-full hover:bg-green-50 transition-colors w-fit"
                      >
                        <MessageCircle size={12} /> Contact via WhatsApp
                      </a>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
