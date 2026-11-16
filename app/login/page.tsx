import { AuthHeader } from "@/components/layout/auth-header";
import { BrandLogo } from "@/components/layout/brand-logo";
import { PageBackdrop } from "@/components/layout/page-backdrop";
import { LoginForm } from "@/features/auth/components/login-form";
import { StarField } from "@/features/auth/components/star-field";
import { QueryProvider } from "@/providers/query-provider";

const STAR_MASK = [
  "linear-gradient(to right, transparent 45%, black 75%)",
  "radial-gradient(ellipse 30% 20% at 40% 14%, black, transparent)",
  "radial-gradient(ellipse 26% 26% at 32% 40%, black, transparent)",
  "radial-gradient(ellipse 30% 18% at 36% 66%, black, transparent)",
  "radial-gradient(ellipse 22% 22% at 28% 88%, black, transparent)",
  "radial-gradient(ellipse 18% 12% at 22% 6%, black, transparent)",
].join(", ");

const Page = () => {
  return (
    <main className="relative isolate grid min-h-svh bg-background lg:grid-cols-2">
      <PageBackdrop intensity={4} />
      <div
        className="absolute inset-y-0 right-0 hidden w-3/5 bg-background lg:block"
        style={{ maskImage: STAR_MASK }}
      >
        <StarField />
      </div>
      <AuthHeader />
      <div className="relative flex items-center justify-center p-4 pt-[calc(var(--header-height)+1rem)]">
        <div className="flex w-full max-w-md flex-col gap-8">
          <div className="flex flex-col gap-2">
            <div className="mb-4 flex items-center gap-4">
              <BrandLogo className="size-10" />
              <span className="text-2xl font-semibold tracking-wide">
                SAMTEK
              </span>
            </div>
            <h1 className="text-3xl font-semibold tracking-tight">
              Welcome back
            </h1>
            <p className="text-sm text-muted-foreground">
              Sign in to monitor cameras, alerts and devices across your sites.
            </p>
          </div>
          <QueryProvider>
            <LoginForm />
          </QueryProvider>
        </div>
      </div>
      <div className="relative hidden lg:block">
        <video
          className="absolute inset-0 size-full object-cover"
          src="/earth.webm"
          autoPlay
          loop
          muted
          playsInline
          aria-hidden="true"
        />
      </div>
    </main>
  );
};

export default Page;
