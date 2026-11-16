"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useId } from "react";
import { Controller, useForm } from "react-hook-form";
import { PasswordInput } from "@/components/shared/password-input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { ForgotPasswordDialog } from "./forgot-password-dialog";
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
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginInputSchema),
    defaultValues: { identifier: "", password: "", remember: false },
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
    <form noValidate onSubmit={submit} className="flex w-full flex-col gap-4">
      <Field data-invalid={!!errors.identifier}>
        <FieldLabel htmlFor={`${formId}-identifier`}>
          Username or email
        </FieldLabel>
        <Input
          id={`${formId}-identifier`}
          className="h-11"
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
        <PasswordInput
          id={`${formId}-password`}
          className="h-11"
          autoComplete="current-password"
          {...register("password")}
          aria-invalid={!!passwordError}
        />
        {passwordError && <FieldError>{passwordError}</FieldError>}
      </Field>
      <div className="flex items-center justify-between gap-2">
        <Controller
          control={control}
          name="remember"
          render={({ field }) => (
            <FieldLabel className="cursor-pointer font-normal">
              <Checkbox
                checked={field.value ?? false}
                onCheckedChange={field.onChange}
                onBlur={field.onBlur}
                ref={field.ref}
              />
              Remember me
            </FieldLabel>
          )}
        />
        <ForgotPasswordDialog />
      </div>
      <Button type="submit" className="h-11" disabled={isPending}>
        Sign in
      </Button>
    </form>
  );
};
