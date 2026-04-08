import type { Principal } from "@icp-sdk/core/principal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  Location,
  Notification,
  ParcelStatus,
  UserProfile,
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
      } catch (err) {
        console.error("[CarryGo] getOwnProfile failed:", err);
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
      try {
        return await actor.isCallerAdmin();
      } catch (err) {
        console.error("[CarryGo] isCallerAdmin failed:", err);
        return false;
      }
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
      try {
        return await actor.getMyParcels();
      } catch (err) {
        console.error("[CarryGo] getMyParcels failed:", err);
        return [];
      }
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
      try {
        return await actor.getMyTrips();
      } catch (err) {
        console.error("[CarryGo] getMyTrips failed:", err);
        return [];
      }
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
      try {
        return await actor.getAllParcels();
      } catch (err) {
        console.error("[CarryGo] getAllParcels failed:", err);
        return [];
      }
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
      try {
        return await actor.getAllTrips();
      } catch (err) {
        console.error("[CarryGo] getAllTrips failed:", err);
        return [];
      }
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
      try {
        return await actor.getAllUsers();
      } catch (err) {
        console.error("[CarryGo] getAllUsers failed:", err);
        return [];
      }
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
      try {
        return await actor.getMatchingTripsForParcel(pickup, drop);
      } catch (err) {
        console.error("[CarryGo] getMatchingTripsForParcel failed:", err);
        return [];
      }
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
      try {
        return await actor.getMatchingParcelsForTrip(from, to);
      } catch (err) {
        console.error("[CarryGo] getMatchingParcelsForTrip failed:", err);
        return [];
      }
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
      try {
        return await (actor as any).getMyNotifications();
      } catch (err) {
        console.error("[CarryGo] getMyNotifications failed:", err);
        return [];
      }
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
      try {
        return await (actor as any).markNotificationRead(id);
      } catch (err) {
        console.error("[CarryGo] markNotificationRead failed:", err);
        throw err;
      }
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
      try {
        return await (actor as any).markAllNotificationsRead();
      } catch (err) {
        console.error("[CarryGo] markAllNotificationsRead failed:", err);
        throw err;
      }
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
      try {
        return await actor.createOrUpdateProfile(name, phone);
      } catch (err) {
        console.error("[CarryGo] createOrUpdateProfile failed:", err);
        throw err;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["ownProfile"] }),
  });
}

// Check if a profile exists for a given phone number (used for cross-device login)
export function useCheckProfileByPhone() {
  const { actor } = useActor();
  return async (phone: string): Promise<UserProfile | null> => {
    if (!actor) throw new Error("Not connected");
    try {
      // Returns [] | [UserProfile] in Candid format
      const result = await (actor as any).getProfileByPhone(phone);
      return Array.isArray(result) && result.length > 0 ? result[0] : null;
    } catch (err) {
      console.error("[CarryGo] getProfileByPhone failed:", err);
      return null;
    }
  };
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
      try {
        return await actor.postParcel(
          params.pickupLocation,
          params.dropLocation,
          params.parcelType,
          params.priceOffered,
          params.description,
        );
      } catch (err) {
        console.error("[CarryGo] postParcel failed:", err);
        throw err;
      }
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
      try {
        return await actor.postTrip(
          params.fromLocation,
          params.toLocation,
          params.travelDate,
          params.capacityDescription,
        );
      } catch (err) {
        console.error("[CarryGo] postTrip failed:", err);
        throw err;
      }
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
      try {
        return await actor.acceptParcel(parcelIndex);
      } catch (err) {
        console.error("[CarryGo] acceptParcel failed:", err);
        throw err;
      }
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
      try {
        return await actor.updateParcelStatus(index, status);
      } catch (err) {
        console.error("[CarryGo] updateParcelStatus failed:", err);
        throw err;
      }
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
      try {
        return await actor.blockUser(userId);
      } catch (err) {
        console.error("[CarryGo] blockUser failed:", err);
        throw err;
      }
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
      try {
        return await actor.unblockUser(userId);
      } catch (err) {
        console.error("[CarryGo] unblockUser failed:", err);
        throw err;
      }
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
      try {
        return await actor.rateUser(userId, rating);
      } catch (err) {
        console.error("[CarryGo] rateUser failed:", err);
        throw err;
      }
    },
  });
}

export function useAssignRole() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ user, role }: { user: Principal; role: UserRole }) => {
      if (!actor) throw new Error("Not connected");
      try {
        return await actor.assignCallerUserRole(user, role);
      } catch (err) {
        console.error("[CarryGo] assignCallerUserRole failed:", err);
        throw err;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["allUsers"] }),
  });
}
