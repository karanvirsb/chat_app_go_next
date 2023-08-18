"use client";
import React from "react";
import { Button } from "../ui/button";
import { useChatStore } from "@/store/GoChatStore";
import { useAuthContext } from "@/context/AuthContext";

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
    <div className="px-2 bg-brand flex flex-col lg:w-[300px] md:w-[250px] sm:fixed sm:inset-0 md:relative">
      <div className="flex justify-center items-center gap-4">
        <h1 className="text-[32px] font-semibold text-center">Go Chat</h1>
        {menuOpen ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6 md:hidden sm:block"
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
        className="mt-auto mb-2"
      >
        Logout
      </Button>
    </div>
  );
}
