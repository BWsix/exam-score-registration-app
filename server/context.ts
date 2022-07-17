import * as trpc from "@trpc/server";
import * as trpcNext from "@trpc/server/adapters/next";
import { getSession } from "next-auth/react";

export async function createContext(opts?: trpcNext.CreateNextContextOptions) {
  const session = await getSession({ ctx: opts });
  const user = session?.user;

  return {
    user,
  };
}
type Context = trpc.inferAsyncReturnType<typeof createContext>;

export function createRouter() {
  return trpc.router<Context>();
}
