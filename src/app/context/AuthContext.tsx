import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useCallback,
} from "react";
import { User } from "@/lib/types/api";
import {
  login as firebaseLogin,
  loginWithGoogle as firebaseLoginWithGoogle,
  logout as firebaseLogout,
  observeAuthState,
  signup as firebaseSignup,
} from "@/lib/auth";
import { toast } from "sonner";

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  authError: string;
  login: (email: string, password: string) => Promise<boolean>;
  loginWithGoogle: () => Promise<boolean>;
  signup: (
    email: string,
    password: string,
    name: string,
    type: "employer" | "candidate"
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => void;
  refreshAuth: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState("");

  useEffect(() => {
    const unsubscribe = observeAuthState(
      (firebaseUser) => {
        setUser(firebaseUser);
        setIsLoading(false);
      },
      (error) => {
        console.error("Auth state error:", error);
        setIsLoading(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, []);

  const loginWithGoogle = useCallback(async (): Promise<boolean> => {
    setAuthError("");
    try {
      const googleUser = await firebaseLoginWithGoogle();
      setUser(googleUser);
      toast.success(`Mirë se u kthyet, ${googleUser.name}!`);
      window.location.replace("/app/select-org");
      return true;
    } catch (error: unknown) {
      // Show Firebase error code so we can diagnose the exact problem
      const code = (error as { code?: string }).code ?? "unknown";
      const message = `Hyrja me Google dështoi (${code})`;
      setAuthError(message);
      toast.error(message);
      return false;
    }
  }, []);

  const login = useCallback(
    async (email: string, password: string): Promise<boolean> => {
      setIsLoading(true);
      setAuthError("");
      try {
        const loggedInUser = await firebaseLogin(email, password);
        setUser(loggedInUser);
        toast.success(`Mirë se u kthyet, ${loggedInUser.name}!`);
        return true;
      } catch (error: unknown) {
        const message = getErrorMessage(error, "Gabim në kyçje");
        setAuthError(message);
        toast.error(message);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const signup = useCallback(
    async (
      email: string,
      password: string,
      name: string,
      type: "employer" | "candidate"
    ): Promise<{ success: boolean; error?: string }> => {
      setIsLoading(true);
      setAuthError("");
      try {
        const signedUpUser = await firebaseSignup(email, password, name, type);
        setUser(signedUpUser);
        toast.success(`Mirësevini ${signedUpUser.name}!`);
        return { success: true };
      } catch (error: unknown) {
        const message = getErrorMessage(error, "Gabim në regjistrimin");
        setAuthError(message);
        toast.error(message);
        return { success: false, error: message };
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const logout = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    try {
      await firebaseLogout();
      setUser(null);
      toast.success("Jeni kyçur me sukses");
    } catch (error: unknown) {
      console.error("Logout error:", error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateProfile = useCallback((updates: Partial<User>) => {
    setUser((currentUser) => {
      if (!currentUser) return currentUser;
      return { ...currentUser, ...updates };
    });
  }, []);

  const refreshAuth = useCallback(() => {
    // Auth refresh is handled by Firebase onAuthStateChanged observer.
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: user !== null,
        isLoading,
        authError,
        login,
        loginWithGoogle,
        signup,
        logout,
        updateProfile,
        refreshAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}