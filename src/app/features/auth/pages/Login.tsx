import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2, Lock, Mail } from 'lucide-react';
import { Button } from '@/app/shared/ui/button';
import { Input } from '@/app/shared/ui/input';
import { Label } from '@/app/shared/ui/label';
import { useAuth } from '@/app/context/AuthContext';

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [googleLoading, setGoogleLoading] = useState(false);
  const { login, loginWithGoogle, isLoading, user } = useAuth();
  const navigate = useNavigate();

  // Navigate after redirect-based Google sign-in resolves
  useEffect(() => {
    if (user) navigate('/app/select-org');
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const success = await login(email, password);
    if (success) {
      navigate('/app/select-org');
    } else {
      setError('Email ose fjalëkalim i gabuar.');
    }
  };

  const handleGoogle = async () => {
    setError('');
    setGoogleLoading(true);
    try {
      await loginWithGoogle(); // page navigates away to Google — no result here
    } catch {
      setGoogleLoading(false);
      setError('Hyrja me Google dështoi. Provoni përsëri.');
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left — branding panel */}
      <div className="hidden lg:flex flex-col justify-between bg-gradient-to-br from-primary via-primary/90 to-indigo-700 p-12 text-white">
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-white/20 font-black text-white text-sm">R</div>
          <span className="text-lg font-bold tracking-tight">Rekrutime</span>
        </div>
        <div className="space-y-6">
          <blockquote className="space-y-3">
            <p className="text-2xl font-semibold leading-snug">
              "Platforma na kurseu javë të tëra punë manuale — tani menaxhojmë 200+ kandidatë me lehtësi."
            </p>
            <footer className="text-white/70 text-sm">— Menaxhere Rekrutimi, Tiranë</footer>
          </blockquote>
          <div className="flex gap-6 text-sm text-white/80">
            <div><div className="text-2xl font-bold text-white">8k+</div>lidhje</div>
            <div><div className="text-2xl font-bold text-white">1.5k+</div>role aktive</div>
            <div><div className="text-2xl font-bold text-white">10k+</div>kandidatë</div>
          </div>
        </div>
        <p className="text-white/50 text-xs">© 2026 Rekrutime. Të gjitha të drejtat e rezervuara.</p>
      </div>

      {/* Right — form */}
      <div className="flex items-center justify-center px-6 py-12 bg-background">
        <div className="w-full max-w-sm space-y-6">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2 mb-2">
            <div className="flex size-7 items-center justify-center rounded-md bg-primary font-black text-white text-xs">R</div>
            <span className="font-bold tracking-tight">Rekrutime</span>
          </div>

          <div>
            <h1 className="text-2xl font-bold text-foreground">Hyrje në llogari</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Nuk keni llogari?{' '}
              <Link to="/signup" className="text-primary font-medium hover:underline">
                Regjistrohuni falas
              </Link>
            </p>
          </div>

          {/* Google button */}
          <Button
            type="button"
            variant="outline"
            className="w-full gap-2 h-11"
            onClick={handleGoogle}
            disabled={googleLoading || isLoading}
          >
            {googleLoading ? <Loader2 className="size-4 animate-spin" /> : <GoogleIcon />}
            Hyni me Google
          </Button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-background px-3 text-muted-foreground">ose vazhdoni me email</span>
            </div>
          </div>

          {/* Email/password form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="emer@shembull.com"
                  className="pl-9 h-11"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Fjalëkalimi</Label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="pl-9 h-11"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            {error && (
              <p className="text-sm text-destructive rounded-md bg-destructive/10 px-3 py-2">
                {error}
              </p>
            )}

            <Button type="submit" className="w-full h-11 text-base" disabled={isLoading || googleLoading}>
              {isLoading ? <><Loader2 className="size-4 mr-2 animate-spin" />Duke hyrë...</> : 'Hyni'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
