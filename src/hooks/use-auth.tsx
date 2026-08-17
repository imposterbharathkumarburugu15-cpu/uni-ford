import React, { createContext, useContext, useState } from "react";

export interface User {
  id: string;
  name?: string;
  email?: string;
  isAnonymous?: boolean;
  role?: string;
}

export interface AuthContextValue {
  isLoading: boolean;
  isAuthenticated: boolean;
  user: User | null;
  signIn: (
    provider: string,
    data?: FormData | { email?: string; code?: string },
  ) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const STORAGE_KEY = "uniforge_auth_user";

function getInitialUser(): User | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    const defaultUser: User = {
      id: "usr_operator_01",
      name: "Lead Forensic Engineer",
      email: "forensics@uniforge.io",
      isAnonymous: false,
      role: "ADMIN",
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultUser));
    return defaultUser;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(getInitialUser);
  const [isLoading, setIsLoading] = useState(false);

  const signIn = async (
    provider: string,
    data?: FormData | { email?: string; code?: string },
  ) => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 300));

    let email = "operator@uniforge.io";
    let isAnon = false;

    if (provider === "anonymous") {
      isAnon = true;
      email = "guest.operator@uniforge.io";
    } else if (data instanceof FormData) {
      email = (data.get("email") as string) || email;
    } else if (data && typeof data === "object" && data.email) {
      email = data.email;
    }

    const newUser: User = {
      id: `usr_${Date.now()}`,
      name: isAnon
        ? "Guest Operator"
        : email.split("@")[0].replace(/\./g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
      email,
      isAnonymous: isAnon,
      role: "OPERATOR",
    };

    setUser(newUser);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
    } catch {
      // Storage unavailable
    }
    setIsLoading(false);
  };

  const signOut = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 200));
    setUser(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Storage unavailable
    }
    setIsLoading(false);
  };

  return (
    <AuthContext.Provider
      value={{
        isLoading,
        isAuthenticated: !!user,
        user,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
