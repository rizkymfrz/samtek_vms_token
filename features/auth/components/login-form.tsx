"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useId } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useSignIn } from "../hooks/use-sign-in";
import { type LoginInput, loginInputSchema } from "../schemas/login";

const safeNext = (value: string | null) =>
  value && value.startsWith("/") && !value.startsWith("//")
    ? value
    : "/dashboard";

export const LoginForm = () => {
  const router = useRouter();
  const formId = useId();
  const { signIn, isPending, error } = useSignIn();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginInputSchema),
    defaultValues: { identifier: "", password: "" },
  });
  const submit = handleSubmit(async (credentials) => {
    try {
      await signIn(credentials);
    } catch {
      return;
    }
    const next = new URLSearchParams(window.location.search).get("next");
    router.replace(safeNext(next));
    router.refresh();
  });
  const passwordError = errors.password?.message ?? error;
  return (
    <form
      noValidate
      onSubmit={submit}
      className="flex w-full max-w-sm flex-col gap-4 rounded border bg-card p-4"
    >
      <h1 className="text-sm font-medium">Sign in</h1>
      <Field data-invalid={!!errors.identifier}>
        <FieldLabel htmlFor={`${formId}-identifier`}>
          Username or email
        </FieldLabel>
        <Input
          id={`${formId}-identifier`}
          autoComplete="username"
          {...register("identifier")}
          aria-invalid={!!errors.identifier}
        />
        {errors.identifier && (
          <FieldError>{errors.identifier.message}</FieldError>
        )}
      </Field>
      <Field data-invalid={!!passwordError}>
        <FieldLabel htmlFor={`${formId}-password`}>Password</FieldLabel>
        <Input
          id={`${formId}-password`}
          type="password"
          autoComplete="current-password"
          {...register("password")}
          aria-invalid={!!passwordError}
        />
        {passwordError && <FieldError>{passwordError}</FieldError>}
      </Field>
      <Button type="submit" disabled={isPending}>
        Sign in
      </Button>
    </form>
  );
};
