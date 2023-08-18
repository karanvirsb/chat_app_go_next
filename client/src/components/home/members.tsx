"use client";
import eventEmitter from "@/lib/eventEmitter";
import { useChatStore } from "@/store/GoChatStore";
import { Message } from "@/types/messages/messageTypes";
import React, { useEffect } from "react";

export function Members() {
  const users = useChatStore((state) => state.users);
  const setUsers = useChatStore((state) => state.setUsers);

  useEffect(() => {
    eventEmitter.on("members", (jsonMessage: Message) => {
      if (jsonMessage.eventName === "connected_users") {
        setUsers(jsonMessage.data.users);
      } else if (jsonMessage.eventName === "user_disconnected") {
        const newUsers = users.filter(
          (user) => user.id !== jsonMessage.data.id
        );

        setUsers(newUsers);
      } else if (jsonMessage.eventName === "user_connected") {
        const newUsers = [
          ...users,
          { id: jsonMessage.data.id, username: jsonMessage.data.username },
        ];

        setUsers(newUsers);
      }
    });
  }, [setUsers, users]);

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
