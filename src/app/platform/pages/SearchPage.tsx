import { useEffect, useMemo, useState } from "react";
import { Input } from "@/app/shared/ui/input";
import { useOrg } from "../context/OrgContext";
import { listCandidates } from "@/lib/orgs/candidates";
import { listClients } from "@/lib/orgs/clients";
import { listJobs } from "@/lib/orgs/jobs";

export default function SearchPage() {
  const { orgId } = useOrg();
  const [term, setTerm] = useState("");
  const [pool, setPool] = useState<{ type: string; id: string; label: string }[]>([]);

  useEffect(() => {
    if (!orgId) return;
    Promise.all([listCandidates(orgId), listJobs(orgId), listClients(orgId)]).then(
      ([candidates, jobs, clients]) => {
        setPool([
          ...candidates.map((item) => ({ type: "candidate", id: item.id, label: item.fullName })),
          ...jobs.map((item) => ({ type: "job", id: item.id, label: item.title })),
          ...clients.map((item) => ({ type: "client", id: item.id, label: item.name })),
        ]);
      }
    );
  }, [orgId]);

  const filtered = useMemo(() => {
    const q = term.toLowerCase();
    return pool.filter((item) => item.label.toLowerCase().includes(q));
  }, [term, pool]);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Global Search</h1>
      <Input value={term} onChange={(e) => setTerm(e.target.value)} placeholder="Search candidates/jobs/clients..." />
      <div className="space-y-2">
        {filtered.map((item) => (
          <div key={`${item.type}-${item.id}`} className="rounded border p-3 text-sm">
            <span className="font-medium capitalize">{item.type}</span>: {item.label}
          </div>
        ))}
      </div>
    </div>
  );
}
