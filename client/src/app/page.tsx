"use client";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useWebSocket } from "react-use-websocket/dist/lib/use-websocket";

export default function Home() {
  return <Chat></Chat>;
}

function Chat() {
  const [message, setMessage] = useState<string[]>([]);
  const { lastMessage, sendMessage, readyState } = useWebSocket(
    "wss://localhost:8000/socket"
  );

  return (
    <div>
      <div>
        <h1>Messages</h1>
        <Button>Click me to send hello</Button>
      </div>
      {message}
    </div>
  );
}
