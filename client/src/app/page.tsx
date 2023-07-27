"use client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useReducer, useRef, useState } from "react";
import { useWebSocket } from "react-use-websocket/dist/lib/use-websocket";

export default function Home() {
  return <Chat></Chat>;
}

interface Message<T> {
  data?: T;
  room?: string[];
  eventName?: string;
}

function Chat() {
  const [messageHistory, setMessageHistory] = useState<string[]>([]);
  const message = useRef<HTMLTextAreaElement | null>(null);
  const { lastMessage, sendMessage, readyState, getWebSocket } = useWebSocket(
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
        <h1>Send Messages</h1>
        <Textarea ref={message}></Textarea>
        <Button
          onClick={() => {
            if (!message.current) return;
            sendMessage(message?.current?.value);
            message.current.value = "";
          }}
        >
          Send Message
        </Button>
      </div>
      <section>
        <h1>All Messages</h1>

        {messageHistory.map((msg, index) => {
          return <div key={index}>{msg}</div>;
        })}
      </section>
    </div>
  );
}
