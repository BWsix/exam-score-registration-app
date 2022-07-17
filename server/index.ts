import * as trpcNext from "@trpc/server/adapters/next";
import { createContext, createRouter } from "./context";
import { spreadsheetRouter } from "./routers/spreadsheet";

const appRouter = createRouter().merge("spreadsheet.", spreadsheetRouter);
export type AppRouter = typeof appRouter;

export const apiHandler = trpcNext.createNextApiHandler({
  router: appRouter,
  createContext,
});
