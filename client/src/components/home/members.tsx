import React from "react";

export function Members() {
  // fetch members from server
  // listen to events on updating the members
  const users: string[] = ["username"];
  return (
    <div className="px-2">
      <h1 className="text-[26px] font-semibold text-center">Online Users</h1>
      {users.map((user) => {
        return (
          <>
            <div
              className="rounded-md px-2 py-1 flex justify-center items-center gap-4"
              key={user}
            >
              {user}
              <span className="w-4 h-4 bg-green-400 rounded-full"></span>
            </div>
          </>
        );
      })}
    </div>
  );
}
