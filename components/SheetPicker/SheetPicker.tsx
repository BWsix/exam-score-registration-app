import { Box, Button, Divider } from "@mantine/core";
import useDrivePicker from "react-google-drive-picker";
import { CreateSheet } from "./CreateSheet";

interface Props {
  accessToken: string | undefined;
  onSpreadsheetSelected: (selectedSpreadsheetId: string) => void;
}

export function SheetPicker(props: Props) {
  const [openPicker] = useDrivePicker();
  const handleOpenPicker = () => {
    openPicker({
      clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
      developerKey: process.env.NEXT_PUBLIC_GOOGLE_DRIVE_DEVELOPER_KEY,
      viewId: "SPREADSHEETS",
      token: props.accessToken,
      callbackFunction: (data) => {
        if (data.action === "picked") {
          props.onSpreadsheetSelected(data.docs[0].id);
        }
      },
    });
  };

  return (
    <Box>
      <Button onClick={() => handleOpenPicker()} fullWidth>
        從Google Drive選擇試算表
      </Button>

      <Divider label="或是" labelPosition="center" />

      <CreateSheet
        accessToken={props.accessToken}
        onSpreadsheetCreated={props.onSpreadsheetSelected}
      />
    </Box>
  );
}
