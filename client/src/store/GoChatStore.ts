import { IRoomSlice, createRoomSlice } from "./room/RoomStore";
import { IUserStore, createUsersSlice } from "./users/UsersStore";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

export const useChatStore = create<IRoomSlice & IUserStore>()(
  devtools((...a) => ({
    ...createRoomSlice(...a),
    ...createUsersSlice(...a),
  }))
);
