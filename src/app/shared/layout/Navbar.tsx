import { Menu, Search, X, User, LogOut } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { navItems } from '@/app/features/landing/data/landing';
import { Button } from '@/app/shared/ui/button';
import { useAuth } from '@/app/context/AuthContext';
import { getDashboardRoute } from '@/app/shared/routes/dashboardRoute';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/app/shared/ui/dropdown-menu';

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, isLoading, logout } = useAuth();
  const dashboardHref = user ? getDashboardRoute(user) : '/login';

  const handleLogout = async () => {
    setIsMenuOpen(false);
    await logout();
  };

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
      <nav
        aria-label="Navigimi kryesor"
        className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8"
      >
        <Link to="/" aria-label="Kreu i Rekrutime.al" className="flex items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-md bg-foreground text-sm font-semibold text-background">
            R
          </span>
          <span className="text-base font-semibold text-foreground">Rekrutime.al</span>
        </Link>

        <div className="hidden items-center gap-7 md:flex">
          {navItems.map((item) =>
            item.href.startsWith('/#') ? (
              <a
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                href={item.href}
                key={item.href}
              >
                {item.label}
              </a>
            ) : (
              <Link
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                to={item.href}
                key={item.href}
              >
                {item.label}
              </Link>
            )
          )}
        </div>

        <div className="hidden items-center gap-2 md:flex">
          {isLoading ? null : user ? (
            <>
              <Button asChild variant="ghost">
                <Link to={dashboardHref}>Paneli</Link>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2">
                    <User className="size-4" />
                    {user.name}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 size-4" />
                    Dilni
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button asChild variant="ghost">
                <Link to="/login">Hyni</Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/signup">Regjistrohu</Link>
              </Button>
              <Button asChild>
                <Link to="/jobs">
                  <Search data-icon="inline-start" />
                  Gjej punë
                </Link>
              </Button>
            </>
          )}
        </div>

        <Button
          aria-expanded={isMenuOpen}
          aria-label={isMenuOpen ? 'Mbyll menunë' : 'Hap menunë'}
          className="md:hidden"
          onClick={() => setIsMenuOpen((current) => !current)}
          size="icon"
          variant="ghost"
        >
          {isMenuOpen ? <X /> : <Menu />}
        </Button>
      </nav>

      {isMenuOpen ? (
        <div className="border-t bg-background px-4 py-4 md:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-2">
            {navItems.map((item) =>
              item.href.startsWith('/#') ? (
                <a
                  className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  href={item.href}
                  key={item.href}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </a>
              ) : (
                <Link
                  className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  to={item.href}
                  key={item.href}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </Link>
              )
            )}
            {isLoading ? null : user ? (
              <>
                <Button asChild variant="ghost" className="mt-2">
                  <Link to={dashboardHref} onClick={() => setIsMenuOpen(false)}>
                    Paneli
                  </Link>
                </Button>
                <div className="mt-2 flex items-center gap-2 px-3 py-2">
                  <User className="size-4" />
                  <span className="text-sm font-medium">{user.name}</span>
                  <Button variant="ghost" size="sm" onClick={handleLogout} className="ml-auto">
                    <LogOut className="size-4" />
                  </Button>
                </div>
              </>
            ) : (
              <>
                <Button asChild variant="ghost" className="mt-2">
                  <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                    Hyni
                  </Link>
                </Button>
                <Button asChild variant="outline" className="mt-2">
                  <Link to="/signup" onClick={() => setIsMenuOpen(false)}>
                    Regjistrohu
                  </Link>
                </Button>
                <Button asChild className="mt-2">
                  <Link to="/jobs" onClick={() => setIsMenuOpen(false)}>
                    <Search data-icon="inline-start" />
                    Gjej punë
                  </Link>
                </Button>
              </>
            )}
          </div>
        </div>
      ) : null}
    </header>
  );
}
