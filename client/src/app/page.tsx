"use client";
import { Chat } from "@/components/home/chat";
import { Members } from "@/components/home/members";
import { Sidebar } from "@/components/home/sidebar";
import Topbar from "@/components/home/topbar";
import { useState } from "react";

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(true);
  const [usersOpen, setUsersOpen] = useState(true);
  return (
    <main className="grid sm:grid-cols-1 md:grid-cols-[1fr_4fr_1fr] gap-4 min-h-screen">
      <Sidebar></Sidebar>
      <div className="flex flex-col">
        <Topbar
          menuOpen={menuOpen}
          usersOpen={usersOpen}
          toggleMenu={toggleMenu}
          toggleUsers={toggleUsers}
        />
        <Chat></Chat>
      </div>
      <Members></Members>
    </main>
  );

  function toggleMenu() {
    setMenuOpen((prev) => !prev);
  }
  function toggleUsers() {
    setUsersOpen((prev) => !prev);
  }
}
