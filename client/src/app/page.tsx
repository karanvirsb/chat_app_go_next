import { Chat } from "@/components/home/chat";
import { Members } from "@/components/home/members";
import { Sidebar } from "@/components/home/sidebar";
import Topbar from "@/components/home/topbar";

export default function Home() {
  return (
    <main className="grid sm:grid-cols-1 md:grid-cols-[1fr_4fr_1fr] gap-4 min-h-screen">
      <Sidebar></Sidebar>
      <div className="flex flex-col">
        <Topbar />
        <Chat></Chat>
      </div>
      <Members></Members>
    </main>
  );
}
