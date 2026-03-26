import Time "mo:core/Time";
import Int "mo:core/Int";
import Text "mo:core/Text";
import Order "mo:core/Order";
import Nat "mo:core/Nat";
import Float "mo:core/Float";
import Array "mo:core/Array";
import List "mo:core/List";
import Map "mo:core/Map";
import Iter "mo:core/Iter";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";

import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  // Types and Modules
  type Location = {
    city : Text;
    country : Text;
    address : Text;
  };

  type ParcelStatus = {
    #requested;
    #accepted;
    #inTransit;
    #delivered;
  };

  type NotificationType = {
    #parcelMatch;
    #tripMatch;
  };

  type Notification = {
    id : Nat;
    message : Text;
    notificationType : NotificationType;
    relatedParcelIndex : ?Nat;
    relatedTripIndex : ?Nat;
    read : Bool;
    timestamp : Time.Time;
  };

  module Location {
    public func compare(loc1 : Location, loc2 : Location) : Order.Order {
      switch (Text.compare(loc1.city, loc2.city)) {
        case (#equal) { Text.compare(loc1.country, loc2.country) };
        case (order) { order };
      };
    };
  };

  type UserProfile = {
    phone : Text;
    name : Text;
    rating : Float;
    completedDeliveries : Nat;
    blocked : Bool;
  };

  module UserProfile {
    public func compareByCompletedDeliveries(profile1 : UserProfile, profile2 : UserProfile) : Order.Order {
      Nat.compare(profile2.completedDeliveries, profile1.completedDeliveries);
    };
  };

  type Parcel = {
    pickupLocation : Location;
    dropLocation : Location;
    parcelType : Text;
    priceOffered : Nat;
    description : Text;
    sender : Principal;
    status : ParcelStatus;
    matchedTraveler : ?Principal;
  };

  module Parcel {
    public func compare(parcel1 : Parcel, parcel2 : Parcel) : Order.Order {
      Text.compare(parcel1.parcelType, parcel2.parcelType);
    };

    public func compareByPrice(parcel1 : Parcel, parcel2 : Parcel) : Order.Order {
      Nat.compare(parcel2.priceOffered, parcel1.priceOffered);
    };
  };

  type Trip = {
    fromLocation : Location;
    toLocation : Location;
    travelDate : Time.Time;
    capacityDescription : Text;
    traveler : Principal;
    active : Bool;
  };

  module Trip {
    public func compare(trip1 : Trip, trip2 : Trip) : Order.Order {
      Int.compare(trip1.travelDate, trip2.travelDate);
    };

    public func compareByFromLocation(trip1 : Trip, trip2 : Trip) : Order.Order {
      Location.compare(trip1.fromLocation, trip2.fromLocation);
    };

    public func compareByToLocation(trip1 : Trip, trip2 : Trip) : Order.Order {
      Location.compare(trip1.toLocation, trip2.toLocation);
    };
  };

  // State
  let accessControlState = AccessControl.initState();
  let userProfiles = Map.empty<Principal, UserProfile>();
  let parcels = List.empty<Parcel>();
  let trips = List.empty<Trip>();
  let notifications = Map.empty<Principal, List.List<Notification>>();
  var nextNotificationId : Nat = 0;

  include MixinAuthorization(accessControlState);

  // Internal helper to add notification for a user
  func addNotification(recipient : Principal, message : Text, notifType : NotificationType, parcelIdx : ?Nat, tripIdx : ?Nat) {
    let notif : Notification = {
      id = nextNotificationId;
      message;
      notificationType = notifType;
      relatedParcelIndex = parcelIdx;
      relatedTripIndex = tripIdx;
      read = false;
      timestamp = Time.now();
    };
    nextNotificationId += 1;
    let userNotifs = switch (notifications.get(recipient)) {
      case (null) { List.empty<Notification>() };
      case (?list) { list };
    };
    userNotifs.add(notif);
    notifications.add(recipient, userNotifs);
  };

  // Required Profile Management Functions (for frontend)
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  // Profile Management
  public shared ({ caller }) func createOrUpdateProfile(name : Text, phone : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create or update profiles");
    };
    let profile : UserProfile = {
      name;
      phone;
      rating = 0.0;
      completedDeliveries = 0;
      blocked = false;
    };
    userProfiles.add(caller, profile);
  };

  public query ({ caller }) func getOwnProfile() : async UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("User does not exist") };
      case (?profile) { profile };
    };
  };

  // Notification Functions
  public query ({ caller }) func getMyNotifications() : async [Notification] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized");
    };
    switch (notifications.get(caller)) {
      case (null) { [] };
      case (?list) {
        let arr = list.toArray();
        arr.sort(func(a : Notification, b : Notification) : Order.Order {
          Int.compare(b.timestamp, a.timestamp)
        });
      };
    };
  };

  public shared ({ caller }) func markNotificationRead(notifId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized");
    };
    switch (notifications.get(caller)) {
      case (null) { () };
      case (?list) {
        let arr = list.toVarArray();
        var i = 0;
        while (i < arr.size()) {
          if (arr[i].id == notifId) {
            arr[i] := { arr[i] with read = true };
          };
          i += 1;
        };
        list.clear();
        for (item in arr.vals()) {
          list.add(item);
        };
      };
    };
  };

  public shared ({ caller }) func markAllNotificationsRead() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized");
    };
    switch (notifications.get(caller)) {
      case (null) { () };
      case (?list) {
        let arr = list.toVarArray();
        var i = 0;
        while (i < arr.size()) {
          arr[i] := { arr[i] with read = true };
          i += 1;
        };
        list.clear();
        for (item in arr.vals()) {
          list.add(item);
        };
      };
    };
  };

  // Parcel Management
  public shared ({ caller }) func postParcel(
    pickupLocation : Location,
    dropLocation : Location,
    parcelType : Text,
    priceOffered : Nat,
    description : Text,
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can post parcels");
    };
    switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("User does not exist") };
      case (?profile) {
        if (profile.blocked) {
          Runtime.trap("User is blocked");
        };
      };
    };
    let parcel : Parcel = {
      pickupLocation;
      dropLocation;
      parcelType;
      priceOffered;
      description;
      sender = caller;
      status = #requested;
      matchedTraveler = null;
    };
    let parcelIndex = parcels.size();
    parcels.add(parcel);

    // Notify matching travelers
    let matchingTrips = trips.filter(
      func(trip) {
        trip.active and
        Text.equal(trip.fromLocation.city, pickupLocation.city) and
        Text.equal(trip.toLocation.city, dropLocation.city)
      }
    );
    for (trip in matchingTrips.toArray().vals()) {
      if (not Principal.equal(trip.traveler, caller)) {
        addNotification(
          trip.traveler,
          "New parcel available on your route (" # pickupLocation.city # " \u{2192} " # dropLocation.city # ")",
          #parcelMatch,
          ?parcelIndex,
          null,
        );
      };
    };
  };

  public query ({ caller }) func getAllParcels() : async [Parcel] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view parcels");
    };
    parcels.toArray().sort();
  };

  public query ({ caller }) func getMyParcels() : async [Parcel] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view their parcels");
    };
    let userParcels = parcels.filter(
      func(parcel) { Principal.equal(parcel.sender, caller) }
    );
    userParcels.toArray();
  };

  public shared ({ caller }) func acceptParcel(parcelIndex : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can accept parcels");
    };

    switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("User does not exist") };
      case (?profile) {
        if (profile.blocked) {
          Runtime.trap("User is blocked");
        };
      };
    };

    let parcelArray = parcels.toVarArray();
    if (parcelIndex >= parcelArray.size()) {
      Runtime.trap("Parcel does not exist.");
    };

    let oldParcel = parcelArray[parcelIndex];
    let newParcel : Parcel = {
      oldParcel with
      status = #accepted;
      matchedTraveler = ?caller;
    };
    parcelArray[parcelIndex] := newParcel;

    parcels.clear();
    for (item in parcelArray.vals()) {
      parcels.add(item);
    };
  };

  public shared ({ caller }) func updateParcelStatus(parcelIndex : Nat, newStatus : ParcelStatus) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update parcel status");
    };

    let parcelArray = parcels.toVarArray();
    if (parcelIndex >= parcelArray.size()) {
      Runtime.trap("Parcel does not exist.");
    };

    let parcel = parcelArray[parcelIndex];

    let isAuthorized = Principal.equal(caller, parcel.sender) or
      (switch (parcel.matchedTraveler) {
        case (?traveler) { Principal.equal(caller, traveler) };
        case (null) { false };
      }) or
      AccessControl.isAdmin(accessControlState, caller);

    if (not isAuthorized) {
      Runtime.trap("Unauthorized: Only the sender, traveler, or admin can update parcel status");
    };

    if (not AccessControl.isAdmin(accessControlState, caller)) {
      switch (userProfiles.get(caller)) {
        case (null) { Runtime.trap("User does not exist") };
        case (?profile) {
          if (profile.blocked) {
            Runtime.trap("User is blocked");
          };
        };
      };
    };

    let updatedParcel : Parcel = {
      parcel with
      status = newStatus;
    };
    parcelArray[parcelIndex] := updatedParcel;

    if (newStatus == #delivered) {
      let senderId = parcelArray[parcelIndex].sender;
      switch (userProfiles.get(senderId)) {
        case (null) { () };
        case (?profile) {
          let updatedProfile : UserProfile = {
            profile with
            completedDeliveries = profile.completedDeliveries + 1;
          };
          userProfiles.add(senderId, updatedProfile);
        };
      };

      switch (updatedParcel.matchedTraveler) {
        case (?travelerId) {
          switch (userProfiles.get(travelerId)) {
            case (null) { () };
            case (?profile) {
              let updatedProfile : UserProfile = {
                profile with
                completedDeliveries = profile.completedDeliveries + 1;
              };
              userProfiles.add(travelerId, updatedProfile);
            };
          };
        };
        case (null) { () };
      };
    };

    parcels.clear();
    for (item in parcelArray.vals()) {
      parcels.add(item);
    };
  };

  // Trip Management
  public shared ({ caller }) func postTrip(
    fromLocation : Location,
    toLocation : Location,
    travelDate : Time.Time,
    capacityDescription : Text,
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can post trips");
    };
    switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("User does not exist") };
      case (?profile) {
        if (profile.blocked) {
          Runtime.trap("User is blocked");
        };
      };
    };
    let trip : Trip = {
      fromLocation;
      toLocation;
      travelDate;
      capacityDescription;
      traveler = caller;
      active = true;
    };
    let tripIndex = trips.size();
    trips.add(trip);

    // Notify matching parcel senders
    let matchingParcels = parcels.filter(
      func(parcel) {
        parcel.status == #requested and
        Text.equal(parcel.pickupLocation.city, fromLocation.city) and
        Text.equal(parcel.dropLocation.city, toLocation.city)
      }
    );
    for (parcel in matchingParcels.toArray().vals()) {
      if (not Principal.equal(parcel.sender, caller)) {
        addNotification(
          parcel.sender,
          "Traveler available on your route (" # fromLocation.city # " \u{2192} " # toLocation.city # ")",
          #tripMatch,
          null,
          ?tripIndex,
        );
      };
    };
  };

  public query ({ caller }) func getAllTrips() : async [Trip] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view trips");
    };
    trips.toArray().sort();
  };

  public query ({ caller }) func getMyTrips() : async [Trip] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view their trips");
    };
    let userTrips = trips.filter(
      func(trip) { Principal.equal(trip.traveler, caller) }
    );
    userTrips.toArray();
  };

  public query ({ caller }) func getMatchingTripsForParcel(pickupLocation : Location, dropLocation : Location) : async [Trip] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can search for matching trips");
    };
    let matchingTrips = trips.filter(
      func(trip) {
        Text.equal(trip.fromLocation.city, pickupLocation.city) and Text.equal(trip.toLocation.city, dropLocation.city)
      }
    );
    matchingTrips.toArray();
  };

  public query ({ caller }) func getMatchingParcelsForTrip(fromLocation : Location, toLocation : Location) : async [Parcel] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can search for matching parcels");
    };
    let matchingParcels = parcels.filter(
      func(parcel) {
        Text.equal(parcel.pickupLocation.city, fromLocation.city) and Text.equal(parcel.dropLocation.city, toLocation.city)
      }
    );
    matchingParcels.toArray();
  };

  // Rating System
  public shared ({ caller }) func rateUser(userId : Principal, rating : Float) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can rate other users");
    };
    if (rating < 1.0 or rating > 5.0) {
      Runtime.trap("Invalid rating. Must be between 1.0 and 5.0");
    };
    switch (userProfiles.get(userId)) {
      case (null) { Runtime.trap("User does not exist") };
      case (?profile) {
        let totalRatings = profile.completedDeliveries;
        let updatedRating : Float = if (totalRatings == 0) {
          rating;
        } else {
          (profile.rating * totalRatings.toFloat() + rating) / (totalRatings.toFloat() + 1.0);
        };
        let updatedProfile : UserProfile = {
          profile with
          rating = updatedRating;
        };
        userProfiles.add(userId, updatedProfile);
      };
    };
  };

  // Admin Functions
  public query ({ caller }) func getAllUsers() : async [UserProfile] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    let users = userProfiles.values().toArray();
    users.sort(UserProfile.compareByCompletedDeliveries);
  };

  public shared ({ caller }) func blockUser(userId : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    switch (userProfiles.get(userId)) {
      case (null) { Runtime.trap("User does not exist") };
      case (?profile) {
        let updatedProfile : UserProfile = {
          profile with
          blocked = true;
        };
        userProfiles.add(userId, updatedProfile);
      };
    };
  };

  public shared ({ caller }) func unblockUser(userId : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    switch (userProfiles.get(userId)) {
      case (null) { Runtime.trap("User does not exist") };
      case (?profile) {
        let updatedProfile : UserProfile = {
          profile with
          blocked = false;
        };
        userProfiles.add(userId, updatedProfile);
      };
    };
  };
};
