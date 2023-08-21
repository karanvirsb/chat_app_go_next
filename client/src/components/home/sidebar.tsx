"use client";

import { Button } from "../ui/button";
import { useAuthContext } from "@/context/AuthContext";
import { useChatStore } from "@/store/GoChatStore";
import React from "react";

type Props = {
  menuOpen: boolean;
  toggleMenu: () => void;
};

export function Sidebar({ toggleMenu, menuOpen }: Props) {
  const rooms = useChatStore((state) => state.rooms);
  const setActiveRoom = useChatStore((state) => state.setActiveRoom);
  const setNotification = useChatStore((state) => state.setNotification);
  const { updateSession } = useAuthContext();

  return (
    <div className="flex flex-col bg-brand px-2 sm:fixed sm:inset-0 md:relative md:w-[250px] lg:w-[300px]">
      <div className="flex items-center justify-center gap-4">
        <h1 className="text-center text-[32px] font-semibold">Go Chat</h1>
        {menuOpen ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="h-6 w-6 sm:block md:hidden"
            onClick={toggleMenu}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        ) : null}
      </div>
      <div className="mt-4 flex flex-col gap-4">
        {rooms.map((room) => {
          return (
            <Button
              key={room.name}
              variant="link"
              className={` relative ${
                room.visible ? "bg-hover" : "hover:bg-hover"
              } ${
                room.notifications &&
                "outline outline-1 outline-gray-400 after:absolute after:-right-1 after:-top-1 after:block after:h-4 after:w-4 after:rounded-full after:bg-red-400"
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
        className="mb-2 mt-auto"
      >
        Logout
      </Button>
    </div>
  );
}
