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
    <main
      className={`flex min-h-screen gap-4 ${!menuOpen && "pl-2"} ${
        !usersOpen && "pr-2"
      }`}
    >
      {menuOpen ? (
        <Sidebar toggleMenu={toggleMenu} menuOpen={menuOpen}></Sidebar>
      ) : null}
      <div className="flex flex-grow flex-col">
        <Topbar
          menuOpen={menuOpen}
          usersOpen={usersOpen}
          toggleMenu={toggleMenu}
          toggleUsers={toggleUsers}
        />
        <Chat></Chat>
      </div>
      {usersOpen ? (
        <Members toggleUsers={toggleUsers} usersOpen={usersOpen}></Members>
      ) : null}
    </main>
  );

  function toggleMenu() {
    setMenuOpen((prev) => !prev);
  }
  function toggleUsers() {
    setUsersOpen((prev) => !prev);
  }
}
