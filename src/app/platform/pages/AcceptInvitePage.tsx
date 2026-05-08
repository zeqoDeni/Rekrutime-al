import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/app/shared/ui/button";
import { acceptInvite } from "@/lib/orgs/invites";

export default function AcceptInvitePage() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const inviteCode = searchParams.get("code") || "";

  useEffect(() => {
    if (!inviteCode) {
      setStatus("error");
      setMessage("Invite code is missing.");
      return;
    }

    setStatus("loading");
    acceptInvite(inviteCode)
      .then(() => {
        setStatus("success");
        setMessage("Invite accepted. You can now select the organization from your app workspace.");
      })
      .catch((error) => {
        setStatus("error");
        setMessage(error instanceof Error ? error.message : "Invite acceptance failed.");
      });
  }, [inviteCode]);

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-2xl font-semibold">Accept Invite</h1>
      <p className="text-sm text-muted-foreground">
        {status === "loading" ? "Accepting your invite..." : message}
      </p>
      {status !== "loading" && (
        <Button asChild>
          <Link to="/app/select-org">Go to organizations</Link>
        </Button>
      )}
    </div>
  );
}
