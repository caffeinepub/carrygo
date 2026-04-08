import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import { BottomNav } from "./components/BottomNav";
import { NavigationProvider, useNavigation } from "./context/NavigationContext";
import { usePhoneAuth } from "./hooks/usePhoneAuth";
import { AdminPage } from "./pages/AdminPage";
import { AuthPage } from "./pages/AuthPage";
import { BrowsePage } from "./pages/BrowsePage";
import { HomePage } from "./pages/HomePage";
import { MapPage } from "./pages/MapPage";
import { MyListingsPage } from "./pages/MyListingsPage";
import { NotificationsPage } from "./pages/NotificationsPage";
import { ProfilePage } from "./pages/ProfilePage";
import { SendParcelPage } from "./pages/SendParcelPage";
import { TermsPage } from "./pages/TermsPage";
import { TravelEarnPage } from "./pages/TravelEarnPage";

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000, retry: 1 } },
});

const TAB_SCREENS = new Set([
  "home",
  "browse",
  "map",
  "my-listings",
  "profile",
  "notifications",
]);

class AppErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("[CarryGo] App error:", error, info.componentStack);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-charcoal flex flex-col items-center justify-center p-6 text-center">
          <div className="w-14 h-14 rounded-2xl bg-red-500/20 flex items-center justify-center mb-4">
            <span className="text-2xl">⚠️</span>
          </div>
          <p className="text-white font-bold text-lg mb-2">
            Something went wrong
          </p>
          <p className="text-gray-400 text-sm mb-6">
            {this.state.error?.message ?? "An unexpected error occurred."}
          </p>
          <button
            type="button"
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.reload();
            }}
            className="px-6 py-3 bg-carry-blue text-white font-bold rounded-full text-sm"
          >
            Reload App
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function AppInner() {
  const { identity, isInitializing, providerMissing } = usePhoneAuth();
  const { screen, navigate } = useNavigation();

  if (providerMissing) {
    return (
      <div className="min-h-screen bg-charcoal flex flex-col items-center justify-center p-6 text-center">
        <div className="w-14 h-14 rounded-2xl bg-yellow-500/20 flex items-center justify-center mb-4">
          <span className="text-2xl">⚙️</span>
        </div>
        <p className="text-white font-bold text-lg mb-2">Auth not available</p>
        <p className="text-gray-400 text-sm mb-6">
          PhoneAuthProvider is missing. Please reload the app.
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-carry-blue text-white font-bold rounded-full text-sm"
        >
          Reload App
        </button>
      </div>
    );
  }

  if (isInitializing) {
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

  // Login bypassed: skip profile setup, go straight to dashboard
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
        {screen === "map" && <MapPage />}
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
    <AppErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <NavigationProvider>
          <AppInner />
          <Toaster position="top-center" />
        </NavigationProvider>
      </QueryClientProvider>
    </AppErrorBoundary>
  );
}
