import {
  Bell,
  Home,
  Map as MapIcon,
  Package,
  Search,
  User,
} from "lucide-react";
import { type Screen, useNavigation } from "../context/NavigationContext";
import {
  useAllParcels,
  useAllTrips,
  useMyNotifications,
} from "../hooks/useQueries";

const tabs: { label: string; icon: React.ReactNode; screen: Screen }[] = [
  { label: "Home", icon: <Home size={20} />, screen: "home" },
  { label: "Browse", icon: <Search size={20} />, screen: "browse" },
  { label: "Map", icon: <MapIcon size={20} />, screen: "map" },
  { label: "My Listings", icon: <Package size={20} />, screen: "my-listings" },
  { label: "Profile", icon: <User size={20} />, screen: "profile" },
  { label: "Alerts", icon: <Bell size={20} />, screen: "notifications" },
];

function NotificationBell() {
  const { data: notifications = [] } = useMyNotifications();
  const unread = notifications.filter((n) => !n.read).length;
  return (
    <span className="relative inline-flex">
      <Bell size={20} />
      {unread > 0 && (
        <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center px-0.5">
          {unread > 99 ? "99+" : unread}
        </span>
      )}
    </span>
  );
}

function BrowseIcon() {
  const { data: parcels = [] } = useAllParcels();
  const { data: trips = [] } = useAllTrips();
  const matchCount = parcels.reduce((count, parcel) => {
    const matched = trips.filter(
      (trip) =>
        parcel.pickupLocation.city.toLowerCase() ===
          trip.fromLocation.city.toLowerCase() &&
        parcel.dropLocation.city.toLowerCase() ===
          trip.toLocation.city.toLowerCase(),
    ).length;
    return count + matched;
  }, 0);
  return (
    <span className="relative inline-flex">
      <Search size={20} />
      {matchCount > 0 && (
        <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 rounded-full bg-green-500 text-white text-[9px] font-bold flex items-center justify-center px-0.5">
          {matchCount > 99 ? "99+" : matchCount}
        </span>
      )}
    </span>
  );
}

const tabsWithBell = tabs.map((t) => {
  if (t.screen === "notifications") return { ...t, icon: <NotificationBell /> };
  if (t.screen === "browse") return { ...t, icon: <BrowseIcon /> };
  return t;
});

const TAB_SCREENS: Screen[] = [
  "home",
  "browse",
  "map",
  "my-listings",
  "profile",
  "notifications",
];

export function BottomNav() {
  const { screen, navigate } = useNavigation();
  const activeTab = TAB_SCREENS.includes(screen) ? screen : null;

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white border-t border-border z-50">
      <div className="flex">
        {tabsWithBell.map((tab) => (
          <button
            type="button"
            key={tab.screen}
            data-ocid={`nav.${tab.screen}.link`}
            onClick={() => navigate(tab.screen)}
            className={`flex-1 flex flex-col items-center gap-0.5 py-3 text-xs font-medium transition-colors ${
              activeTab === tab.screen
                ? "text-carry-blue"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <span
              className={`p-1 rounded-lg transition-colors ${
                activeTab === tab.screen ? "bg-carry-panel" : ""
              }`}
            >
              {tab.icon}
            </span>
            {tab.label}
          </button>
        ))}
      </div>
    </nav>
  );
}
