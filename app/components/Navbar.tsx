"use client";

import { useState } from "react";
import { useAuth } from "@/shared/provider/authContext";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { User, BookOpen, Settings, LogOut } from "lucide-react";
import { authService } from "@/shared/services/auth.service";
import { useRouter } from "next/navigation";

export function Navbar() {
  const { user } = useAuth();
  const router = useRouter();

  if (!user) return null;

  function signOut() {
    authService.logout();
    router.push('/login');
  }

  return (
    <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-xl shadow-lg">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl text-white">AI Exam Platform</h1>
              <p className="text-sm text-slate-400">Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-white">{user?.email}</p>
              <p className="text-sm text-slate-400">User</p>
            </div>
        
            <button
              onClick={signOut}
              className="p-2 text-red-400 hover:text-red-300 transition-colors"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
