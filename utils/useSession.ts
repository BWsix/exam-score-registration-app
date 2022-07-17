import { useSession as useNextAuthSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect } from "react";

export function useSession() {
  const router = useRouter();
  const { data: session, status } = useNextAuthSession();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status]);

  return { data: session, status };
}
