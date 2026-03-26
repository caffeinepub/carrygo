import type { Principal } from "@icp-sdk/core/principal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  Location,
  Notification,
  ParcelStatus,
  UserRole,
} from "../backend.d";
import { useActor } from "./useActor";

export function useOwnProfile() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["ownProfile"],
    queryFn: async () => {
      if (!actor) return null;
      try {
        return await actor.getOwnProfile();
      } catch {
        return null;
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useIsAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useMyParcels() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["myParcels"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyParcels();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useMyTrips() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["myTrips"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyTrips();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAllParcels() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["allParcels"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllParcels();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAllTrips() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["allTrips"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllTrips();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAllUsers() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["allUsers"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllUsers();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useMatchingTrips(
  pickup: Location | null,
  drop: Location | null,
) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["matchingTrips", pickup, drop],
    queryFn: async () => {
      if (!actor || !pickup || !drop) return [];
      return actor.getMatchingTripsForParcel(pickup, drop);
    },
    enabled: !!actor && !isFetching && !!pickup && !!drop,
  });
}

export function useMatchingParcels(from: Location | null, to: Location | null) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["matchingParcels", from, to],
    queryFn: async () => {
      if (!actor || !from || !to) return [];
      return actor.getMatchingParcelsForTrip(from, to);
    },
    enabled: !!actor && !isFetching && !!from && !!to,
  });
}

export function useMyNotifications() {
  const { actor, isFetching } = useActor();
  return useQuery<Notification[]>({
    queryKey: ["myNotifications"],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as any).getMyNotifications();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 30000,
  });
}

export function useMarkNotificationRead() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Not connected");
      return (actor as any).markNotificationRead(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["myNotifications"] }),
  });
}

export function useMarkAllNotificationsRead() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Not connected");
      return (actor as any).markAllNotificationsRead();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["myNotifications"] }),
  });
}

export function useCreateProfile() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ name, phone }: { name: string; phone: string }) => {
      if (!actor) throw new Error("Not connected");
      return actor.createOrUpdateProfile(name, phone);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["ownProfile"] }),
  });
}

export function usePostParcel() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      pickupLocation: Location;
      dropLocation: Location;
      parcelType: string;
      priceOffered: bigint;
      description: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.postParcel(
        params.pickupLocation,
        params.dropLocation,
        params.parcelType,
        params.priceOffered,
        params.description,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["myParcels"] }),
  });
}

export function usePostTrip() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      fromLocation: Location;
      toLocation: Location;
      travelDate: bigint;
      capacityDescription: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.postTrip(
        params.fromLocation,
        params.toLocation,
        params.travelDate,
        params.capacityDescription,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["myTrips"] }),
  });
}

export function useAcceptParcel() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (parcelIndex: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.acceptParcel(parcelIndex);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["allParcels"] });
      qc.invalidateQueries({ queryKey: ["myParcels"] });
    },
  });
}

export function useUpdateParcelStatus() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      index,
      status,
    }: { index: bigint; status: ParcelStatus }) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateParcelStatus(index, status);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["myParcels"] });
      qc.invalidateQueries({ queryKey: ["allParcels"] });
    },
  });
}

export function useBlockUser() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (userId: Principal) => {
      if (!actor) throw new Error("Not connected");
      return actor.blockUser(userId);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["allUsers"] }),
  });
}

export function useUnblockUser() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (userId: Principal) => {
      if (!actor) throw new Error("Not connected");
      return actor.unblockUser(userId);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["allUsers"] }),
  });
}

export function useRateUser() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async ({
      userId,
      rating,
    }: { userId: Principal; rating: number }) => {
      if (!actor) throw new Error("Not connected");
      return actor.rateUser(userId, rating);
    },
  });
}

export function useAssignRole() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ user, role }: { user: Principal; role: UserRole }) => {
      if (!actor) throw new Error("Not connected");
      return actor.assignCallerUserRole(user, role);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["allUsers"] }),
  });
}
