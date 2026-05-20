import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import * as authApi from "@/lib/api/auth";
import { getStoredAuth, setStoredAuth } from "@/lib/api/client";
import type { Role, UserProfile } from "@/lib/api/types";

interface AuthState {
  role: Role | null;
  name: string | null;
  profile: UserProfile | null;
  /** true once the initial auth check (getMe or failure) has completed */
  isReady: boolean;
  login: (username: string, password: string) => Promise<Role>;
  setRole: (r: Role | null) => void;
  logout: () => Promise<void>;
}

const Ctx = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<Role | null>(null);
  const [name, setName] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const stored = getStoredAuth();
    if (!stored) {
      setIsReady(true);
      return;
    }

    // Validate the session with the backend
    let alive = true;
    authApi
      .getMe()
      .then((me) => {
        if (!alive) return;
        const displayName = me.fullName || me.username;
        setProfile(me);
        setRoleState(me.role);
        setName(displayName);
        setStoredAuth({ ...stored, role: me.role, name: displayName });
      })
      .catch(() => {
        if (!alive) return;
        // Token expired / invalid — clear everything
        setStoredAuth(null);
        setRoleState(null);
        setName(null);
        setProfile(null);
      })
      .finally(() => {
        if (alive) setIsReady(true);
      });

    return () => {
      alive = false;
    };
  }, []);

  const clearAuth = () => {
    setRoleState(null);
    setName(null);
    setProfile(null);
    setStoredAuth(null);
  };

  const setRole = (r: Role | null) => {
    if (!r) {
      clearAuth();
      return;
    }

    setRoleState(r);
  };

  const login = async (username: string, password: string) => {
    const auth = await authApi.login(username, password);
    setStoredAuth({ ...auth, name: null });

    const me = await authApi.getMe();
    const displayName = me.fullName || me.username;
    setProfile(me);
    setRoleState(me.role);
    setName(displayName);
    setStoredAuth({ ...auth, role: me.role, name: displayName });
    setIsReady(true);

    return me.role;
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } finally {
      clearAuth();
    }
  };

  return (
    <Ctx.Provider value={{ role, name, profile, isReady, login, setRole, logout }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const v = useContext(Ctx);
  if (!v) throw new Error("AuthProvider missing");
  return v;
}
