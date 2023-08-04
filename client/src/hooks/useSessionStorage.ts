import React, { useEffect, useState } from "react";

interface ISessionStorage {
  username: string;
}

export default function useSessionStorage() {
  const [storage, setStorage] = useState<ISessionStorage | null>(null);

  useEffect(() => {
    const userSessionStorage = sessionStorage.getItem("go_chat_session");

    if (!userSessionStorage) {
      sessionStorage.setItem(
        "go_chat_session",
        JSON.stringify({ username: "" } satisfies ISessionStorage)
      );
      return;
    }

    setStorage(JSON.parse(userSessionStorage));
  }, []);

  function getUserSession() {
    const session = sessionStorage.getItem("go_chat_session");
    return session ? JSON.parse(session) : null;
  }

  function updateStorage(items: ISessionStorage) {
    sessionStorage.setItem("go_chat_session", JSON.stringify(items));
    const session = sessionStorage.getItem("go_chat_session");
    if (session) {
      setStorage(JSON.parse(session));
    }
  }

  return { getUserSession, updateStorage } as const;
}
