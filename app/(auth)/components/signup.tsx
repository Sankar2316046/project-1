"use client";
import React, { useState } from "react";
import { useSignUpWithEmailAndPassword } from "../_query/auth"; // 👈 you’ll need to create this
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
import Link from "next/link";

const SignupPage = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const router = useRouter();
  const signUpWithEmailAndPassword = useSignUpWithEmailAndPassword();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email || !password || !confirmPassword) {
      toast.error("All fields are required");
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
      toast.error("Password must be at least 6 characters");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    toast.dismiss();

    signUpWithEmailAndPassword.mutate(
      { email, password },
      {
        onSuccess: () => {
          toast.success("Signup successful");
          router.push("/");
        },
        onError: () => {
          toast.error("Signup failed");
        },
      }
    );
  };

  return (
    <div className={cn("flex flex-col gap-6")}>
      <Card className="w-full max-w-md mx-auto mt-10 bg-slate-900 border-slate-700">
        <CardHeader>
          <CardTitle className="text-slate-200">Create an account</CardTitle>
          <CardDescription className="text-slate-400">
            Enter your email below to create a new account
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
                  placeholder="m@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-slate-800 border-slate-700 focus:border-slate-500 text-slate-200"
                />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="password" className="text-slate-300">Password</Label>
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
              <div className="grid gap-3">
                <Label htmlFor="confirmPassword" className="text-slate-300">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  required
                  value={confirmPassword}
                  placeholder="Enter the password again"
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="bg-slate-800 border-slate-700 focus:border-slate-500 text-slate-200"
                />
              </div>
              <div className="flex flex-col gap-3">
                <Button type="submit" className="w-full bg-slate-700 hover:bg-slate-600 text-slate-200">
                  Sign Up
                </Button>
                <p className="text-center text-slate-400">
                  Have an account?{" "}
                  <Link href="/login" className="text-slate-300 hover:text-slate-200 underline">
                    Login
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

export default SignupPage;
