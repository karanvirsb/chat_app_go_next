"use client";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

interface MessageHistory {
  [key: string]: Message<unknown>[];
}

function Chat() {
  const [messageHistory, setMessageHistory] = useState<MessageHistory>({});
  const [room, setRoom] = useState("1");
  const message = useRef<HTMLTextAreaElement | null>(null);
  const { lastJsonMessage, sendJsonMessage, readyState, getWebSocket } =
    useWebSocket(`ws://localhost:8000/socket/${room}`);
  useEffect(() => {
    if (readyState !== 1) return;
    if (lastJsonMessage === null || JSON.parse(lastJsonMessage + "") === null)
      return;
    console.log(
      `Last Json Message ${new Date().toLocaleDateString()}`,
      lastJsonMessage
    );
    setMessageHistory((prev) => {
      let prevRoom = prev[room] ?? [];
      prevRoom.push(lastJsonMessage as Message<any>);
      return {
        ...prev,
        [room]: prevRoom,
      };
    });
  }, [lastJsonMessage, readyState, room]);
  return (
    <div>
      <div>
        <div className="flex">
          <h1>Send Messages</h1>
          <Select onValueChange={(val) => setRoom(val)}>
            <SelectTrigger>
              <SelectValue placeholder="Rooms"></SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Room 1</SelectItem>
              <SelectItem value="2">Room 2</SelectItem>
              <SelectItem value="3">Room 3</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Textarea ref={message}></Textarea>
        <Button
          type="button"
          onClick={() => {
            if (!message.current) return;
            if (message.current.value.length < 3) return;
            sendJsonMessage({
              data: message.current.value,
              eventName: "globalMessage",
              room: [room],
            } satisfies Message<string>);
            message.current.value = "";
          }}
        >
          Send Message
        </Button>
      </div>
      <section>
        <h1>All Messages</h1>

        {messageHistory[room]?.map((msg, index) => {
          return <div key={index}>{JSON.stringify(msg)}</div>;
        })}
      </section>
    </div>
  );
}
