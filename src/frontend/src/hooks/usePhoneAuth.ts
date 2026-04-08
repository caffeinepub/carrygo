import { Ed25519KeyIdentity } from "@dfinity/identity";
import type { Identity } from "@icp-sdk/core/agent";
import {
  type ReactNode,
  createContext,
  createElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const SESSION_KEY = "carrygo_phone_session";
const KEY_PREFIX = "carrygo_key_";

export type PhoneAuthContext = {
  identity?: Identity;
  phone?: string;
  login: (phone: string) => void;
  logout: () => void;
  isInitializing: boolean;
  providerMissing?: boolean;
};

const PhoneAuthReactContext = createContext<PhoneAuthContext | undefined>(
  undefined,
);

/** Safe hook -- returns a fallback value with providerMissing=true instead of throwing. */
export function usePhoneAuth(): PhoneAuthContext {
  const ctx = useContext(PhoneAuthReactContext);
  if (!ctx) {
    console.error(
      "[CarryGo] usePhoneAuth() called outside PhoneAuthProvider. Returning safe fallback.",
    );
    return {
      identity: undefined,
      phone: undefined,
      login: () => {},
      logout: () => {},
      isInitializing: false,
      providerMissing: true,
    };
  }
  return ctx;
}

export function PhoneAuthProvider({ children }: { children: ReactNode }) {
  const [identity, setIdentity] = useState<Identity | undefined>(undefined);
  const [phone, setPhone] = useState<string | undefined>(undefined);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const savedPhone = localStorage.getItem(SESSION_KEY);
    if (savedPhone) {
      const storedKey = localStorage.getItem(KEY_PREFIX + savedPhone);
      if (storedKey) {
        try {
          const id = Ed25519KeyIdentity.fromJSON(storedKey);
          setIdentity(id);
          setPhone(savedPhone);
        } catch {
          localStorage.removeItem(SESSION_KEY);
          localStorage.removeItem(KEY_PREFIX + savedPhone);
        }
      }
    }
    setIsInitializing(false);
  }, []);

  const login = useCallback((phoneNumber: string) => {
    let id: Ed25519KeyIdentity;
    const storedKey = localStorage.getItem(KEY_PREFIX + phoneNumber);
    if (storedKey) {
      try {
        id = Ed25519KeyIdentity.fromJSON(storedKey);
      } catch {
        id = Ed25519KeyIdentity.generate();
        localStorage.setItem(
          KEY_PREFIX + phoneNumber,
          JSON.stringify(id.toJSON()),
        );
      }
    } else {
      id = Ed25519KeyIdentity.generate();
      localStorage.setItem(
        KEY_PREFIX + phoneNumber,
        JSON.stringify(id.toJSON()),
      );
    }
    localStorage.setItem(SESSION_KEY, phoneNumber);
    setIdentity(id);
    setPhone(phoneNumber);
  }, []);

  const logout = useCallback(() => {
    const currentPhone = localStorage.getItem(SESSION_KEY);
    if (currentPhone) localStorage.removeItem(SESSION_KEY);
    setIdentity(undefined);
    setPhone(undefined);
  }, []);

  const value = useMemo<PhoneAuthContext>(
    () => ({ identity, phone, login, logout, isInitializing }),
    [identity, phone, login, logout, isInitializing],
  );

  return createElement(PhoneAuthReactContext.Provider, { value, children });
}
