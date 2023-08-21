import { useAuthContext } from "./AuthContext";
import { emitEvents } from "@/handlers/socketMessageHandler";
import { useChatStore } from "@/store/GoChatStore";
import { Message } from "@/types/messages/messageTypes";
import { useRouter } from "next/navigation";
import React, { createContext, useContext, useEffect, useMemo } from "react";
import { JsonValue, WebSocketHook } from "react-use-websocket/dist/lib/types";
import { useWebSocket } from "react-use-websocket/dist/lib/use-websocket";

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
  const {
    getWebSocket,
    lastJsonMessage,
    sendJsonMessage,
    readyState,
    lastMessage,
    sendMessage,
  } = useWebSocket("ws://localhost:8000/socket");
  const rooms = useChatStore((state) => state.rooms);
  const roomNames = useMemo(() => rooms.map((room) => room.name), [rooms]);
  useEffect(() => {
    if (!session || (session && session.username.length == 0)) {
      router.replace("/auth");
    }
  }, [session, router]);

  useEffect(() => {
    const websocket = getWebSocket();
    if (websocket != null) {
      websocket.addEventListener("error", (ev) => {
        console.log("Websocket Error: ", ev);
      });
    }
  }, [getWebSocket]);

  useEffect(() => {
    if (!session || !session?.username || session.username.length < 3) return;

    sendJsonMessage({
      eventName: "join_room",
      data: {
        username: session.username,
        rooms: roomNames,
      },
    } satisfies Message);
  }, [session, sendJsonMessage]);

  useEffect(() => {
    if (lastJsonMessage === null) return;
    const jsonMessage = JSON.parse(lastJsonMessage as any) as Message;
    emitEvents(jsonMessage);
  }, [lastJsonMessage]);

  const websocketHook = {
    lastJsonMessage,
    readyState,
    sendJsonMessage,
    getWebSocket,
    lastMessage,
    sendMessage,
  };

  return (
    <WebSocketContext.Provider value={{ websocketHook }}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocketContext() {
  return useContext(WebSocketContext);
}
