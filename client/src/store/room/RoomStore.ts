import { StateCreator } from "zustand";

export interface IRoomSlice {
  initialRoom: number;
  setActiveRoom: (room: number) => void;
}

export const createRoomSlice: StateCreator<IRoomSlice, [], [], IRoomSlice> = (
  set
) => ({
  initialRoom: 1,
  setActiveRoom: (room) => set((state) => ({ initialRoom: room })),
});
