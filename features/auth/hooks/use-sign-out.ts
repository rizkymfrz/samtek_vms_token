"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { signOut } from "../services/auth-api";

export const useSignOut = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: signOut,
    onSuccess: () => queryClient.clear(),
    onError: (error) => console.error("[sign-out]", error),
  });
};
