import React from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid place-content-center min-h-screen bg-gray-200">
      {children}
    </div>
  );
}
