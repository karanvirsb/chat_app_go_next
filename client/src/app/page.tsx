import { Chat } from "@/components/home/chat";
import { Members } from "@/components/home/members";
import { Sidebar } from "@/components/home/sidebar";

export const rooms = ["1", "2", "3"];

export default function Home() {
  return (
    <main className="grid sm:grid-cols-1 md:grid-cols-[1fr_4fr_1fr] gap-4 min-h-screen">
      <Sidebar></Sidebar>
      <Chat></Chat>
      <Members></Members>
    </main>
  );
}
