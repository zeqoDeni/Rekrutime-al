import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2, Lock, Mail, User } from 'lucide-react';
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

type AccountType = 'candidate' | 'employer';

const ACCOUNT_TYPES: { value: AccountType; label: string; desc: string }[] = [
  { value: 'candidate', label: 'Kandidat', desc: 'Po kërkoj punë' },
  { value: 'employer', label: 'Punëdhënës', desc: 'Po punësoj' },
];

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState<AccountType>('candidate');
  const [error, setError] = useState('');
  const [googleLoading, setGoogleLoading] = useState(false);
  const { signup, loginWithGoogle, isLoading, user } = useAuth();
  const navigate = useNavigate();

  // Navigate after redirect-based Google sign-in resolves
  useEffect(() => {
    if (user) navigate('/app/select-org');
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) {
      setError('Fjalëkalimi duhet të jetë së paku 6 karaktere.');
      return;
    }
    const result = await signup(email, password, name, userType);
    if (result.success) {
      window.location.replace('/app/select-org');
    } else {
      setError(result.error || 'Gabim gjatë regjistrimit. Provoni përsëri.');
    }
  };

  const handleGoogle = async () => {
    setError('');
    setGoogleLoading(true);
    const ok = await loginWithGoogle();
    // On success: loginWithGoogle() calls window.location.replace — page navigates away.
    // On failure: toast with the Firebase error code is already shown by AuthContext.
    if (!ok) setGoogleLoading(false);
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left — branding panel */}
      <div className="hidden lg:flex flex-col justify-between bg-gradient-to-br from-primary via-primary/90 to-indigo-700 p-12 text-white">
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-white/20 font-black text-white text-sm">R</div>
          <span className="text-lg font-bold tracking-tight">Rekrutime</span>
        </div>
        <div className="space-y-8">
          <div>
            <h2 className="text-3xl font-bold leading-snug">
              Nga aplikimi deri në punësim — gjithçka në një platformë.
            </h2>
            <p className="mt-4 text-white/70 text-base leading-relaxed">
              Bashkohuni me mijëra kandidatë dhe agjenci rekrutimi që tashmë e përdorin Rekrutime për të thjeshtëzuar procesin e punësimit.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {[
              { value: '8k+', label: 'Lidhje' },
              { value: '1.5k+', label: 'Role aktive' },
              { value: '10k+', label: 'Kandidatë' },
            ].map((s) => (
              <div key={s.label} className="rounded-xl bg-white/10 px-4 py-3 text-center">
                <div className="text-xl font-bold">{s.value}</div>
                <div className="text-xs text-white/70 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
        <p className="text-white/50 text-xs">© 2026 Rekrutime. Të gjitha të drejtat e rezervuara.</p>
      </div>

      {/* Right — form */}
      <div className="flex items-center justify-center px-6 py-12 bg-background">
        <div className="w-full max-w-sm space-y-6">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-md bg-primary font-black text-white text-xs">R</div>
            <span className="font-bold tracking-tight">Rekrutime</span>
          </div>

          <div>
            <h1 className="text-2xl font-bold text-foreground">Krijoni llogari</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Keni llogari?{' '}
              <Link to="/login" className="text-primary font-medium hover:underline">
                Hyni këtu
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
            Regjistrohuni me Google
          </Button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-background px-3 text-muted-foreground">ose me email</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Account type selector */}
            <div className="grid grid-cols-2 gap-2">
              {ACCOUNT_TYPES.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setUserType(t.value)}
                  className={[
                    'rounded-lg border px-3 py-2.5 text-left transition-colors',
                    userType === t.value
                      ? 'border-primary bg-primary/5 text-foreground'
                      : 'border-border hover:border-primary/40 text-muted-foreground',
                  ].join(' ')}
                >
                  <div className="text-sm font-semibold">{t.label}</div>
                  <div className="text-xs mt-0.5 opacity-70">{t.desc}</div>
                </button>
              ))}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="name">Emri dhe mbiemri</Label>
              <div className="relative">
                <User className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  id="name"
                  type="text"
                  placeholder="Arben Hoxha"
                  className="pl-9 h-11"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

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
                  placeholder="Minimum 6 karaktere"
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
              {isLoading
                ? <><Loader2 className="size-4 mr-2 animate-spin" />Duke regjistruar...</>
                : 'Krijoni llogari'}
            </Button>

            <p className="text-center text-xs text-muted-foreground">
              Duke u regjistruar, pranoni{' '}
              <span className="underline cursor-pointer">kushtet e përdorimit</span>.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
