"use client";
import React from "react";
import { Button } from "../ui/button";
import { useChatStore } from "@/store/GoChatStore";
import { useAuthContext } from "@/context/AuthContext";

export function Sidebar() {
  const rooms = useChatStore((state) => state.rooms);
  const setActiveRoom = useChatStore((state) => state.setActiveRoom);
  const setNotification = useChatStore((state) => state.setNotification);
  const { updateSession } = useAuthContext();

  return (
    <div className="px-2 bg-brand">
      <h1 className="text-[32px] font-semibold text-center">Go Chat</h1>
      <div className="flex flex-col gap-4 mt-4">
        {rooms.map((room) => {
          return (
            <Button
              key={room.name}
              variant="link"
              className={` relative ${
                room.visible ? "bg-hover" : "hover:bg-hover"
              } ${
                room.notifications &&
                "after:block after:w-4 after:h-4 after:absolute after:-top-1 after:-right-1 after:bg-red-400 after:rounded-full outline outline-1 outline-gray-400"
              }`}
              onClick={() => {
                setActiveRoom(room.name);
                setNotification(room.name, false);
              }}
            >
              Room {room.name}
            </Button>
          );
        })}
      </div>
      <Button
        variant="destructive"
        onClick={() => {
          updateSession({ username: "" });
        }}
      >
        Logout
      </Button>
    </div>
  );
}
