"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { useState } from "react";
import { AuthProvider } from "@/shared/provider/authContext";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <Toaster />
      <AuthProvider>
        {children}
      </AuthProvider>
    </QueryClientProvider>
  );
}
