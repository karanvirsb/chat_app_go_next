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
import { ToastClose } from "@/components/ui/toast";
import { useToast } from "@/components/ui/use-toast";
import { useEffect, useReducer, useRef, useState } from "react";
import { JsonValue, WebSocketHook } from "react-use-websocket/dist/lib/types";
import { useWebSocket } from "react-use-websocket/dist/lib/use-websocket";

interface Message<T> {
  data?: T;
  room?: string;
  eventName?: string;
}

interface MessageHistory {
  [key: string]: Message<unknown>[];
}

const rooms = ["1", "2", "3"];
export default function Home() {
  const websocketHook = useWebSocket(`ws://localhost:8000/socket`);

  useEffect(() => {
    if (websocketHook.readyState !== 1) return;
    rooms.forEach((room) => {
      websocketHook.sendJsonMessage({
        eventName: "join_room",
        room,
      } satisfies Message<any>);
    });
  }, [websocketHook.readyState, websocketHook.sendJsonMessage]);

  return <Chat websocketHook={websocketHook}></Chat>;
}

function Chat({
  websocketHook,
}: {
  websocketHook: WebSocketHook<JsonValue | null, MessageEvent<any> | null>;
}) {
  const { lastJsonMessage, readyState, sendJsonMessage } = websocketHook;
  const [room, setRoom] = useState("1");
  const [messageHistory, setMessageHistory] = useState<MessageHistory>({});
  const { toast } = useToast();
  const message = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (readyState !== 1) return;
    if (lastJsonMessage === null) return;
    const jsonMessage = lastJsonMessage as Message<any>;

    console.log(
      `Last Json Message ${new Date().toLocaleDateString()}`,
      jsonMessage
    );
    if (jsonMessage.room && jsonMessage.room !== room) {
      // set notification for that room
      toast({
        title: "You got a message!",
        duration: 30000,
        action: <ToastClose />,
        description: `You got a message from room {${jsonMessage.room}}`,
      });
    }
    if (!jsonMessage?.room?.includes(room)) return;

    setMessageHistory((prev) => {
      let prevRoom = prev[room] ?? [];
      prevRoom.push(lastJsonMessage as Message<any>);
      return {
        ...prev,
        [room]: prevRoom,
      };
    });
  }, [lastJsonMessage, readyState, room, toast]);
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
            if (message.current.value.length < 3)
              alert("Message needs to be at least 3 characters long!");
            sendJsonMessage({
              data: message.current.value,
              eventName: "send_message_to_room",
              room: room,
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
