import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/app/shared/ui/button";
import { Input } from "@/app/shared/ui/input";
import { useAuth } from "@/app/context/AuthContext";
import { createOrganization } from "@/lib/orgs/orgs";

export default function OnboardingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!user || !name.trim()) return;
    setLoading(true);
    const orgId = await createOrganization({ name: name.trim(), userId: user.id });
    navigate(`/app/${orgId}/dashboard`);
  };

  return (
    <div className="mx-auto max-w-lg space-y-4">
      <h1 className="text-2xl font-semibold">Create your agency workspace</h1>
      <p className="text-sm text-muted-foreground">
        Start by creating your organization. You can invite teammates later.
      </p>
      <form className="space-y-3" onSubmit={submit}>
        <Input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Acme Recruiting"
        />
        <Button type="submit" disabled={loading || !name.trim()}>
          {loading ? "Creating..." : "Create workspace"}
        </Button>
      </form>
    </div>
  );
}
