"use client";

import { ReactNode } from "react";
import { AuthProvider } from "./authContext";

export function Providers({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
