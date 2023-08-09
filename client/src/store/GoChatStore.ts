import { create } from "zustand";
import { devtools } from "zustand/middleware";

export const useChatStore = create(devtools((a) => ({})));
