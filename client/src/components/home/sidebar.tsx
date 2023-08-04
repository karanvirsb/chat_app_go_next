import { rooms } from "@/app/page";
import React, { useState } from "react";
import { Button } from "../ui/button";

export function Sidebar() {
  const [activeRoom, setActiveRoom] = useState("1");
  return (
    <div className="px-2">
      <h1 className="text-[32px] font-semibold text-center">Go Chat</h1>
      <div className="flex flex-col gap-4 mt-4">
        {rooms.map((room) => {
          return (
            <Button
              key={room}
              variant="link"
              className={activeRoom === room ? "bg-blue-400" : ""}
              onClick={() => {
                setActiveRoom(room);
              }}
            >
              Room {room}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
