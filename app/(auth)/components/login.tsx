"use client";
import React, { useState, useEffect } from "react";
import { useLoginWithEmailAndPassword } from "../_query/auth";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useAuth } from "@/shared/provider/authContext";
import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles, GraduationCap } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const router =  useRouter();
  const loginWithEmailAndPassword = useLoginWithEmailAndPassword();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      router.push('/');
    }
  }, [user, router]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Please enter email and password");
      return;
    }

    const emailSchema = z.string().email();
    const passwordSchema = z.string().min(6);

    const emailResult = emailSchema.safeParse(email);
    const passwordResult = passwordSchema.safeParse(password);

    if (!emailResult.success) {
      toast.error("Invalid email");
      return;
    }

    if (!passwordResult.success) {
      toast.error("Invalid password");
      return;
    }

    toast.dismiss();

    loginWithEmailAndPassword.mutate(
      { email, password },
      {
        onSuccess: () => {
          router.push('/')
        },
        onError: () => {
          toast.error("Login failed");
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-2xl mb-4 shadow-lg shadow-indigo-500/50">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl text-white mb-2">AI Exam Platform</h1>
          <p className="text-slate-400">Login Portal - Intelligent Assessment System</p>
        </div>

        {/* Login Card */}
        <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-indigo-600/20 rounded-lg">
                <GraduationCap className="w-6 h-6 text-indigo-400" />
              </div>
              <h2 className="text-2xl text-white">Login</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-slate-800 border-slate-700 focus:border-slate-500 text-slate-200"
                />
              </div>
              
              <div>
                <Label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">Password</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  placeholder="Enter the password"
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-slate-800 border-slate-700 focus:border-slate-500 text-slate-200"
                />
              </div>

              <div className="pt-4">
                <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">
                  Sign In
                </Button>
              </div>

              <div className="text-center">
                <p className="text-slate-400">
                  Don't have an account?{" "}
                  <Link href="/signup" className="text-slate-300 hover:text-slate-200 underline">
                    Sign up
                  </Link>
                </p>
              </div>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-slate-500 text-sm mt-6">
          Powered by AI • Secure • Fair Assessment
        </p>
      </motion.div>
    </div>
  );
};

export default LoginPage;