import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BottomNav } from "./components/BottomNav";
import { NavigationProvider, useNavigation } from "./context/NavigationContext";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import { useOwnProfile } from "./hooks/useQueries";
import { AdminPage } from "./pages/AdminPage";
import { AuthPage } from "./pages/AuthPage";
import { BrowsePage } from "./pages/BrowsePage";
import { HomePage } from "./pages/HomePage";
import { MyListingsPage } from "./pages/MyListingsPage";
import { NotificationsPage } from "./pages/NotificationsPage";
import { ProfilePage } from "./pages/ProfilePage";
import { SendParcelPage } from "./pages/SendParcelPage";
import { TermsPage } from "./pages/TermsPage";
import { TravelEarnPage } from "./pages/TravelEarnPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
    },
  },
});

const TAB_SCREENS = new Set([
  "home",
  "browse",
  "my-listings",
  "profile",
  "notifications",
]);

function AppInner() {
  const { identity, isInitializing } = useInternetIdentity();
  const { screen, navigate } = useNavigation();
  const { data: profile, isLoading: profileLoading } = useOwnProfile();

  if (isInitializing || (identity && profileLoading)) {
    return (
      <div className="min-h-screen bg-charcoal flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-carry-blue flex items-center justify-center animate-pulse">
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              role="img"
              aria-label="CarryGo logo"
            >
              <title>CarryGo</title>
              <path
                d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <span className="text-white font-extrabold text-xl tracking-tight">
            CarryGo
          </span>
        </div>
      </div>
    );
  }

  if (!identity) {
    return <AuthPage needsProfile={false} />;
  }

  if (!profile) {
    return <AuthPage needsProfile={true} />;
  }

  if (screen === "auth" || screen === "setup-profile") {
    navigate("home");
    return null;
  }

  const showBottomNav = TAB_SCREENS.has(screen);

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-[430px] min-h-screen relative bg-background">
        {screen === "home" && <HomePage />}
        {screen === "send-parcel" && <SendParcelPage />}
        {screen === "travel-earn" && <TravelEarnPage />}
        {screen === "browse" && <BrowsePage />}
        {screen === "my-listings" && <MyListingsPage />}
        {screen === "profile" && <ProfilePage />}
        {screen === "admin" && <AdminPage />}
        {screen === "terms" && <TermsPage />}
        {screen === "notifications" && <NotificationsPage />}
        {showBottomNav && <BottomNav />}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <NavigationProvider>
        <AppInner />
        <Toaster position="top-center" />
      </NavigationProvider>
    </QueryClientProvider>
  );
}
