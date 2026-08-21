import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import { User } from "../types";
import { authService } from "../services/api";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role: "manager" | "agent") => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
  const [isLoading, setIsLoading] = useState(() => !!localStorage.getItem("token"));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (!storedToken) {
      return;
    }

    authService.getCurrentUser()
      .then((response) => {
        setUser(response.data.data.user);
      })
      .catch(() => {
        localStorage.removeItem("token");
        setToken(null);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await authService.login(email, password);
      setUser(response.data.data.user);
      setToken(response.data.data.token);
      localStorage.setItem("token", response.data.data.token);
    } catch (err: any) {
      setError(err.response?.data?.message || "Login failed");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (name: string, email: string, password: string, role: "manager" | "agent") => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await authService.register(name, email, password, role);
      setUser(response.data.data.user);
      setToken(response.data.data.token);
      localStorage.setItem("token", response.data.data.token);
    } catch (err: any) {
      setError(err.response?.data?.message || "Registration failed");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, isLoading, error, login, register, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
