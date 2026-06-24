import { Link, Outlet, useLocation, useParams } from "react-router-dom";
import {
  BarChart2,
  Briefcase,
  Building2,
  CreditCard,
  ListTodo,
  Search,
  Settings,
  Users,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", slug: "dashboard", icon: BarChart2 },
  { label: "Klientët", slug: "clients", icon: Building2 },
  { label: "Punët", slug: "jobs", icon: Briefcase },
  { label: "Kandidatët", slug: "candidates", icon: Users },
  { label: "Detyrat", slug: "tasks", icon: ListTodo },
  { label: "Kërkim", slug: "search", icon: Search },
  { label: "Ekipi", slug: "settings/team", icon: Settings },
  { label: "Abonimi", slug: "settings/billing", icon: CreditCard },
] as const;

export default function AppLayout() {
  const { orgId } = useParams();
  const { pathname } = useLocation();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6">
        <aside className="w-52 shrink-0">
          <div className="rounded-xl border bg-card p-3 space-y-1 sticky top-6">
            {/* Brand */}
            <div className="flex items-center gap-2 px-2 py-2 mb-2">
              <div className="flex size-6 items-center justify-center rounded bg-primary font-black text-white text-xs select-none">
                R
              </div>
              <span className="font-bold text-sm tracking-tight">Rekrutime</span>
            </div>

            <nav className="space-y-0.5">
              {navItems.map(({ label, slug, icon: Icon }) => {
                const href = `/app/${orgId}/${slug}`;
                const active = pathname === href || pathname.startsWith(href + "/");
                return (
                  <Link
                    key={slug}
                    to={href}
                    className={[
                      "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      active
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    ].join(" ")}
                  >
                    <Icon className="size-4 shrink-0" />
                    {label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>
        <main className="min-w-0 flex-1 rounded-xl border bg-card p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
