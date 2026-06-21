import { FormEvent, useCallback, useEffect, useState } from "react";
import { Building2, ExternalLink, Pencil, Trash2, X, Check } from "lucide-react";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/app/shared/ui/alert-dialog";
import { createClient, deleteClient, listClients, updateClient } from "@/lib/orgs/clients";
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
  const [industry, setIndustry] = useState("");
  const [website, setWebsite] = useState("");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  // Inline edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editIndustry, setEditIndustry] = useState("");
  const [editWebsite, setEditWebsite] = useState("");
  const [saving, setSaving] = useState(false);

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
        industry: industry.trim() || undefined,
        website: website.trim() || undefined,
        createdAt: new Date().toISOString(),
      });
      toast.success("Klienti u shtua.");
      setName("");
      setIndustry("");
      setWebsite("");
      reload();
    } catch {
      toast.error("Klienti nuk u ruajt.");
    } finally {
      setCreating(false);
    }
  };

  const startEdit = (client: ClientCompany) => {
    setEditingId(client.id);
    setEditName(client.name);
    setEditIndustry(client.industry ?? "");
    setEditWebsite(client.website ?? "");
  };

  const cancelEdit = () => setEditingId(null);

  const saveEdit = async () => {
    if (!orgId || !editingId || !editName.trim()) return;
    setSaving(true);
    try {
      await updateClient(orgId, editingId, {
        name: editName.trim(),
        industry: editIndustry.trim() || undefined,
        website: editWebsite.trim() || undefined,
      });
      setClients((prev) =>
        prev.map((c) =>
          c.id === editingId
            ? { ...c, name: editName.trim(), industry: editIndustry.trim() || undefined, website: editWebsite.trim() || undefined }
            : c
        )
      );
      toast.success("Klienti u përditësua.");
      setEditingId(null);
    } catch {
      toast.error("Ndryshimet nuk u ruajtën.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (clientId: string, clientName: string) => {
    if (!orgId) return;
    try {
      await deleteClient(orgId, clientId);
      setClients((prev) => prev.filter((c) => c.id !== clientId));
      toast.success(`"${clientName}" u fshi.`);
    } catch {
      toast.error("Fshirja dështoi.");
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
      <form onSubmit={submit} className="flex flex-wrap gap-2">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Emri i klientit *"
          className="h-9 w-44 text-sm"
          disabled={creating}
        />
        <Input
          value={industry}
          onChange={(e) => setIndustry(e.target.value)}
          placeholder="Industria"
          className="h-9 w-36 text-sm"
          disabled={creating}
        />
        <Input
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          placeholder="https://..."
          className="h-9 w-44 text-sm"
          disabled={creating}
        />
        <Button type="submit" size="sm" className="h-9" disabled={!name.trim() || creating}>
          {creating ? "Duke shtuar..." : "+ Shto klient"}
        </Button>
      </form>

      {/* Table */}
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="min-w-[180px]">Emri</TableHead>
              <TableHead className="w-36">Industria</TableHead>
              <TableHead>Faqja web</TableHead>
              <TableHead className="w-24 text-right">Shtuar</TableHead>
              <TableHead className="w-20" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              [...Array(4)].map((_, i) => (
                <TableRow key={i} className="hover:bg-transparent">
                  <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                  <TableCell />
                </TableRow>
              ))
            ) : clients.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={5} className="py-16 text-center">
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
              clients.map((client) =>
                editingId === client.id ? (
                  // Inline edit row
                  <TableRow key={client.id} className="bg-muted/30">
                    <TableCell className="py-2">
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="h-7 text-sm"
                        disabled={saving}
                        autoFocus
                      />
                    </TableCell>
                    <TableCell className="py-2">
                      <Input
                        value={editIndustry}
                        onChange={(e) => setEditIndustry(e.target.value)}
                        className="h-7 text-sm"
                        disabled={saving}
                        placeholder="Industria"
                      />
                    </TableCell>
                    <TableCell className="py-2">
                      <Input
                        value={editWebsite}
                        onChange={(e) => setEditWebsite(e.target.value)}
                        className="h-7 text-sm"
                        disabled={saving}
                        placeholder="https://..."
                      />
                    </TableCell>
                    <TableCell />
                    <TableCell className="py-2">
                      <div className="flex items-center gap-1 justify-end">
                        <Button
                          size="sm"
                          className="h-7 w-7 p-0"
                          onClick={saveEdit}
                          disabled={!editName.trim() || saving}
                        >
                          <Check className="size-3.5" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 p-0"
                          onClick={cancelEdit}
                          disabled={saving}
                        >
                          <X className="size-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  // Display row
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
                    <TableCell className="text-right text-xs text-muted-foreground">
                      {formatDate(client.createdAt)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 justify-end">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                          onClick={() => startEdit(client)}
                        >
                          <Pencil className="size-3.5" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                            >
                              <Trash2 className="size-3.5" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Fshi klientin</AlertDialogTitle>
                              <AlertDialogDescription>
                                A jeni të sigurt që doni të fshini{" "}
                                <strong>{client.name}</strong>?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Anulo</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(client.id, client.name)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Fshi
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              )
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
