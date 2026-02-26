import { createContext, useContext, useMemo, useState } from "react";

type AuthContextType = {
  adminToken: string;
  setAdminToken: (value: string) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [adminToken, setAdminTokenState] = useState<string>(localStorage.getItem("adminToken") || "");

  const setAdminToken = (value: string) => {
    setAdminTokenState(value);
    localStorage.setItem("adminToken", value);
  };

  const value = useMemo(() => ({ adminToken, setAdminToken }), [adminToken]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
