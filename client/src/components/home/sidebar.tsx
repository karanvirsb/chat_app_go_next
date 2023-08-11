"use client";
import { rooms } from "@/app/page";
import React from "react";
import { Button } from "../ui/button";
import { useChatStore } from "@/store/GoChatStore";

export function Sidebar() {
  const rooms = useChatStore((state) => state.rooms);
  const setActiveRoom = useChatStore((state) => state.setActiveRoom);

  return (
    <div className="px-2 bg-brand">
      <h1 className="text-[32px] font-semibold text-center">Go Chat</h1>
      <div className="flex flex-col gap-4 mt-4">
        {rooms.map((room) => {
          return (
            <Button
              key={room.name}
              variant="link"
              className={room.visible ? "bg-hover" : "hover:bg-hover"}
              onClick={() => {
                setActiveRoom(room.name);
              }}
            >
              Room {room.name}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
