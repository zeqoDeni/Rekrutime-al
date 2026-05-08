import { ReactNode, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/app/context/AuthContext';
import { Navbar } from '@/app/shared/layout/Navbar';
import { Footer } from '@/app/shared/layout/Footer';
import { Button } from '@/app/shared/ui/button';
import { Avatar, AvatarFallback } from '@/app/shared/ui/avatar';
import { Menu, X, LayoutDashboard, Users, Briefcase, FileText, LogOut } from 'lucide-react';

interface AdminLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

const navItems = [
  { label: 'Paneli', href: '/admin', icon: LayoutDashboard },
  { label: 'Përdoruesit', href: '/admin/users', icon: Users },
  { label: 'Punët', href: '/admin/jobs', icon: Briefcase },
  { label: 'Aplikimet', href: '/admin/applications', icon: FileText },
];

export function AdminLayout({ children, title, subtitle }: AdminLayoutProps) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!user) return null;

  const SidebarContent = () => (
    <div className="p-4 sm:p-6">
      <div className="flex items-center gap-3 mb-6 sm:mb-8">
        <Avatar className="h-10 w-10">
          <AvatarFallback className="text-sm bg-primary text-primary-foreground">
            {user.name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="font-medium text-foreground truncate">{user.name}</p>
          <p className="text-xs text-muted-foreground">Administrator</p>
        </div>
      </div>

      <nav className="space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === '/admin'
              ? location.pathname === '/admin'
              : location.pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              to={item.href}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <Icon className="size-4 shrink-0" />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-6 sm:mt-8 pt-4 border-t">
        <Button
          variant="ghost"
          className="w-full justify-start text-muted-foreground hover:text-foreground text-sm"
          onClick={() => {
            setSidebarOpen(false);
            logout();
          }}
        >
          <LogOut className="size-4 mr-3 shrink-0" />
          Dilni
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <aside className="hidden md:block md:w-64 bg-card border-r shrink-0">
          <SidebarContent />
        </aside>

        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/50 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <aside
          className={`fixed left-0 top-0 h-full w-64 bg-card border-r z-50 transition-transform duration-200 md:hidden ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="font-semibold">Admin</h2>
            <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)} className="h-8 w-8">
              <X className="h-4 w-4" />
            </Button>
          </div>
          <SidebarContent />
        </aside>

        <main className="flex-1 w-full overflow-x-hidden">
          <div className="md:hidden sticky top-0 z-30 bg-card border-b p-4 flex items-center">
            <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)} className="h-8 w-8">
              <Menu className="h-5 w-5" />
            </Button>
          </div>

          <div className="p-4 sm:p-6 md:p-8">
            <div className="mb-6 sm:mb-8">
              <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">
                {title}
              </h1>
              {subtitle && (
                <p className="mt-1 sm:mt-2 text-sm sm:text-base text-muted-foreground">{subtitle}</p>
              )}
            </div>
            {children}
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}
