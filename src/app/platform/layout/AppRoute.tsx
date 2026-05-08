import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/app/context/AuthContext";
import { OrgProvider } from "../context/OrgContext";

export default function AppRoute() {
  const { user, isLoading } = useAuth();
  if (isLoading) return <p className="p-6 text-sm text-muted-foreground">Loading...</p>;
  if (!user) return <Navigate to="/login" replace />;

  return (
    <OrgProvider>
      <Outlet />
    </OrgProvider>
  );
}
