import { authService } from "@/shared/services/auth.service";
import { useMutation, UseMutationResult } from "@tanstack/react-query";
import { toast } from "sonner";

interface LoginCredentials {
  email: string;
  password: string;
}

interface SignUpCredentials {
  email: string;
  password: string;
}

export const useLoginWithEmailAndPassword = (): UseMutationResult<
  any,
  Error,
  LoginCredentials
> => {
  return useMutation({
    mutationFn: ({ email, password }: LoginCredentials) =>
      authService.logInWithEmailAndPassword(email, password),

    onSuccess: () => {
      toast.success("Login successful!");
    },

    onError: (error: Error) => {
      console.error("Login with email and password error:", error);
      toast.error(error.message || "Login failed. Please try again.");
    },
  });
};
export const useSignUpWithEmailAndPassword = (): UseMutationResult<
  any,
  Error,
  SignUpCredentials
> => {
  return useMutation({
    mutationFn: ({ email, password }: SignUpCredentials) =>
      authService.signUpWithEmailAndPassword(email, password),

    onSuccess: () => {
      toast.success("Signup successful! Please check your email for confirmation.");
    },

    onError: (error: Error) => {
      console.error("Signup with email and password error:", error);
      toast.error(error.message || "Signup failed. Please try again.");
    },
  });
};

export const useLogout = (): UseMutationResult<void, Error, void> => {
  return useMutation({
    mutationFn: async () => {
      await authService.logout();
    },
    onSuccess: () => {
      toast.success("Logged out successfully!");
    },
    onError: (error: Error) => {
      console.error("Logout error:", error);
      toast.error(error.message || "Logout failed. Please try again.");
    },
  });
};
