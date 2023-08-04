import React from "react";

export function Members() {
  // fetch members from server
  // listen to events on updating the members
  const users: string[] = [];
  return (
    <div>
      <h1>Online Users</h1>
      {users.map((user) => {
        return <div key={user}>{user}</div>;
      })}
    </div>
  );
}
