"use client";

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { authenticate, demoAuthKey, readDemoSession, saveDemoSession } from "@/lib/auth-client";
import type { CurrentUser, LoginResult, UserRole } from "@/types/auth";
export type { CurrentUser } from "@/types/auth";

export type SessionExitTarget = "/" | "/login?mode=switch" | "/admin/login";

export interface AuthState {
  currentUser: CurrentUser | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  ready: boolean;
  authReady: boolean;
  login: (email: string, password: string, role: UserRole) => Promise<LoginResult>;
  logout: (target?: SessionExitTarget) => void;
  exitTarget: SessionExitTarget | null;
}
const AuthContext = createContext<AuthState | null>(null);
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth requires AuthProvider");
  return context;
}

// DEMO ONLY — Frontend Authentication Prototype, not backend authorization.
export default function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [ready, setReady] = useState(false);
  const [exitTarget, setExitTarget] = useState<SessionExitTarget | null>(null);
  const revision = useRef({ value: 0 });
  useEffect(() => {
    const requests = revision.current;
    let active = true;
    Promise.resolve().then(() => { if (active) { setCurrentUser(readDemoSession()); setReady(true); } });
    const sync = (event: StorageEvent) => {
      if (event.key === demoAuthKey || event.key === null) {
        revision.current.value++;
        setExitTarget(null);
        setCurrentUser(readDemoSession());
      }
    };
    window.addEventListener("storage", sync);
    return () => { active = false; requests.value++; window.removeEventListener("storage", sync); };
  }, []);
  const login = async (email: string, password: string, role: UserRole): Promise<LoginResult> => {
    const request = ++revision.current.value;
    const result = await authenticate(email, password, role);
    if (request !== revision.current.value) return { ok: false, error: "SESSION_CHANGED" };
    if (result.ok) { setExitTarget(null); saveDemoSession(result.user); setCurrentUser(result.user); }
    return result;
  };
  const logout = (target?: SessionExitTarget) => { setExitTarget(target ?? null); revision.current.value++; saveDemoSession(null); setCurrentUser(null); };
  return <AuthContext.Provider value={{ currentUser, role: currentUser?.role ?? null, isAuthenticated: !!currentUser, ready, authReady: ready, login, logout, exitTarget }}>{children}</AuthContext.Provider>;
}
