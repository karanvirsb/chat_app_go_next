"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { useToast } from "../ui/use-toast";
import { ToastClose } from "../ui/toast";
import useSessionStorage from "@/hooks/useSessionStorage";
import { useWebSocketContext } from "@/context/WebSocketContext";
import { useChatStore } from "@/store/GoChatStore";

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
  const room = useChatStore((state) => state.initialRoom);

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
    <div className="h-full max-h-screen flex flex-col gap-4 py-2">
      <section className="flex-grow overflow-scroll p-2 outline outline-[1px] outline-gray-200 rounded-md">
        {messageHistory[room]?.map((msg, index) => {
          if (isMessage(msg)) {
            return (
              <div key={index} className="flex flex-col gap-4 my-8">
                <div className="flex gap-6">
                  <span className="text-brand-light-text">
                    {msg?.data?.username}
                  </span>
                  <span className="text-brand-gray">{`${new Date().toLocaleDateString()} | ${new Date().toLocaleTimeString()}`}</span>
                </div>
                <p>{msg.data?.text}</p>
              </div>
            );
          }
        })}
      </section>
      <div className="flex items-center gap-4">
        <Textarea
          ref={message}
          className="bg-hover"
          onKeyUp={(e) => {
            if (e.key === "Enter") {
              sendMessage();
            }
          }}
        ></Textarea>
        <Button type="button" onClick={() => {}}>
          Send Message
        </Button>
      </div>
    </div>
  );

  function sendMessage() {
    if (!message.current) {
      return;
    }
    if (message.current.value.length < 3) {
      alert("Message needs to be at least 3 characters long!");
    }
    sendJsonMessage({
      data: {
        text: message.current.value,
        username: session?.username as string,
      },
      eventName: "send_message_to_room",
      room: room,
    } satisfies Message<{ text: string; username: string }>);
    message.current.value = "";
  }

  function isMessage(data: unknown): data is Message<UserSentMessage> {
    const typedData = data as Message<UserSentMessage>;
    return (
      typedData.data !== undefined &&
      typedData.data.text !== undefined &&
      typedData.data.username !== undefined
    );
  }
}
