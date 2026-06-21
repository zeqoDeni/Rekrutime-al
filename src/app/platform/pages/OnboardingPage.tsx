import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/app/shared/ui/button";
import { Input } from "@/app/shared/ui/input";
import { Label } from "@/app/shared/ui/label";
import { useAuth } from "@/app/context/AuthContext";
import { createOrganization } from "@/lib/orgs/orgs";

export default function OnboardingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user || !name.trim()) return;
    setLoading(true);
    try {
      const orgId = await createOrganization({ name: name.trim(), userId: user.id });
      navigate(`/app/${orgId}/dashboard`);
    } finally {
      setLoading(false);
    }
  };

  const firstName = user?.name?.split(" ")[0] ?? "aty";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top bar */}
      <header className="flex items-center gap-2 px-8 py-5 border-b">
        <div className="flex size-7 items-center justify-center rounded-md bg-primary font-black text-white text-xs select-none">
          R
        </div>
        <span className="font-bold tracking-tight text-sm">Rekrutime</span>
      </header>

      {/* Content */}
      <main className="flex flex-1 items-center justify-center px-4 py-16">
        <div className="w-full max-w-md space-y-8">
          {/* Welcome */}
          <div className="space-y-1.5 text-center">
            <div className="inline-flex size-14 items-center justify-center rounded-2xl bg-primary/10 mb-2">
              <Building2 className="size-7 text-primary" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">
              Mirë se erdhe, {firstName}!
            </h1>
            <p className="text-muted-foreground text-sm max-w-xs mx-auto">
              Krijoni hapësirën e parë të rekrutimit. Do të mund të ftoni anëtarë
              të ekipit sapo të krijoni organizatën.
            </p>
          </div>

          {/* Card */}
          <div className="rounded-2xl border bg-card p-8 shadow-sm space-y-6">
            <div className="space-y-1">
              <h2 className="font-semibold text-base">Emri i agjencisë</h2>
              <p className="text-xs text-muted-foreground">
                Ky emër do të shfaqet për anëtarët e ekipit tuaj.
              </p>
            </div>

            <form onSubmit={submit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="org-name">Emri</Label>
                <Input
                  id="org-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="p.sh. ABC Recruitment"
                  className="h-11"
                  autoFocus
                  disabled={loading}
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full h-11 text-base gap-2"
                disabled={loading || !name.trim()}
              >
                {loading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Duke krijuar...
                  </>
                ) : (
                  <>
                    Krijo hapësirën
                    <ArrowRight className="size-4" />
                  </>
                )}
              </Button>
            </form>
          </div>

          <p className="text-center text-xs text-muted-foreground">
            Keni tashmë një hapësirë?{" "}
            <a href="/app/select-org" className="text-primary hover:underline font-medium">
              Zgjidhni këtu
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}
