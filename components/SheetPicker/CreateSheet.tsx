import { Button, Group, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { trpc } from "utils/trpc";

interface Props {
  accessToken: string | undefined;
  onSpreadsheetCreated: (createdSpreadsheetId: string) => void;
}

export function CreateSheet(props: Props) {
  const createSpreadsheetMutation = trpc.useMutation("spreadsheet.create", {
    onSuccess: (data) => {
      props.onSpreadsheetCreated(data.spreadsheetId as string);
    },
  });
  const form = useForm({
    initialValues: {
      title: "成績登記表",
      subjectName: "",
    },
  });

  return (
    <form
      onSubmit={form.onSubmit((values) =>
        createSpreadsheetMutation.mutate(values)
      )}
    >
      <TextInput
        required
        label="Title"
        placeholder="試算表檔案名稱"
        {...form.getInputProps("title")}
      />

      <TextInput
        required
        label="SubjectName"
        placeholder="科目名稱"
        {...form.getInputProps("subjectName")}
      />

      <Button type="submit" mt="sm" fullWidth>
        創建新試算表
      </Button>
    </form>
  );
}
