"use client";
import useSessionStorage, { ISessionStorage } from "@/hooks/useSessionStorage";
import { useRouter } from "next/navigation";
import React, { createContext, useContext, useEffect } from "react";

interface IAuthContext {
  session: ISessionStorage | null;
  updateSession: (session: ISessionStorage) => void;
}

export const AuthContext = createContext<IAuthContext>({
  session: null,
  updateSession: () => {},
});

export function AuthContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { storage: session, updateStorage: updateSession } =
    useSessionStorage();
  const router = useRouter();

  useEffect(() => {
    if (!session || (session && session.username.length == 0)) {
      router.replace("/auth");
    }
  }, [router, session]);

  return (
    <AuthContext.Provider value={{ session, updateSession }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  return useContext(AuthContext);
}
