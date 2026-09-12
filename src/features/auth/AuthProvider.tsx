import { useEffect, useState, type ReactNode } from "react";

import { AuthContext } from "./auth-context";
import {
  fetchCurrentUser,
  login as loginRequest,
  logout as logoutRequest,
  register as registerRequest,
} from "./auth.api";
import type { LoginRequest, RegisterRequest, User } from "./auth.types";

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadCurrentUser() {
      const currentUser = await fetchCurrentUser();

      if (active) {
        setUser(currentUser);
        setIsLoading(false);
      }
    }

    loadCurrentUser();

    return () => {
      active = false;
    };
  }, []);

  async function login(credentials: LoginRequest) {
    const currentUser = await loginRequest(credentials);

    setUser(currentUser);
  }

  async function signUp(credentials: RegisterRequest) {
    const currentUser = await registerRequest(credentials);

    setUser(currentUser);
  }

  async function logout() {
    await logoutRequest();

    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        signUp,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}