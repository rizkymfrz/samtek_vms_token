"use client";
import axios, { isAxiosError } from "axios";
import { useRouter } from "next/navigation";
import { type FormEvent, useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

const safeNext = (value: string | null) =>
  value && value.startsWith("/") && !value.startsWith("//")
    ? value
    : "/dashboard";

export const LoginForm = () => {
  const router = useRouter();
  const formId = useId();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      await axios.post("/api/auth/login", { identifier, password });
      const next = new URLSearchParams(window.location.search).get("next");
      router.replace(safeNext(next));
      router.refresh();
    } catch (cause) {
      setError(
        isAxiosError(cause) && typeof cause.response?.data?.error === "string"
          ? cause.response.data.error
          : "Sign-in failed",
      );
      setIsSubmitting(false);
    }
  };
  return (
    <form
      noValidate
      onSubmit={submit}
      className="flex w-full max-w-sm flex-col gap-4 border bg-card p-4"
    >
      <h1 className="text-sm font-medium">Sign in</h1>
      <Field>
        <FieldLabel htmlFor={`${formId}-identifier`}>
          Username or email
        </FieldLabel>
        <Input
          id={`${formId}-identifier`}
          autoComplete="username"
          value={identifier}
          onChange={(event) => setIdentifier(event.target.value)}
        />
      </Field>
      <Field data-invalid={!!error}>
        <FieldLabel htmlFor={`${formId}-password`}>Password</FieldLabel>
        <Input
          id={`${formId}-password`}
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          aria-invalid={!!error}
        />
        {error && <FieldError>{error}</FieldError>}
      </Field>
      <Button type="submit" disabled={isSubmitting || !identifier || !password}>
        Sign in
      </Button>
    </form>
  );
};
