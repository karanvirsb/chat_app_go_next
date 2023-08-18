"use client";
import eventEmitter from "@/lib/eventEmitter";
import { useChatStore } from "@/store/GoChatStore";
import { Message } from "@/types/messages/messageTypes";
import React, { useEffect } from "react";

type Props = {
  usersOpen: boolean;
  toggleUsers: () => void;
};

export function Members({ toggleUsers, usersOpen }: Props) {
  const users = useChatStore((state) => state.users);
  const setUsers = useChatStore((state) => state.setUsers);

  useEffect(() => {
    eventEmitter.on("members", membersHandler);

    function membersHandler(jsonMessage: Message) {
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
    }

    return () => {
      // eventEmitter.off("members", membersHandler);
    };
  }, [setUsers, users]);

  return (
    <div className="px-2 bg-brand lg:w-[300px] md:w-[250px] sm:fixed sm:inset-0 md:relative">
      <div className="flex justify-center items-center gap-4">
        <h1 className="text-[26px] font-semibold">Online Users</h1>
        {usersOpen ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6 md:hidden sm:block"
            onClick={toggleUsers}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        ) : null}
      </div>
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
