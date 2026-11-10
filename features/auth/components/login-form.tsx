"use client";
import { useRouter } from "next/navigation";
import { type FormEvent, useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useSignIn } from "../hooks/use-sign-in";

const safeNext = (value: string | null) =>
  value && value.startsWith("/") && !value.startsWith("//")
    ? value
    : "/dashboard";

export const LoginForm = () => {
  const router = useRouter();
  const formId = useId();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const { signIn, isPending, error } = useSignIn();
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    try {
      await signIn({ identifier, password });
    } catch {
      return;
    }
    const next = new URLSearchParams(window.location.search).get("next");
    router.replace(safeNext(next));
    router.refresh();
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
      <Button type="submit" disabled={isPending || !identifier || !password}>
        Sign in
      </Button>
    </form>
  );
};
