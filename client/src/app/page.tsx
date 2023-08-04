"use client";
import { Chat, Message } from "@/components/home/chat";
import { Sidebar } from "@/components/home/sidebar";
import { useAuthContext } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useWebSocket } from "react-use-websocket/dist/lib/use-websocket";

export const rooms = ["1", "2", "3"];
export default function Home() {
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
    if (websocketHook.readyState !== 1) return;
    rooms.forEach((room) => {
      websocketHook.sendJsonMessage({
        eventName: "join_room",
        data: { username: session?.username },
        room,
      } satisfies Message<any>);
    });
  }, [websocketHook.readyState, websocketHook.sendJsonMessage]);

  return (
    <main>
      <Sidebar></Sidebar>
      <Chat websocketHook={websocketHook}></Chat>;
    </main>
  );
}
