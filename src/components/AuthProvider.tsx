"use client";

import { createContext, useContext, type ReactNode } from "react";

export interface CurrentUser {
  id: string;
  email: string;
  role: "USER" | "ADMIN";
}

export interface AuthState {
  currentUser: CurrentUser | null;
  ready: boolean;
  logout: () => void;
}

// Reserved integration boundary. Until a verified account service is connected,
// every visitor is anonymous. Browser storage never establishes an identity.
const anonymousState: AuthState = {
  currentUser: null,
  ready: true,
  logout: () => {},
};
const AuthContext = createContext<AuthState>(anonymousState);
export const useAuth = () => useContext(AuthContext);

export default function AuthProvider({ children }: { children: ReactNode }) {
  return <AuthContext.Provider value={anonymousState}>{children}</AuthContext.Provider>;
}
