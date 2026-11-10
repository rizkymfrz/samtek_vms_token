"use client";
import { useMutation } from "@tanstack/react-query";
import { signOut } from "../services/auth-api";

export const useSignOut = () =>
  useMutation({
    mutationFn: signOut,
    onError: (error) => console.error("[sign-out]", error),
  });
