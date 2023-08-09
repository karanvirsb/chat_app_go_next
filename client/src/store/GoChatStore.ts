import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { IRoomSlice, createRoomSlice } from "./room/RoomStore";

export const useChatStore = create<IRoomSlice>()(
  devtools((...a) => ({
    ...createRoomSlice(...a),
  }))
);
