import React from "react";

type Users = Array<{ username: string; id: string }>;

type ReturnData<T> =
  | {
      success: true;
      data: T;
    }
  | { success: false; error: unknown };

async function getUsers(): Promise<ReturnData<Users>> {
  const res = await fetch("http://localhost:8000/users");

  if (!res.ok) {
    return { success: false, error: "Failed to fetch users" };
  }

  return { success: true, data: (await res.json()) as Users };
}

export async function Members() {
  // fetch members from server
  const users = await getUsers();
  // listen to events on updating the members

  return (
    <div className="px-2 bg-brand">
      <h1 className="text-[26px] font-semibold text-center">Online Users</h1>
      {!users.success ? (
        <p>{typeof users.error === "string" && users.error}</p>
      ) : (
        users.data.map((user) => {
          return (
            <div
              className="rounded-md px-2 py-1 flex justify-center items-center gap-4"
              key={user.id}
            >
              {user.username}
              <span className="w-4 h-4 bg-green-400 rounded-full"></span>
            </div>
          );
        })
      )}
    </div>
  );
}
