import { Navigate } from "react-router-dom";
import { AppRole } from "@/lib/types/ats";
import { useOrg } from "../context/OrgContext";

export function RbacGuard({
  allow,
  children,
}: {
  allow: AppRole[];
  children: React.ReactNode;
}) {
  const { role, loading, orgId } = useOrg();
  if (loading) return <p className="p-4 text-sm text-muted-foreground">Loading permissions...</p>;
  if (!role || !allow.includes(role)) {
    return <Navigate to={orgId ? `/app/${orgId}/dashboard` : "/app/select-org"} replace />;
  }
  return <>{children}</>;
}
