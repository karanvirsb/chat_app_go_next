import { StateCreator } from "zustand";

// room: string
// visible: boolean
// notifications: boolean

export interface Room {
  name: string;
  visible: boolean;
  notifications: boolean;
}

export interface IRoomSlice {
  rooms: Room[];
  setActiveRoom: (room: string) => void;
}

export const createRoomSlice: StateCreator<IRoomSlice, [], [], IRoomSlice> = (
  set
) => ({
  rooms: [
    { name: "1", notifications: false, visible: true },
    { name: "2", notifications: false, visible: false },
    { name: "3", notifications: false, visible: false },
  ],
  setActiveRoom: (room) =>
    set((state) => ({
      rooms: [
        ...state.rooms,
        { name: room, visible: true, notifications: false },
      ],
    })),
});
