import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { AppRole } from "@/lib/types/ats";
import { useAuth } from "@/app/context/AuthContext";
import { listMembers } from "@/lib/orgs/members";

interface OrgContextValue {
  orgId: string | null;
  role: AppRole | null;
  loading: boolean;
}

const OrgContext = createContext<OrgContextValue>({
  orgId: null,
  role: null,
  loading: true,
});

export function OrgProvider({ children }: { children: React.ReactNode }) {
  const { orgId } = useParams();
  const { user } = useAuth();
  const [role, setRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      if (!orgId || !user) {
        setRole(null);
        setLoading(false);
        return;
      }
      const members = await listMembers(orgId);
      const member = members.find((item) => item.uid === user.id);
      setRole(member?.role || null);
      setLoading(false);
    };
    run();
  }, [orgId, user]);

  const value = useMemo(
    () => ({
      orgId: orgId || null,
      role,
      loading,
    }),
    [orgId, role, loading]
  );

  return <OrgContext.Provider value={value}>{children}</OrgContext.Provider>;
}

export function useOrg() {
  return useContext(OrgContext);
}
