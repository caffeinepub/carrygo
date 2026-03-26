import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Location {
    country: string;
    city: string;
    address: string;
}
export interface Trip {
    active: boolean;
    capacityDescription: string;
    toLocation: Location;
    traveler: Principal;
    fromLocation: Location;
    travelDate: Time;
}
export type Time = bigint;
export interface Parcel {
    status: ParcelStatus;
    matchedTraveler?: Principal;
    description: string;
    parcelType: string;
    sender: Principal;
    dropLocation: Location;
    priceOffered: bigint;
    pickupLocation: Location;
}
export interface UserProfile {
    blocked: boolean;
    name: string;
    completedDeliveries: bigint;
    rating: number;
    phone: string;
}
export interface Notification {
    id: bigint;
    message: string;
    notificationType: NotificationType;
    relatedParcelIndex?: bigint;
    relatedTripIndex?: bigint;
    read: boolean;
    timestamp: Time;
}
export enum ParcelStatus {
    requested = "requested",
    inTransit = "inTransit",
    delivered = "delivered",
    accepted = "accepted"
}
export enum NotificationType {
    parcelMatch = "parcelMatch",
    tripMatch = "tripMatch"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    acceptParcel(parcelIndex: bigint): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    blockUser(userId: Principal): Promise<void>;
    createOrUpdateProfile(name: string, phone: string): Promise<void>;
    getAllParcels(): Promise<Array<Parcel>>;
    getAllTrips(): Promise<Array<Trip>>;
    getAllUsers(): Promise<Array<UserProfile>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getMatchingParcelsForTrip(fromLocation: Location, toLocation: Location): Promise<Array<Parcel>>;
    getMatchingTripsForParcel(pickupLocation: Location, dropLocation: Location): Promise<Array<Trip>>;
    getMyNotifications(): Promise<Array<Notification>>;
    getMyParcels(): Promise<Array<Parcel>>;
    getMyTrips(): Promise<Array<Trip>>;
    getOwnProfile(): Promise<UserProfile>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    markAllNotificationsRead(): Promise<void>;
    markNotificationRead(notifId: bigint): Promise<void>;
    postParcel(pickupLocation: Location, dropLocation: Location, parcelType: string, priceOffered: bigint, description: string): Promise<void>;
    postTrip(fromLocation: Location, toLocation: Location, travelDate: Time, capacityDescription: string): Promise<void>;
    rateUser(userId: Principal, rating: number): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    unblockUser(userId: Principal): Promise<void>;
    updateParcelStatus(parcelIndex: bigint, newStatus: ParcelStatus): Promise<void>;
}
