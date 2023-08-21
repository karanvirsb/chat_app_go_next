"use client";

import { Textarea } from "../ui/textarea";
import { useWebSocketContext } from "@/context/WebSocketContext";
import useSessionStorage from "@/hooks/useSessionStorage";
import eventEmitter from "@/lib/eventEmitter";
import { useChatStore } from "@/store/GoChatStore";
import { Room } from "@/store/room/RoomStore";
import { isUserMessage } from "@/types/messages/isUserMessage";
import { Message } from "@/types/messages/messageTypes";
import { useState, useRef, useEffect, useMemo } from "react";

export interface MessageHistory {
  [key: string]: Array<Message | string>;
}

export function Chat() {
  const { websocketHook } = useWebSocketContext();
  const { storage: session } = useSessionStorage();
  const rooms = useChatStore((state) => state.rooms);
  const room = useMemo(() => rooms.find((r) => r.visible) as Room, [rooms]);
  const setNotification = useChatStore((state) => state.setNotification);
  const [messageHistory, setMessageHistory] = useState<MessageHistory>({});

  const message = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    eventEmitter.on("chat", chatHandler);
    function chatHandler(jsonMessage: Message) {
      if (jsonMessage.eventName === "send_message_to_room") {
        setMessageHistory((prev) => {
          let prevRoom = prev[jsonMessage.room] ?? [];
          prevRoom.push(jsonMessage as Message);
          return {
            ...prev,
            [jsonMessage.room]: prevRoom,
          };
        });

        // check if room is visible
        if (jsonMessage.room !== room.name) {
          setNotification(jsonMessage.room as string, true);
        }
      } else if (jsonMessage.eventName === "user_online") {
        setMessageHistory((prev) => {
          let prevRoom = prev[jsonMessage.room] ?? [];
          prevRoom.push(`User - ${jsonMessage.data.username} - has joined.`);
          return {
            ...prev,
            [jsonMessage.room]: prevRoom,
          };
        });
      } else if (jsonMessage.eventName === "user_disconnected") {
        rooms.forEach((room) => {
          setMessageHistory((prev) => {
            let prevRoom = prev[room.name] ?? [];
            prevRoom.push(`User - ${jsonMessage.data.username} - has left.`);
            return {
              ...prev,
              [room.name]: prevRoom,
            };
          });
        });
      }
    }
    return () => {
      eventEmitter.off("chat", chatHandler);
    };
  }, [setMessageHistory, room, setNotification, rooms]);

  const { sendJsonMessage } = websocketHook;

  return (
    <div className="h-full max-h-screen flex flex-col gap-4 py-2 flex-grow">
      <section className="flex-grow overflow-y-auto p-2 outline outline-[1px] outline-gray-200 rounded-md">
        {messageHistory[room.name]?.map((msg, index) => {
          if (isUserMessage(msg) && msg.eventName === "send_message_to_room") {
            const date = new Date(msg?.data?.time ?? Date.now());
            return (
              <div key={index} className="flex flex-col gap-4 my-8">
                <div className="flex gap-6">
                  <span className="text-brand-light-text">
                    {msg?.data?.username}
                  </span>
                  <span className="text-brand-gray">{`${date.toLocaleDateString()} | ${date.toLocaleTimeString()}`}</span>
                </div>
                <p>{msg.data?.text}</p>
              </div>
            );
          } else if (typeof msg === "string") {
            return <div key={`msg-${index}-${room}`}>{msg}</div>;
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
      </div>
    </div>
  );

  function sendMessage() {
    if (!message.current) {
      return;
    }

    if (message.current.value.length < 3) {
      alert("Message needs to be at least 3 characters long!");
      return;
    }
    sendJsonMessage({
      data: {
        text: message.current.value,
        username: session?.username as string,
        time: Date.now(),
      },
      eventName: "send_message_to_room",
      room: room.name,
    } satisfies Message);
    message.current.value = "";
  }
}
