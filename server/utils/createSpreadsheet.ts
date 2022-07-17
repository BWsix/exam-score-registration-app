import { google } from "googleapis";

interface Props {
  accessToken: string;
  title: string;
  subjectName: string;
}

export async function createSpreadsheet(props: Props) {
  const Authorization = `Bearer ${props.accessToken}`;
  const sheets = google.sheets({
    version: "v4",
    headers: { Authorization },
  });

  const createdSpreadsheet = await sheets.spreadsheets.create({
    requestBody: {
      properties: {
        title: props.title,
      },
      sheets: [
        {
          properties: {
            title: props.subjectName,
          },
        },
      ],
    },
  });

  return {
    spreadsheetId: createdSpreadsheet.data.spreadsheetId,
  };
}
