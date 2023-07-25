"use client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useReducer, useRef, useState } from "react";
import { useWebSocket } from "react-use-websocket/dist/lib/use-websocket";

export default function Home() {
  return <Chat></Chat>;
}

function Chat() {
  const [messageHistory, setMessageHistory] = useState<string[]>([]);
  const message = useRef<string>("");
  const { lastMessage, sendMessage, readyState } = useWebSocket(
    "ws://localhost:8000/socket"
  );
  useEffect(() => {
    if (readyState !== 1) return;
    if (lastMessage === null) return;

    setMessageHistory((prev) => prev.concat(lastMessage.data));
  }, [lastMessage, readyState]);
  return (
    <div>
      <div>
        <h1>Messages</h1>
        <Textarea
          onChange={(e) => (message.current = e.target.value)}
        ></Textarea>
        <Button>Send Message</Button>
      </div>
      {messageHistory}
    </div>
  );
}
