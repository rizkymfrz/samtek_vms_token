import { redirect } from "next/navigation";
import { UnauthorizedError } from "./session";

export const redirectIfUnauthorized = <T>(task: Promise<T>) =>
  task.catch((error) => {
    if (error instanceof UnauthorizedError) redirect("/login");
    throw error;
  });
