"use client";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useWebSocket } from "react-use-websocket/dist/lib/use-websocket";

export default function Home() {
  return <Chat></Chat>;
}

function Chat() {
  const [messageHistory, setMessageHistory] = useState<string[]>([]);
  const { lastMessage, sendMessage, readyState } = useWebSocket(
    "ws://localhost:8000/socket"
  );
  useEffect(() => {
    if (readyState !== 1) return;
    if (lastMessage === null) return;

    if (typeof lastMessage !== "string") return;
    setMessageHistory((prev) => prev.concat(lastMessage));
  }, [lastMessage, readyState]);
  return (
    <div>
      <div>
        <h1>Messages</h1>
        <Button>Click me to send hello</Button>
      </div>
      {messageHistory}
    </div>
  );
}
