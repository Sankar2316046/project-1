"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLogout } from "../(auth)/_query/auth";
import { useAuth } from "@/shared/provider/authContext";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const logout = useLogout();
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  return (
    <main style={{ padding: 24 }}>
      <h1>Dashboard</h1>
      <p>This is a dummy dashboard page.</p>
      <Button onClick={() => logout.mutate()}>Logout</Button>
    </main>
  );
}
