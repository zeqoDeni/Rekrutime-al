import { FormEvent, useCallback, useEffect, useState } from "react";
import { Building2, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/app/shared/ui/button";
import { Input } from "@/app/shared/ui/input";
import { Skeleton } from "@/app/shared/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/shared/ui/table";
import { createClient, listClients } from "@/lib/orgs/clients";
import { useOrg } from "../context/OrgContext";
import { ClientCompany } from "@/lib/types/ats";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("sq-AL", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function ClientsPage() {
  const { orgId } = useOrg();
  const [clients, setClients] = useState<ClientCompany[]>([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const reload = useCallback(async () => {
    if (!orgId) return;
    setLoading(true);
    try {
      const data = await listClients(orgId);
      setClients(data);
    } finally {
      setLoading(false);
    }
  }, [orgId]);

  useEffect(() => {
    reload();
  }, [reload]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!orgId || !name.trim()) return;
    setCreating(true);
    try {
      await createClient(orgId, {
        name: name.trim(),
        createdAt: new Date().toISOString(),
      });
      toast.success("Klienti u shtua.");
      setName("");
      reload();
    } catch {
      toast.error("Klienti nuk u ruajt.");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold">Klientët</h1>
        {!loading && (
          <p className="text-sm text-muted-foreground mt-0.5">
            {clients.length} {clients.length === 1 ? "klient" : "klientë"}
          </p>
        )}
      </div>

      {/* Add client form */}
      <form onSubmit={submit} className="flex gap-2">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Emri i klientit..."
          className="h-9 max-w-xs text-sm"
          disabled={creating}
        />
        <Button type="submit" size="sm" disabled={!name.trim() || creating}>
          {creating ? "Duke shtuar..." : "+ Shto klient"}
        </Button>
      </form>

      {/* Table */}
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="min-w-[200px]">Emri</TableHead>
              <TableHead>Industria</TableHead>
              <TableHead>Faqja web</TableHead>
              <TableHead className="text-right pr-4 w-28">Shtuar</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <>
                {[...Array(4)].map((_, i) => (
                  <TableRow key={i} className="hover:bg-transparent">
                    <TableCell>
                      <Skeleton className="h-4 w-40" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-32" />
                    </TableCell>
                    <TableCell className="text-right pr-4">
                      <Skeleton className="h-4 w-16 ml-auto" />
                    </TableCell>
                  </TableRow>
                ))}
              </>
            ) : clients.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={4} className="py-16 text-center">
                  <div className="flex flex-col items-center gap-3 text-muted-foreground">
                    <Building2 className="size-10 opacity-30" />
                    <div>
                      <p className="font-medium text-sm">Nuk ka klientë ende</p>
                      <p className="text-xs mt-0.5">
                        Shtoni klientin e parë duke përdorur formularin më sipër.
                      </p>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              clients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell className="py-3">
                    <p className="font-medium text-sm">{client.name}</p>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {client.industry ?? "—"}
                  </TableCell>
                  <TableCell>
                    {client.website ? (
                      <a
                        href={client.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                      >
                        <ExternalLink className="size-3" />
                        {client.website.replace(/^https?:\/\//, "")}
                      </a>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right text-xs text-muted-foreground pr-4">
                    {formatDate(client.createdAt)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
