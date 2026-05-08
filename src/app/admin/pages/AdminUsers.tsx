import { useEffect, useState } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { AdminLayout } from '../layout/AdminLayout';
import { listAllUsers, setUserDisabled, setUserRole } from '@/lib/admin';
import type { User } from '@/lib/types/api';
import { Button } from '@/app/shared/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/shared/ui/select';

const ROLE_LABELS: Record<string, string> = {
  candidate: 'Kandidat',
  employer: 'Punëdhënës',
  admin: 'Admin',
};

const ROLE_BADGE: Record<string, string> = {
  candidate: 'bg-blue-100 text-blue-800',
  employer: 'bg-purple-100 text-purple-800',
  admin: 'bg-orange-100 text-orange-800',
};

type RoleFilter = 'all' | 'candidate' | 'employer' | 'admin';

export default function AdminUsers() {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');
  const [pendingUid, setPendingUid] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    listAllUsers(user)
      .then(setUsers)
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false));
  }, [user]);

  async function handleToggleDisabled(target: User) {
    if (!user) return;
    setPendingUid(target.id);
    try {
      await setUserDisabled(target.id, !target.isDisabled, user);
      setUsers((prev) =>
        prev.map((u) => (u.id === target.id ? { ...u, isDisabled: !target.isDisabled } : u))
      );
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setPendingUid(null);
    }
  }

  async function handleRoleChange(target: User, newRole: 'candidate' | 'employer' | 'admin') {
    if (!user || newRole === target.type) return;
    setPendingUid(target.id);
    try {
      await setUserRole(target.id, newRole, user);
      setUsers((prev) =>
        prev.map((u) => (u.id === target.id ? { ...u, type: newRole } : u))
      );
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setPendingUid(null);
    }
  }

  const filtered =
    roleFilter === 'all' ? users : users.filter((u) => u.type === roleFilter);

  return (
    <AdminLayout title="Menaxhimi i Përdoruesve" subtitle={`${users.length} përdorues gjithsej`}>
      {error && (
        <div className="bg-destructive/10 text-destructive rounded-lg p-3 mb-4 text-sm">{error}</div>
      )}

      <div className="flex items-center gap-3 mb-5">
        <Select value={roleFilter} onValueChange={(v) => setRoleFilter(v as RoleFilter)}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Të gjithë</SelectItem>
            <SelectItem value="candidate">Kandidatë</SelectItem>
            <SelectItem value="employer">Punëdhënës</SelectItem>
            <SelectItem value="admin">Adminë</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground">{filtered.length} rezultate</span>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-14 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-muted-foreground text-sm">Nuk u gjetën përdorues.</p>
      ) : (
        <div className="bg-card border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/40">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Emri</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">Email</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Roli</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Regjistruar</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">Veprime</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((u) => (
                <tr key={u.id} className={u.isDisabled ? 'opacity-50' : ''}>
                  <td className="px-4 py-3">
                    <div className="font-medium truncate max-w-[160px]">{u.name}</div>
                    {u.isDisabled && (
                      <span className="text-xs text-destructive">i çaktivizuar</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell truncate max-w-[200px]">
                    {u.email}
                  </td>
                  <td className="px-4 py-3">
                    <Select
                      value={u.type}
                      onValueChange={(v) => handleRoleChange(u, v as 'candidate' | 'employer' | 'admin')}
                      disabled={!!pendingUid || u.id === user?.id}
                    >
                      <SelectTrigger className="h-7 w-32 text-xs">
                        <SelectValue>
                          <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${ROLE_BADGE[u.type] ?? ''}`}>
                            {ROLE_LABELS[u.type] ?? u.type}
                          </span>
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="candidate">Kandidat</SelectItem>
                        <SelectItem value="employer">Punëdhënës</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs hidden md:table-cell">
                    {new Date(u.createdAt).toLocaleDateString('sq-AL')}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {u.id !== user?.id && (
                      <Button
                        variant={u.isDisabled ? 'outline' : 'ghost'}
                        size="sm"
                        className="text-xs h-7"
                        disabled={pendingUid === u.id}
                        onClick={() => handleToggleDisabled(u)}
                      >
                        {pendingUid === u.id
                          ? '...'
                          : u.isDisabled
                          ? 'Aktivizo'
                          : 'Çaktivizo'}
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  );
}
