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
    <div className={cn("flex flex-col gap-6")}>
      <Card className="w-full max-w-md mx-auto mt-10 bg-slate-900 border-slate-700">
        <CardHeader>
          <CardTitle className="text-slate-200">Login to your account</CardTitle>
          <CardDescription className="text-slate-400">
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-3">
                <Label htmlFor="email" className="text-slate-300">Email</Label>
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
              <div className="grid gap-3">
                <div className="flex items-center">
                  <Label htmlFor="password" className="text-slate-300">Password</Label>
                </div>
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
              <div className="flex flex-col gap-3">
                <Button type="submit" className="w-full bg-slate-700 hover:bg-slate-600 text-slate-200">
                  Login
                </Button>
                <p className="text-center text-slate-400">
                  Don't have an account?{" "}
                  <Link href="/signup" className="text-slate-300 hover:text-slate-200 underline">
                    Sign up
                  </Link>
                </p>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage; 