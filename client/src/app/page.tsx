"use client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { time, timeLog } from "console";
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
  const [messageHistory, setMessageHistory] = useState<Message<unknown>[]>([]);
  const message = useRef<HTMLTextAreaElement | null>(null);
  const { lastJsonMessage, sendMessage, readyState, getWebSocket } =
    useWebSocket("ws://localhost:8000/socket");
  useEffect(() => {
    if (readyState !== 1) return;
    if (lastJsonMessage === null) return;
    timeLog("Last Json Message", lastJsonMessage);
    setMessageHistory((prev) =>
      prev.concat(lastJsonMessage as Message<unknown>)
    );
  }, [lastJsonMessage, readyState]);
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
          return <div key={index}>{JSON.stringify(msg)}</div>;
        })}
      </section>
    </div>
  );
}
