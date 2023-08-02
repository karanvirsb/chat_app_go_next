"use client";
import React, { createContext, useState } from "react";

interface IAuthContext {
  username: string;
  updateUsername: (name: string) => void;
}

export const AuthContext = createContext<IAuthContext | null>(null);

export default function AuthContextProvier({
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
