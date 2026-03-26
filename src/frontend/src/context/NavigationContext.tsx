import { type ReactNode, createContext, useContext, useState } from "react";

export type Screen =
  | "auth"
  | "setup-profile"
  | "home"
  | "send-parcel"
  | "travel-earn"
  | "browse"
  | "my-listings"
  | "profile"
  | "admin"
  | "terms"
  | "notifications";

interface NavigationContextType {
  screen: Screen;
  navigate: (screen: Screen) => void;
  history: Screen[];
  goBack: () => void;
}

const NavigationContext = createContext<NavigationContextType | null>(null);

export function NavigationProvider({ children }: { children: ReactNode }) {
  const [screen, setScreen] = useState<Screen>("auth");
  const [history, setHistory] = useState<Screen[]>([]);

  const navigate = (next: Screen) => {
    setHistory((prev) => [...prev, screen]);
    setScreen(next);
  };

  const goBack = () => {
    setHistory((prev) => {
      const newHistory = [...prev];
      const previous = newHistory.pop();
      if (previous) setScreen(previous);
      return newHistory;
    });
  };

  return (
    <NavigationContext.Provider value={{ screen, navigate, history, goBack }}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const ctx = useContext(NavigationContext);
  if (!ctx)
    throw new Error("useNavigation must be used within NavigationProvider");
  return ctx;
}
