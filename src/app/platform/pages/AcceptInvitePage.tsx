import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle, Loader2, XCircle } from "lucide-react";
import { Button } from "@/app/shared/ui/button";
import { acceptInvite } from "@/lib/orgs/invites";

export default function AcceptInvitePage() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");
  const inviteCode = searchParams.get("code") || "";

  useEffect(() => {
    if (!inviteCode) {
      setStatus("error");
      setMessage("Kodi i ftesës mungon.");
      return;
    }

    acceptInvite(inviteCode)
      .then(() => {
        setStatus("success");
        setMessage("Ju u bashkuat me sukses. Mund të zgjidhni organizatën tani.");
      })
      .catch((error) => {
        setStatus("error");
        setMessage(error instanceof Error ? error.message : "Pranimi i ftesës dështoi.");
      });
  }, [inviteCode]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm text-center space-y-5">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="flex size-7 items-center justify-center rounded-md bg-primary font-black text-white text-xs select-none">
            R
          </div>
          <span className="font-bold tracking-tight text-sm">Rekrutime</span>
        </div>

        {status === "loading" && (
          <>
            <Loader2 className="size-10 text-primary animate-spin mx-auto" />
            <div>
              <h1 className="text-xl font-semibold">Duke pranuar ftesën...</h1>
              <p className="text-sm text-muted-foreground mt-1">Ju lutemi prisni.</p>
            </div>
          </>
        )}

        {status === "success" && (
          <>
            <CheckCircle className="size-12 text-green-500 mx-auto" />
            <div>
              <h1 className="text-xl font-semibold">Ftesa u pranua!</h1>
              <p className="text-sm text-muted-foreground mt-1">{message}</p>
            </div>
            <Button asChild className="w-full">
              <Link to="/app/select-org">Shko te organizatat</Link>
            </Button>
          </>
        )}

        {status === "error" && (
          <>
            <XCircle className="size-12 text-destructive mx-auto" />
            <div>
              <h1 className="text-xl font-semibold">Ndodhi një gabim</h1>
              <p className="text-sm text-muted-foreground mt-1">{message}</p>
            </div>
            <Button asChild variant="outline" className="w-full">
              <Link to="/app/select-org">Kthehu te organizatat</Link>
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
