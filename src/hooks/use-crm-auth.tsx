import { useQueryClient } from "@tanstack/react-query";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

import { getMe } from "@/lib/auth.functions";

type AuthUser = {
  userId: string;
  email: string;
  role: "admin" | "user";
  isAdmin: boolean;
};

type AuthValue = {
  session: AuthUser | null;
  userId: string | null;
  email: string | null;
  role: "admin" | "user" | null;
  isAdmin: boolean;
  loading: boolean;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthValue>({
  session: null,
  userId: null,
  email: null,
  role: null,
  isAdmin: false,
  loading: true,
  refresh: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();

  async function refresh() {
    const me = await getMe();
    setSession(me);
    await queryClient.invalidateQueries();
  }

  useEffect(() => {
    getMe()
      .then(setSession)
      .finally(() => setLoading(false));
  }, []);

  return (
    <AuthContext.Provider
      value={{
        session,
        userId: session?.userId ?? null,
        email: session?.email ?? null,
        role: session?.role ?? null,
        isAdmin: session?.isAdmin ?? false,
        loading,
        refresh,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useCrmAuth = () => useContext(AuthContext);
