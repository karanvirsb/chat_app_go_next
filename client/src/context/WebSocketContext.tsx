import { rooms } from "@/app/page";
import { useRouter } from "next/navigation";
import React, { createContext, useContext, useEffect, useRef } from "react";
import { JsonValue, WebSocketHook } from "react-use-websocket/dist/lib/types";
import { useWebSocket } from "react-use-websocket/dist/lib/use-websocket";
import { useAuthContext } from "./AuthContext";
import { Message } from "@/types/messages/messageTypes";

export interface IWebSocketContext {
  websocketHook: WebSocketHook<JsonValue | null, MessageEvent<any> | null>;
}

const WebSocketContext = createContext<IWebSocketContext>({
  websocketHook: {
    getWebSocket: () => null,
    lastJsonMessage: null,
    lastMessage: null,
    readyState: -1,
    sendJsonMessage: () => null,
    sendMessage: () => null,
  },
});

export interface JoinRoom {
  username: string;
  rooms: string[];
}

export function WebSocketContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { session } = useAuthContext();
  const router = useRouter();
  const websocketHook = useWebSocket(`ws://localhost:8000/socket`);

  useEffect(() => {
    if (!session || (session && session.username.length == 0)) {
      router.replace("/auth");
    }
  }, [session, router]);

  useEffect(() => {
    const websocket = websocketHook.getWebSocket();
    if (websocket != null) {
      websocket.addEventListener("error", (ev) => {
        console.log("Websocket Error: ", ev);
      });
    }
  }, [websocketHook.getWebSocket()]);

  useEffect(() => {
    if (!session || !session?.username || session.username.length < 3) return;

    websocketHook.sendJsonMessage({
      eventName: "join_room",
      data: { username: session.username, rooms },
    } satisfies Message);
  }, [websocketHook.sendJsonMessage, session]);

  return (
    <WebSocketContext.Provider value={{ websocketHook }}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocketContext() {
  return useContext(WebSocketContext);
}
