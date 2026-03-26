import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Clock, MapPin, Shield, ShieldOff } from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { StarRating } from "../components/StarRating";
import { StatusBadge } from "../components/StatusBadge";
import { useNavigation } from "../context/NavigationContext";
import { useAllParcels, useAllTrips, useAllUsers } from "../hooks/useQueries";

export function AdminPage() {
  const { goBack } = useNavigation();
  const { data: users = [], isLoading: usersLoading } = useAllUsers();
  const { data: parcels = [], isLoading: parcelsLoading } = useAllParcels();
  const { data: trips = [], isLoading: tripsLoading } = useAllTrips();

  const handleToggleBlock = (name: string) => {
    toast.info(`Block/unblock action for ${name} (requires Principal ID)`);
  };

  return (
    <div className="min-h-screen bg-background pb-10">
      <header className="bg-charcoal px-5 pt-12 pb-5">
        <div className="flex items-center gap-3">
          <button
            type="button"
            data-ocid="admin.back.button"
            onClick={goBack}
            className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white"
          >
            <ArrowLeft size={18} />
          </button>
          <h1 className="text-lg font-extrabold text-white">Admin Panel</h1>
        </div>
      </header>

      <div className="px-5 pt-5">
        <Tabs defaultValue="users">
          <TabsList className="w-full rounded-full bg-muted p-1 h-11 mb-5">
            <TabsTrigger
              value="users"
              data-ocid="admin.users.tab"
              className="flex-1 rounded-full font-semibold text-xs"
            >
              Users
            </TabsTrigger>
            <TabsTrigger
              value="parcels"
              data-ocid="admin.parcels.tab"
              className="flex-1 rounded-full font-semibold text-xs"
            >
              Parcels
            </TabsTrigger>
            <TabsTrigger
              value="trips"
              data-ocid="admin.trips.tab"
              className="flex-1 rounded-full font-semibold text-xs"
            >
              Trips
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            {usersLoading ? (
              <div className="space-y-3" data-ocid="admin.users.loading_state">
                {[1, 2].map((n) => (
                  <Skeleton key={n} className="h-20 rounded-2xl" />
                ))}
              </div>
            ) : users.length === 0 ? (
              <div
                className="text-center py-12"
                data-ocid="admin.users.empty_state"
              >
                <p className="text-sm text-muted-foreground">No users yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {users.map((user, i) => (
                  <motion.div
                    key={`${user.name}-${user.phone}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.04 }}
                    data-ocid={`admin.user.item.${i + 1}`}
                    className="bg-white rounded-2xl p-4 shadow-card border border-border"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-sm">{user.name}</p>
                          {user.blocked && (
                            <span className="text-xs bg-red-100 text-red-600 rounded-full px-2 py-0.5 font-semibold">
                              Blocked
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {user.phone}
                        </p>
                        <StarRating rating={user.rating} />
                      </div>
                      <Button
                        size="sm"
                        variant={user.blocked ? "outline" : "destructive"}
                        data-ocid={`admin.user.block.button.${i + 1}`}
                        onClick={() => handleToggleBlock(user.name)}
                        className="rounded-full text-xs h-8"
                      >
                        {user.blocked ? (
                          <>
                            <ShieldOff size={12} className="mr-1" /> Unblock
                          </>
                        ) : (
                          <>
                            <Shield size={12} className="mr-1" /> Block
                          </>
                        )}
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="parcels">
            {parcelsLoading ? (
              <div
                className="space-y-3"
                data-ocid="admin.parcels.loading_state"
              >
                {[1, 2].map((n) => (
                  <Skeleton key={n} className="h-20 rounded-2xl" />
                ))}
              </div>
            ) : parcels.length === 0 ? (
              <div
                className="text-center py-12"
                data-ocid="admin.parcels.empty_state"
              >
                <p className="text-sm text-muted-foreground">No parcels yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {parcels.map((parcel, i) => (
                  <div
                    key={`${parcel.pickupLocation.city}-${parcel.dropLocation.city}-${i}`}
                    data-ocid={`admin.parcel.item.${i + 1}`}
                    className="bg-white rounded-2xl p-4 shadow-card border border-border"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <MapPin size={12} className="text-carry-blue" />
                        <span className="text-sm font-bold">
                          {parcel.pickupLocation.city} →{" "}
                          {parcel.dropLocation.city}
                        </span>
                      </div>
                      <StatusBadge status={parcel.status} />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {parcel.parcelType} · ₹{parcel.priceOffered.toString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="trips">
            {tripsLoading ? (
              <div className="space-y-3" data-ocid="admin.trips.loading_state">
                {[1, 2].map((n) => (
                  <Skeleton key={n} className="h-20 rounded-2xl" />
                ))}
              </div>
            ) : trips.length === 0 ? (
              <div
                className="text-center py-12"
                data-ocid="admin.trips.empty_state"
              >
                <p className="text-sm text-muted-foreground">No trips yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {trips.map((trip, i) => (
                  <div
                    key={`${trip.fromLocation.city}-${trip.toLocation.city}-${i}`}
                    data-ocid={`admin.trip.item.${i + 1}`}
                    className="bg-white rounded-2xl p-4 shadow-card border border-border"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <MapPin size={12} className="text-carry-blue" />
                      <span className="text-sm font-bold">
                        {trip.fromLocation.city} → {trip.toLocation.city}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={11} className="text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        {new Date(
                          Number(trip.travelDate / 1_000_000n),
                        ).toLocaleDateString()}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        · {trip.capacityDescription}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
