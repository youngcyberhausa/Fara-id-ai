import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { authApi, setAuthToken } from "./api";

const AuthContext = createContext(null);

const STORAGE_KEY = "faraid_token";

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(STORAGE_KEY) || null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(!!token);

  useEffect(() => {
    setAuthToken(token);
    if (token) {
      localStorage.setItem(STORAGE_KEY, token);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [token]);

  useEffect(() => {
    let cancelled = false;
    if (!token) {
      setLoading(false);
      return;
    }
    setLoading(true);
    authApi
      .me()
      .then((u) => {
        if (!cancelled) setUser(u);
      })
      .catch(() => {
        if (!cancelled) {
          setToken(null);
          setUser(null);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  const applyAuthResult = useCallback((res) => {
    setToken(res.access_token);
    setUser(res.user);
  }, []);

  const register = useCallback(
    async (email, password, name) => {
      const res = await authApi.register(email, password, name);
      applyAuthResult(res);
      return res;
    },
    [applyAuthResult]
  );

  const login = useCallback(
    async (email, password) => {
      const res = await authApi.login(email, password);
      applyAuthResult(res);
      return res;
    },
    [applyAuthResult]
  );

  const loginWithGoogle = useCallback(
    async (idToken) => {
      const res = await authApi.google(idToken);
      applyAuthResult(res);
      return res;
    },
    [applyAuthResult]
  );

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ token, user, loading, register, login, loginWithGoogle, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
