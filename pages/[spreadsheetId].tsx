import {
  Button,
  Container,
  CopyButton,
  Divider,
  Group,
  Loader,
  Stack,
} from "@mantine/core";
import { AddExamForm } from "components/AddExamForm";
import Link from "next/link";
import { useRouter } from "next/router";
import { trpc } from "utils/trpc";
import { useSession } from "utils/useSession";

export default function Sheet() {
  useSession();

  const router = useRouter();
  const spreadsheetId = router.query.spreadsheetId;

  const spreadsheetPropertiesQuery = trpc.useQuery(
    ["spreadsheet.properties", { spreadsheetId: spreadsheetId as string }],
    { enabled: typeof spreadsheetId === "string" }
  );

  if (spreadsheetPropertiesQuery.isLoading) {
    return <Loader />;
  }
  if (!spreadsheetPropertiesQuery.isSuccess) {
    return <>error</>;
  }
  if (typeof spreadsheetId !== "string") {
    return <>error</>;
  }

  return (
    <Container size="xs" pt="lg" px="xs">
      <AddExamForm
        spreadsheetId={spreadsheetId}
        tabs={spreadsheetPropertiesQuery.data}
      />

      <Divider mt="sm" />

      <Stack pt="sm" spacing="sm">
        <Link
          href={`https://docs.google.com/spreadsheets/d/${spreadsheetId}`}
          passHref
        >
          <Button component="a" target="_blank" variant="outline" fullWidth>
            前往成績試算表
          </Button>
        </Link>

        <CopyButton
          value={`https://docs.google.com/spreadsheets/d/${spreadsheetId}`}
        >
          {({ copied, copy }) => (
            <Button
              color={copied ? "teal" : "blue"}
              onClick={copy}
              variant="outline"
              fullWidth
            >
              {copied ? "已複製!" : "複製成績試算表網址"}
            </Button>
          )}
        </CopyButton>

        <Link href="/" passHref>
          <Button component="a" variant="outline" fullWidth>
            回到選單
          </Button>
        </Link>
      </Stack>
    </Container>
  );
}
