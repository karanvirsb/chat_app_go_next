"use client";
import eventEmitter from "@/lib/eventEmitter";
import { useChatStore } from "@/store/GoChatStore";
import { Message } from "@/types/messages/messageTypes";
import React, { useEffect } from "react";

export function Members() {
  const users = useChatStore((state) => state.users);
  const setUsers = useChatStore((state) => state.setUsers);

  // useEffect(() => {
  //   if (websocketHook === null) return;

  //   const websocket = websocketHook.getWebSocket();

  //   if (websocket === null) return;
  //   websocket.addEventListener("message", listener);

  //   function listener(e: any) {
  //     const jsonMessage = JSON.parse(JSON.parse((e as any).data));
  //     // console.log(jsonMessage.eventName);
  //     if (!isMessage(jsonMessage)) return;

  //     if (jsonMessage.eventName === "connected_users") {
  //       // setUsers((prev) => [...prev, ...jsonMessage.data.users]);
  //     } else if (jsonMessage.eventName === "user_disconnected") {
  //       setUsers((prev) => {
  //         const newUsers = prev.filter(
  //           (user) => user.id !== jsonMessage.data.id
  //         );
  //         return newUsers;
  //       });
  //     } else if (jsonMessage.eventName === "user_connected") {
  //       setUsers((prev) => {
  //         return [
  //           ...prev,
  //           { id: jsonMessage.data.id, username: jsonMessage.data.username },
  //         ];
  //       });
  //     }
  //   }

  //   return () => {
  //     websocket.removeEventListener("message", listener);
  //   };
  // }, [websocketHook.getWebSocket()]);
  useEffect(() => {
    console.log(users);
  }, [users]);

  useEffect(() => {
    eventEmitter.on("members", (data: Message) => {
      if (data.eventName === "connected_users") {
        console.log("setting data", data.data.users);
        setUsers(data.data.users);
      }
    });
  }, [setUsers]);

  return (
    <div className="px-2 bg-brand">
      <h1 className="text-[26px] font-semibold text-center">Online Users</h1>
      {users?.map((user) => {
        if (user.id.length !== 0) {
          return (
            <div
              className="rounded-md px-2 py-1 flex justify-center items-center gap-4"
              key={user.id}
            >
              {user.username}
              <span className="w-4 h-4 bg-green-400 rounded-full"></span>
            </div>
          );
        }
      })}
    </div>
  );
}
