import { Users } from "@/types/messages/messageTypes";
import { StateCreator } from "zustand";

export interface IUserStore {
  users: Users;
  setUsers: (newUsers: Users) => void;
}

export const createUsersSlice: StateCreator<IUserStore, [], [], IUserStore> = (
  set
) => {
  return {
    users: [],
    setUsers: (newUsers) =>
      set((state) => ({
        ...state,
        users: newUsers,
      })),
  };
};
