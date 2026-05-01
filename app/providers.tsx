"use client";

import { SessionProvider } from "next-auth/react";
import AdBlockGate from "./components/AdBlockGate";

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AdBlockGate>{children}</AdBlockGate>
    </SessionProvider>
  );
}
