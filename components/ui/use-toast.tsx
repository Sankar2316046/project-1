"use client"

import { toast as sonnerToast } from "sonner"

type ToastProps = {
  title?: string
  description?: string
  variant?: "default" | "destructive"
}

export const useToast = () => {
  const toast = ({ title, description, variant = "default", ...props }: ToastProps) => {
    if (variant === "destructive") {
      return sonnerToast.error(title, {
        description,
        ...props
      })
    }
    return sonnerToast.success(title, {
      description,
      ...props
    })
  }

  return {
    toast
  }
}
