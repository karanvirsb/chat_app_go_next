import { useRouter } from "next/navigation";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { JsonValue, WebSocketHook } from "react-use-websocket/dist/lib/types";
import { useWebSocket } from "react-use-websocket/dist/lib/use-websocket";
import { useAuthContext } from "./AuthContext";
import { Message } from "@/types/messages/messageTypes";
import { useChatStore } from "@/store/GoChatStore";
import eventEmitter from "@/lib/eventEmitter";

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
  const websocketHook = useWebSocket("ws://localhost:8000/socket");
  const rooms = useChatStore((state) => state.rooms);
  const roomNames = useCallback(() => rooms.map((room) => room.name), [rooms]);
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
      data: {
        username: session.username,
        rooms: roomNames(),
      },
    } satisfies Message);
  }, [websocketHook.sendJsonMessage, session, rooms]);

  useEffect(() => {
    const { lastJsonMessage } = websocketHook;

    if (lastJsonMessage === null) return;
    const jsonMessage = JSON.parse(lastJsonMessage as any) as Message;
    if (jsonMessage.eventName === "connected_users") {
      eventEmitter.emit("members", jsonMessage);
    }
  }, [websocketHook.lastJsonMessage]);

  return (
    <WebSocketContext.Provider value={{ websocketHook }}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocketContext() {
  return useContext(WebSocketContext);
}
