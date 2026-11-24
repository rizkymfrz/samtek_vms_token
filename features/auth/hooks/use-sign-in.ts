"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { messageOf } from "@/lib/axios/browser-client";
import { type Credentials, signIn } from "../services/auth-api";

export const useSignIn = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (value: Credentials) => signIn(value),
    onSuccess: () => queryClient.clear(),
  });
  return {
    signIn: mutation.mutateAsync,
    isPending: mutation.isPending,
    error: mutation.error ? messageOf(mutation.error, "Sign-in failed") : null,
  };
};
