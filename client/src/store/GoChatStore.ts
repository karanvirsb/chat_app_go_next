import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { IRoomSlice, createRoomSlice } from "./room/RoomStore";
import { IUserStore, createUsersSlice } from "./users/UsersStore";

export const useChatStore = create<IRoomSlice & IUserStore>()(
  devtools((...a) => ({
    ...createRoomSlice(...a),
    ...createUsersSlice(...a),
  }))
);
