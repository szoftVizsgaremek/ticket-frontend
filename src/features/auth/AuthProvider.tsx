import { useEffect, useState, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { AuthContext } from "./auth-context";
import {
  fetchCurrentUser,
  login as loginRequest,
  logout as logoutRequest,
} from "./auth.api";
import type { LoginRequest, User } from "./auth.types";

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const queryClient = useQueryClient();

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

    // Returned so callers can route on the role without waiting for a re-render.
    return currentUser;
  }

  async function logout() {
    await logoutRequest();

    // Drop cached data from the previous account, otherwise the next person to
    // sign in on this browser could briefly render it.
    queryClient.clear();

    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}