import React from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen place-content-center bg-gray-200">
      {children}
    </div>
  );
}
