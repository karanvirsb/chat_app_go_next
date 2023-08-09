"use client";

import { useState, useRef, useEffect } from "react";
import { JsonValue, WebSocketHook } from "react-use-websocket/dist/lib/types";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { useToast } from "../ui/use-toast";
import { ToastClose } from "../ui/toast";
import useSessionStorage from "@/hooks/useSessionStorage";
import { useWebSocketContext } from "@/context/WebSocketContext";

export interface Message<T> {
  data?: T;
  room?: string;
  eventName?: string;
}

type UserSentMessage = {
  text: string;
  username: string;
};

export interface MessageHistory {
  [key: string]: Message<unknown>[];
}

export function Chat() {
  const websocketHook = useWebSocketContext();
  const { storage: session } = useSessionStorage();
  const [room, setRoom] = useState("1");
  const [messageHistory, setMessageHistory] = useState<MessageHistory>({});
  const { toast } = useToast();
  const message = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (websocketHook === null) return;
    const { readyState, lastJsonMessage } = websocketHook.websocketHook;
    if (readyState !== 1) return;
    if (lastJsonMessage === null) return;
    try {
      const jsonMessage = JSON.parse(lastJsonMessage as any);

      console.log(
        `Last Json Message ${new Date().toLocaleDateString()} ${new Date().toTimeString()}`,
        jsonMessage,
        typeof jsonMessage
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
      // type guard
      setMessageHistory((prev) => {
        let prevRoom = prev[room] ?? [];
        prevRoom.push(jsonMessage as Message<any>);
        return {
          ...prev,
          [room]: prevRoom,
        };
      });
    } catch (error) {
      console.error(error);
    }
  }, [websocketHook, room, toast]);

  if (websocketHook === null) return <div>Loading...</div>;

  const { sendJsonMessage } = websocketHook.websocketHook;

  return (
    <div className="h-full flex flex-col gap-4 py-2">
      <section className="flex-grow bg-slate-400">
        {messageHistory[room]?.map((msg, index) => {
          if (isMessage(msg)) {
            return (
              <div key={index}>
                <div>
                  <span>{msg?.data?.username}</span>
                  <span>{`${new Date().toLocaleDateString()} | ${new Date().toLocaleTimeString()}`}</span>
                </div>
                <p>{msg.data?.text}</p>
              </div>
            );
          }
        })}
      </section>
      <div className="flex items-center gap-4">
        <Textarea ref={message}></Textarea>
        <Button
          type="button"
          onClick={() => {
            if (!message.current) return;
            if (message.current.value.length < 3)
              alert("Message needs to be at least 3 characters long!");
            sendJsonMessage({
              data: {
                text: message.current.value,
                username: session?.username as string,
              },
              eventName: "send_message_to_room",
              room: room,
            } satisfies Message<{ text: string; username: string }>);
            message.current.value = "";
          }}
        >
          Send Message
        </Button>
      </div>
    </div>
  );
  function isMessage(data: unknown): data is Message<UserSentMessage> {
    const typedData = data as Message<UserSentMessage>;
    return (
      typedData.data !== undefined &&
      typedData.data.text !== undefined &&
      typedData.data.username !== undefined
    );
  }
}
