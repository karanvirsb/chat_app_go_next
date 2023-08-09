import { rooms } from "@/app/page";
import { useRouter } from "next/navigation";
import React, { createContext, useContext, useEffect } from "react";
import { JsonValue, WebSocketHook } from "react-use-websocket/dist/lib/types";
import { useWebSocket } from "react-use-websocket/dist/lib/use-websocket";
import { useAuthContext } from "./AuthContext";
import { Message } from "@/components/home/chat";

export interface IWebSocketContext {
  websocketHook: WebSocketHook<JsonValue | null, MessageEvent<any> | null>;
}

const WebSocketContext = createContext<IWebSocketContext | null>(null);

export function WebSocketContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { session } = useAuthContext();
  const router = useRouter();
  const websocketHook = useWebSocket(`ws://localhost:8000/socket`);

  useEffect(() => {
    console.log(session);
    if (!session || (session && session.username.length == 0)) {
      router.replace("/auth");
    }
  }, [session, router]);

  useEffect(() => {
    const websocket = websocketHook?.getWebSocket();
    if (websocket != null) {
      websocket.addEventListener("error", (ev) => {
        console.log("Websocket Error: ", ev);
      });
    }
  }, [websocketHook]);

  useEffect(() => {
    if (!session || !session?.username || session.username.length < 3) return;
    rooms.forEach((room) => {
      websocketHook?.sendJsonMessage({
        eventName: "join_room",
        data: { username: session?.username },
        room,
      } satisfies Message<any>);
    });
  }, []);

  return (
    <WebSocketContext.Provider value={{ websocketHook }}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocketContext() {
  return useContext(WebSocketContext);
}
