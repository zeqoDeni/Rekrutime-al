// Authentication service for handling JWT-style tokens
import { AuthToken, User } from '../types/api';

const TOKEN_STORAGE_KEY = 'rekrutime_auth_token';
const USER_STORAGE_KEY = 'rekrutime_auth_user';

export class TokenManager {
  static saveToken(token: AuthToken): void {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(token));
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(token.user));
      } catch (error) {
        console.error('Error saving token:', error);
      }
    }
  }

  static getToken(): AuthToken | null {
    if (typeof window === 'undefined') return null;
    try {
      const token = localStorage.getItem(TOKEN_STORAGE_KEY);
      return token ? (JSON.parse(token) as AuthToken) : null;
    } catch (error) {
      console.error('Error retrieving token:', error);
      return null;
    }
  }

  static getUser(): User | null {
    if (typeof window === 'undefined') return null;
    try {
      const user = localStorage.getItem(USER_STORAGE_KEY);
      return user ? (JSON.parse(user) as User) : null;
    } catch (error) {
      console.error('Error retrieving user:', error);
      return null;
    }
  }

  static isTokenValid(): boolean {
    const token = TokenManager.getToken();
    if (!token) return false;

    const expiresAt = new Date(token.expiresAt);
    const now = new Date();

    return now < expiresAt;
  }

  static clearToken(): void {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        localStorage.removeItem(USER_STORAGE_KEY);
      } catch (error) {
        console.error('Error clearing token:', error);
      }
    }
  }

  static refreshToken(): AuthToken | null {
    const token = TokenManager.getToken();
    if (!token) return null;

    // Extend expiration by 7 more days
    const newToken: AuthToken = {
      ...token,
      expiresAt: new Date(
        Date.now() + 7 * 24 * 60 * 60 * 1000
      ).toISOString(),
    };

    TokenManager.saveToken(newToken);
    return newToken;
  }

  static getTokenExpiresIn(): number {
    const token = TokenManager.getToken();
    if (!token) return 0;

    const expiresAt = new Date(token.expiresAt);
    const now = new Date();
    const secondsLeft = (expiresAt.getTime() - now.getTime()) / 1000;

    return Math.max(0, secondsLeft);
  }
}

export class AuthService {
  static isAuthenticated(): boolean {
    return TokenManager.isTokenValid();
  }

  static getCurrentUser(): User | null {
    if (!TokenManager.isTokenValid()) {
      TokenManager.clearToken();
      return null;
    }

    return TokenManager.getUser();
  }

  static logout(): void {
    TokenManager.clearToken();
  }

  /**
   * Setup auto-logout when token expires
   */
  static setupTokenExpiration(onExpiry?: () => void): () => void {
    const checkExpiry = () => {
      if (!TokenManager.isTokenValid()) {
        AuthService.logout();
        onExpiry?.();
      }
    };

    // Check every minute if token is still valid
    const interval = setInterval(checkExpiry, 60000);

    return () => clearInterval(interval);
  }
}
