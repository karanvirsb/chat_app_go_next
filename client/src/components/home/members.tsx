"use client";
import { useWebSocketContext } from "@/context/WebSocketContext";
import React, { useEffect, useState } from "react";

type Users = Array<{ username: string; id: string }>;

// type ReturnData<T> =
//   | {
//       success: true;
//       data: T;
//     }
//   | { success: false; error: unknown };

// async function getUsers(): Promise<ReturnData<Users>> {
//   const res = await fetch("http://localhost:8000/users");

//   if (!res.ok) {
//     return { success: false, error: "Failed to fetch users" };
//   }

//   return { success: true, data: (await res.json()) as Users };
// }

export function Members() {
  // fetch members from server
  // const users = getUsers();
  // listen to events on updating the members
  const [users, setUsers] = useState<Users>([]);
  const websocketHook = useWebSocketContext();

  useEffect(() => {
    if (websocketHook === null) return;

    const websocket = websocketHook.websocketHook.getWebSocket();

    if (websocket === null) return;

    websocket.addEventListener("message", (e) => {
      const jsonMessage = JSON.parse(JSON.parse((e as any).data));
      console.log(jsonMessage);

      if (jsonMessage.eventName === "connected_users") {
        setUsers(jsonMessage.data.users);
      }
    });
  }, [websocketHook?.websocketHook.getWebSocket()]);

  if (websocketHook?.websocketHook === null) {
    return <div>Loading...</div>;
  }

  return (
    <div className="px-2 bg-brand">
      <h1 className="text-[26px] font-semibold text-center">Online Users</h1>
      {users?.map((user) => {
        if (user.id.length !== 0) {
          return (
            <div
              className="rounded-md px-2 py-1 flex justify-center items-center gap-4"
              key={user.id}
            >
              {user.username}
              <span className="w-4 h-4 bg-green-400 rounded-full"></span>
            </div>
          );
        }
      })}
    </div>
  );
}
