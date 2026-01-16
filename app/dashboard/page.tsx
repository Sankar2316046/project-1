"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLogout } from "../(auth)/_query/auth";
import { useAuth } from "@/shared/provider/authContext";
import { Button } from "@/components/ui/button";
import BackgroundPattern from "@/components/BackgroundPattern";

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
    <main className="relative min-h-screen bg-gradient-to-br bg-blue-500 flex flex-col items-center justify-center text-white overflow-hidden">
      <BackgroundPattern />
      <div className="relative z-10 flex flex-col items-center">
        <h1 className="text-2xl md:text-4xl font-bold mb-8 text-center">Welcome to cognify</h1>
        <Button onClick={() => router.push('/form')} className="mb-4">Take test</Button>
        <Button onClick={() => logout.mutate()}>Logout</Button>
      </div>
    </main>
  );
}
