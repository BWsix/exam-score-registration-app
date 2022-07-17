import { TRPCError } from "@trpc/server";
import { GoogleSpreadsheet } from "google-spreadsheet";
import { createSpreadsheet } from "server/utils/createSpreadsheet";
import { z } from "zod";
import { createRouter } from "../context";

export const spreadsheetRouter = createRouter()
  .middleware(({ ctx, next }) => {
    if (ctx.user?.accessToken) {
      return next({ ctx: { accessToken: ctx.user.accessToken } });
    }

    throw new TRPCError({ code: "UNAUTHORIZED" });
  })
  .mutation("create", {
    input: z.object({
      title: z.string(),
      subjectName: z.string(),
    }),
    resolve: async ({ input, ctx }) => {
      const createSpreadsheetResult = createSpreadsheet({
        accessToken: ctx.accessToken,
        title: input.title,
        subjectName: input.subjectName,
      });

      return createSpreadsheetResult;
    },
  })
  .query("properties", {
    input: z.object({
      spreadsheetId: z.string(),
    }),
    resolve: async ({ input, ctx }) => {
      const spreadsheet = new GoogleSpreadsheet(input.spreadsheetId);
      spreadsheet.useRawAccessToken(ctx.accessToken);
      await spreadsheet.loadInfo();

      const sheetInfo = spreadsheet.sheetsByIndex.map((sheet) => ({
        name: `${sheet.title}`,
        sheetId: `${sheet.sheetId}`,
      }));

      return sheetInfo;
    },
  })
  .mutation("addExam", {
    input: z.object({
      spreadsheetId: z.string(),
      sheetId: z.string(),
      examName: z.string(),
      scoreArray: z
        .object({
          studentNumber: z.number(),
          score: z.number(),
        })
        .array(),
    }),
    resolve: async ({ input, ctx }) => {
      const spreadsheet = new GoogleSpreadsheet(input.spreadsheetId);
      spreadsheet.useRawAccessToken(ctx.accessToken);
      await spreadsheet.loadInfo();

      const sheet = spreadsheet.sheetsById[input.sheetId];
      await sheet.loadCells();

      try {
        await sheet.loadHeaderRow();
      } catch (e) {
        if (sheet.cellStats.nonEmpty !== 0) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "請選擇格式正確或是空白的分頁",
          });
        }

        const header = "座號\\考試名稱";
        const rows = Array(50)
          .fill(1)
          .map((_, idx) => idx + 1)
          .map((studentNumber) => ({ [header]: studentNumber }));

        sheet.setHeaderRow([header]);
        await sheet.loadCells();
        await sheet.addRows(rows);
      }

      if (sheet.headerValues.some((examName) => examName === input.examName)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "考試名稱重複",
        });
      }

      const currentColumnIdx = sheet.headerValues?.length || 1;

      const titleCell = sheet.getCell(0, currentColumnIdx);
      titleCell.value = input.examName;

      input.scoreArray.forEach(({ score, studentNumber }) => {
        const scoreCell = sheet.getCell(studentNumber, currentColumnIdx);
        scoreCell.value = score;
      });

      await sheet.saveUpdatedCells();

      return true;
    },
  });
