import { Link, Outlet, useParams } from "react-router-dom";

const navItems = [
  ["Dashboard", "dashboard"],
  ["Clients", "clients"],
  ["Jobs", "jobs"],
  ["Candidates", "candidates"],
  ["Search", "search"],
  ["Team", "settings/team"],
  ["Billing", "settings/billing"],
] as const;

export default function AppLayout() {
  const { orgId } = useParams();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6">
        <aside className="w-56 shrink-0 rounded-xl border bg-card p-4">
          <h2 className="mb-4 text-lg font-semibold">Recruiting Platform</h2>
          <nav className="space-y-2">
            {navItems.map(([label, slug]) => (
              <Link
                key={slug}
                className="block rounded-md px-3 py-2 text-sm hover:bg-muted"
                to={`/app/${orgId}/${slug}`}
              >
                {label}
              </Link>
            ))}
          </nav>
        </aside>
        <main className="min-w-0 flex-1 rounded-xl border bg-card p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
