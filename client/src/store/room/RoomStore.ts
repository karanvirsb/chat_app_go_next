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
  setNotification: (room: string, shouldNotify: boolean) => void;
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
      rooms: state.rooms.map((r) => {
        if (r.name === room) {
          return { ...r, visible: true };
        } else {
          return { ...r, visible: false };
        }
      }),
    })),
  setNotification: (room, shouldNotify) =>
    set((state) => ({
      rooms: state.rooms.map((r) =>
        r.name === room ? { ...r, notifications: shouldNotify } : r
      ),
    })),
});
