"use client";

import { useState } from "react";
import { useAuth } from "@/shared/provider/authContext";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { User } from "lucide-react";
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
    <nav className="bg-slate-900 shadow-md border-b border-slate-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-end h-16">
          <div className="flex items-center">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="relative p-2 rounded-full bg-slate-800 hover:bg-slate-700 transition-colors duration-200 text-slate-300 hover:text-white border border-slate-600"
                >
                  <User className="h-7 w-7" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 bg-slate-900 border-slate-700 shadow-lg p-4" align="end">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-slate-300" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-slate-400 text-sm font-medium truncate">Email</p>
                      <p className="text-slate-200 text-sm truncate">{user.email}</p>
                    </div>
                  </div>
                  <Button
                    onClick={signOut}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 rounded transition-colors duration-200"
                  >
                    Logout
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>
    </nav>
  );
}
