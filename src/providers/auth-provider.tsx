"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { IAuthUser, ISite } from "@/types";

interface AuthContextType {
  user: IAuthUser | null;
  site: ISite | null;
  isLoading: boolean;
  needsOnboarding: boolean;
  login: (email: string, password: string) => Promise<{ needsOnboarding: boolean }>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<IAuthUser | null>(null);
  const [site, setSite] = useState<ISite | null>(null);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const resetAuthState = useCallback(() => {
    setUser(null);
    setSite(null);
    setNeedsOnboarding(false);
  }, []);

  const fetchUser = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me", { credentials: "same-origin" });
      const data = await res.json();
      if (data.success) {
        setUser(data.data);
        setSite(data.data.site || null);
        setNeedsOnboarding(!data.data.site?.onboardingCompleted);
      } else {
        resetAuthState();
      }
    } catch {
      resetAuthState();
    } finally {
      setIsLoading(false);
    }
  }, [resetAuthState]);

  useEffect(() => {
    void fetchUser();
  }, [fetchUser]);

  const login = async (email: string, password: string) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();

    if (!data.success) {
      const error = new Error(data.error || "Login failed");
      error.name = data.code || "LOGIN_FAILED";
      throw error;
    }

    setUser({ ...data.data.user, site: data.data.site || null });
    setSite(data.data.site || null);
    setNeedsOnboarding(!!data.data.needsOnboarding);
    return { needsOnboarding: !!data.data.needsOnboarding };
  };

  const logout = () => {
    resetAuthState();
    fetch("/api/auth/login", { method: "DELETE", credentials: "same-origin" }).catch(() => {});
    window.location.href = "/admin/login";
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        site,
        isLoading,
        needsOnboarding,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
