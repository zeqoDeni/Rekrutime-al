import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/app/context/AuthContext";
import { OrgProvider } from "../context/OrgContext";

export default function AppRoute() {
  const { user, isLoading } = useAuth();
  const location = useLocation();
  if (isLoading) return <p className="p-6 text-sm text-muted-foreground">Loading...</p>;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;

  return (
    <OrgProvider>
      <Outlet />
    </OrgProvider>
  );
}
