import { Button, Container, Loader } from "@mantine/core";
import { SheetPicker } from "components/SheetPicker";
import { signIn } from "next-auth/react";
import { useRouter } from "next/router";
import { useSession } from "utils/useSession";

export default function Drive() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const accessToken = session?.user.accessToken;

  function handleSpreadsheetSelect(spreadsheetId: string) {
    router.push(spreadsheetId);
  }

  if (status === "loading") {
    return <Loader />;
  } else {
    return (
      <Container size="xs" pt="lg" px="xs">
        {typeof accessToken === "string" && status === "authenticated" ? (
          <SheetPicker
            accessToken={accessToken}
            onSpreadsheetSelected={handleSpreadsheetSelect}
          />
        ) : (
          <Button onClick={() => signIn("google")} fullWidth>
            使用Google登入
          </Button>
        )}
      </Container>
    );
  }
}
