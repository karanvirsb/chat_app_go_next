import { rooms } from "@/app/page";
import React, { useState } from "react";
import { Button } from "../ui/button";

export function Sidebar() {
  const [activeRoom, setActiveRoom] = useState("1");
  return (
    <div>
      <h1>Go Chat</h1>
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
            {room}
          </Button>
        );
      })}
    </div>
  );
}
