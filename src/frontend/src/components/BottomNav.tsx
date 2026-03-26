import { Bell, Home, Package, Search, User } from "lucide-react";
import { type Screen, useNavigation } from "../context/NavigationContext";
import { useMyNotifications } from "../hooks/useQueries";

const tabs: { label: string; icon: React.ReactNode; screen: Screen }[] = [
  { label: "Home", icon: <Home size={20} />, screen: "home" },
  { label: "Browse", icon: <Search size={20} />, screen: "browse" },
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

const tabsWithBell = tabs.map((t) =>
  t.screen === "notifications" ? { ...t, icon: <NotificationBell /> } : t,
);

export function BottomNav() {
  const { screen, navigate } = useNavigation();
  const activeTab = (
    ["home", "browse", "my-listings", "profile", "notifications"] as Screen[]
  ).includes(screen)
    ? screen
    : null;

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
