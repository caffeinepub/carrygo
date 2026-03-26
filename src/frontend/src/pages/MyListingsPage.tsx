import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Boxes, Clock, MapPin, Package, TrendingUp, Users } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { Parcel, Trip } from "../backend.d";
import { ParcelStatus } from "../backend.d";
import { StatusBadge } from "../components/StatusBadge";
import {
  useAcceptParcel,
  useMatchingParcels,
  useMatchingTrips,
  useMyParcels,
  useMyTrips,
  useUpdateParcelStatus,
} from "../hooks/useQueries";

const STATUS_TRANSITIONS: Partial<
  Record<ParcelStatus, { label: string; next: ParcelStatus }>
> = {
  [ParcelStatus.accepted]: {
    label: "Mark In Transit",
    next: ParcelStatus.inTransit,
  },
  [ParcelStatus.inTransit]: {
    label: "Mark Delivered",
    next: ParcelStatus.delivered,
  },
};

function TravelersForRoute({ parcel }: { parcel: Parcel }) {
  const { data: trips = [], isLoading } = useMatchingTrips(
    parcel.pickupLocation,
    parcel.dropLocation,
  );
  const acceptParcel = useAcceptParcel();
  const [acceptingIdx, setAcceptingIdx] = useState<number | null>(null);

  const handleAccept = async (i: number) => {
    setAcceptingIdx(i);
    try {
      await acceptParcel.mutateAsync(BigInt(i));
      toast.success("Accepted!");
    } catch {
      toast.error("Could not accept");
    } finally {
      setAcceptingIdx(null);
    }
  };

  if (isLoading) {
    return (
      <div className="mt-3 space-y-2">
        <Skeleton className="h-4 w-40 rounded" />
        <Skeleton className="h-16 rounded-xl" />
      </div>
    );
  }

  if (trips.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mt-3 pt-3 border-t border-border"
    >
      <div className="flex items-center gap-1.5 mb-2">
        <Users size={12} className="text-carry-blue" />
        <span className="text-xs font-bold text-carry-blue">
          Travelers for Your Route
        </span>
      </div>
      <div className="space-y-2">
        {(trips as Trip[]).map((trip, i) => (
          <div
            key={`traveler-${trip.fromLocation.city}-${trip.toLocation.city}-${i}`}
            className="bg-muted/60 rounded-xl p-3"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1 mb-0.5">
                  <MapPin size={11} className="text-muted-foreground" />
                  <span className="text-xs font-semibold">
                    {trip.fromLocation.city} → {trip.toLocation.city}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {new Date(
                    Number(trip.travelDate / 1_000_000n),
                  ).toLocaleDateString()}
                </span>
              </div>
              <div className="flex gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  data-ocid={`travelers_route.contact.button.${i + 1}`}
                  className="h-7 text-xs rounded-full px-3"
                  onClick={() => window.open("https://wa.me/", "_blank")}
                >
                  Contact
                </Button>
                <Button
                  size="sm"
                  data-ocid={`travelers_route.accept.button.${i + 1}`}
                  className="h-7 text-xs rounded-full px-3 bg-carry-blue text-white"
                  disabled={acceptingIdx === i}
                  onClick={() => handleAccept(i)}
                >
                  {acceptingIdx === i ? "..." : "Accept"}
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function ParcelsOnRoute({ trip }: { trip: Trip }) {
  const { data: parcels = [], isLoading } = useMatchingParcels(
    trip.fromLocation,
    trip.toLocation,
  );
  const acceptParcel = useAcceptParcel();
  const [acceptingIdx, setAcceptingIdx] = useState<number | null>(null);

  const handleAccept = async (i: number) => {
    setAcceptingIdx(i);
    try {
      await acceptParcel.mutateAsync(BigInt(i));
      toast.success("Accepted!");
    } catch {
      toast.error("Could not accept");
    } finally {
      setAcceptingIdx(null);
    }
  };

  if (isLoading) {
    return (
      <div className="mt-3 space-y-2">
        <Skeleton className="h-4 w-40 rounded" />
        <Skeleton className="h-16 rounded-xl" />
      </div>
    );
  }

  if (parcels.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mt-3 pt-3 border-t border-border"
    >
      <div className="flex items-center gap-1.5 mb-2">
        <Boxes size={12} className="text-carry-blue" />
        <span className="text-xs font-bold text-carry-blue">
          Parcels on Your Route
        </span>
      </div>
      <div className="space-y-2">
        {(parcels as Parcel[]).map((parcel, i) => (
          <div
            key={`parcel-route-${parcel.pickupLocation.city}-${parcel.dropLocation.city}-${i}`}
            className="bg-muted/60 rounded-xl p-3"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1 mb-0.5">
                  <MapPin size={11} className="text-muted-foreground" />
                  <span className="text-xs font-semibold">
                    {parcel.pickupLocation.city} → {parcel.dropLocation.city}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {parcel.parcelType}
                  </span>
                  <span className="text-xs font-bold text-carry-blue">
                    {parcel.priceOffered.toString()} INR
                  </span>
                </div>
              </div>
              <div className="flex gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  data-ocid={`parcels_route.contact.button.${i + 1}`}
                  className="h-7 text-xs rounded-full px-3"
                  onClick={() => window.open("https://wa.me/", "_blank")}
                >
                  Contact
                </Button>
                <Button
                  size="sm"
                  data-ocid={`parcels_route.accept.button.${i + 1}`}
                  className="h-7 text-xs rounded-full px-3 bg-carry-blue text-white"
                  disabled={acceptingIdx === i}
                  onClick={() => handleAccept(i)}
                >
                  {acceptingIdx === i ? "..." : "Accept"}
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

export function MyListingsPage() {
  const { data: parcels = [], isLoading: parcelsLoading } = useMyParcels();
  const { data: trips = [], isLoading: tripsLoading } = useMyTrips();
  const updateStatus = useUpdateParcelStatus();
  const [updatingIndex, setUpdatingIndex] = useState<number | null>(null);

  const handleStatusUpdate = async (index: number, next: ParcelStatus) => {
    setUpdatingIndex(index);
    try {
      await updateStatus.mutateAsync({ index: BigInt(index), status: next });
      toast.success("Status updated!");
    } catch {
      toast.error("Failed to update status");
    } finally {
      setUpdatingIndex(null);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="bg-charcoal px-5 pt-12 pb-5">
        <h1 className="text-xl font-extrabold text-white">My Listings</h1>
      </header>

      <div className="px-5 pt-5">
        <Tabs defaultValue="parcels">
          <TabsList className="w-full rounded-full bg-muted p-1 h-11 mb-5">
            <TabsTrigger
              value="parcels"
              data-ocid="my_listings.parcels.tab"
              className="flex-1 rounded-full font-semibold"
            >
              <Package size={14} className="mr-1.5" /> My Parcels
            </TabsTrigger>
            <TabsTrigger
              value="trips"
              data-ocid="my_listings.trips.tab"
              className="flex-1 rounded-full font-semibold"
            >
              <TrendingUp size={14} className="mr-1.5" /> My Trips
            </TabsTrigger>
          </TabsList>

          <TabsContent value="parcels">
            {parcelsLoading ? (
              <div
                className="space-y-3"
                data-ocid="my_listings.parcels.loading_state"
              >
                {[1, 2, 3].map((n) => (
                  <Skeleton key={n} className="h-28 rounded-2xl" />
                ))}
              </div>
            ) : parcels.length === 0 ? (
              <div
                className="text-center py-16"
                data-ocid="my_listings.parcels.empty_state"
              >
                <Package
                  size={36}
                  className="text-muted-foreground mx-auto mb-3"
                />
                <p className="text-sm font-semibold">No parcels yet</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Post a parcel to get started.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {(parcels as Parcel[]).map((parcel, i) => {
                  const transition = STATUS_TRANSITIONS[parcel.status];
                  return (
                    <motion.div
                      key={`${parcel.pickupLocation.city}-${parcel.dropLocation.city}-${parcel.parcelType}-${i}`}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      data-ocid={`my_listings.parcel.item.${i + 1}`}
                      className="bg-white rounded-2xl p-4 shadow-card border border-border"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <MapPin size={14} className="text-carry-blue" />
                          <span className="text-sm font-bold">
                            {parcel.pickupLocation.city} →{" "}
                            {parcel.dropLocation.city}
                          </span>
                        </div>
                        <StatusBadge status={parcel.status} />
                      </div>
                      <div className="flex items-center gap-2 mb-3">
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
                      {transition && (
                        <Button
                          size="sm"
                          data-ocid={`my_listings.parcel.status.button.${i + 1}`}
                          onClick={() => handleStatusUpdate(i, transition.next)}
                          disabled={updatingIndex === i}
                          className="w-full rounded-full bg-carry-blue text-white text-xs h-9 font-bold"
                        >
                          {updatingIndex === i
                            ? "Updating..."
                            : transition.label}
                        </Button>
                      )}
                      <TravelersForRoute parcel={parcel} />
                    </motion.div>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="trips">
            {tripsLoading ? (
              <div
                className="space-y-3"
                data-ocid="my_listings.trips.loading_state"
              >
                {[1, 2, 3].map((n) => (
                  <Skeleton key={n} className="h-24 rounded-2xl" />
                ))}
              </div>
            ) : trips.length === 0 ? (
              <div
                className="text-center py-16"
                data-ocid="my_listings.trips.empty_state"
              >
                <TrendingUp
                  size={36}
                  className="text-muted-foreground mx-auto mb-3"
                />
                <p className="text-sm font-semibold">No trips yet</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Post a trip to earn money on your journey.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {(trips as Trip[]).map((trip, i) => (
                  <motion.div
                    key={`${trip.fromLocation.city}-${trip.toLocation.city}-${i}`}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    data-ocid={`my_listings.trip.item.${i + 1}`}
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
                    <div className="flex items-center gap-2">
                      <Clock size={12} className="text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        {new Date(
                          Number(trip.travelDate / 1_000_000n),
                        ).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {trip.capacityDescription}
                    </p>
                    <ParcelsOnRoute trip={trip} />
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
