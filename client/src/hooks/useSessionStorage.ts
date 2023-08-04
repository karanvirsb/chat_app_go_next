import { useState } from "react";

export interface ISessionStorage {
  username: string;
}

export default function useSessionStorage() {
  const [storage, setStorage] = useState<ISessionStorage | null>(
    sessionStorage.getItem("go_chat_session")
      ? JSON.parse(sessionStorage.getItem("go_chat_session") as string)
      : null
  );

  function updateStorage(items: ISessionStorage) {
    sessionStorage.setItem("go_chat_session", JSON.stringify(items));
    const session = sessionStorage.getItem("go_chat_session");
    if (session) {
      setStorage(JSON.parse(session));
    }
  }

  return { storage, updateStorage } as const;
}
