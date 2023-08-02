"use client";
import React, { createContext, useContext, useState } from "react";

interface IAuthContext {
  username: string;
  updateUsername: (name: string) => void;
}

export const AuthContext = createContext<IAuthContext>({
  username: "",
  updateUsername: () => {},
});

export function AuthContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [username, setUsername] = useState<string>("");
  return (
    <AuthContext.Provider value={{ username, updateUsername }}>
      {children}
    </AuthContext.Provider>
  );

  function updateUsername(name: string) {
    setUsername(name);
  }
}

export function useAuthContext() {
  return useContext(AuthContext);
}
