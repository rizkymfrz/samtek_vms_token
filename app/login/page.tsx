import { LoginForm } from "@/features/auth/components/login-form";
import { QueryProvider } from "@/providers/query-provider";

const Page = () => {
  return (
    <main className="flex min-h-svh items-center justify-center bg-background p-4">
      <QueryProvider>
        <LoginForm />
      </QueryProvider>
    </main>
  );
};

export default Page;
