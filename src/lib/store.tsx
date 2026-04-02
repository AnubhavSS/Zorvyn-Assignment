import React, { createContext, useContext, useEffect, useState } from "react";
import { Transaction, Role, Filters } from "./types";
import { initialMockTransactions } from "./mock-data";

interface StoreContextType {
  transactions: Transaction[];
  addTransaction: (t: Omit<Transaction, "id">) => void;
  updateTransaction: (id: string, t: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  role: Role;
  setRole: (r: Role) => void;
  theme: "light" | "dark";
  setTheme: (t: "light" | "dark") => void;
}

const StoreContext = createContext<StoreContextType | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [role, setRole] = useState<Role>("admin");
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const savedTransactions = localStorage.getItem("fin-transactions");
    if (savedTransactions) {
      try {
        setTransactions(JSON.parse(savedTransactions));
      } catch (e) {
        setTransactions(initialMockTransactions);
      }
    } else {
      setTransactions(initialMockTransactions);
    }

    const savedRole = localStorage.getItem("fin-role") as Role | null;
    if (savedRole) setRole(savedRole);

    const savedTheme = localStorage.getItem("fin-theme") as "light" | "dark" | null;
    if (savedTheme) {
      setTheme(savedTheme);
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setTheme(prefersDark ? "dark" : "light");
    }
    
    setInitialized(true);
  }, []);

  useEffect(() => {
    if (!initialized) return;
    localStorage.setItem("fin-transactions", JSON.stringify(transactions));
  }, [transactions, initialized]);

  useEffect(() => {
    if (!initialized) return;
    localStorage.setItem("fin-role", role);
  }, [role, initialized]);

  useEffect(() => {
    if (!initialized) return;
    localStorage.setItem("fin-theme", theme);
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
  }, [theme, initialized]);

  const addTransaction = (t: Omit<Transaction, "id">) => {
    const newT: Transaction = { ...t, id: Math.random().toString(36).substring(2, 9) };
    setTransactions(prev => [newT, ...prev]);
  };

  const updateTransaction = (id: string, t: Partial<Transaction>) => {
    setTransactions(prev => prev.map(pt => pt.id === id ? { ...pt, ...t } : pt));
  };

  const deleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  if (!initialized) return null;

  return (
    <StoreContext.Provider value={{
      transactions,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      role,
      setRole,
      theme,
      setTheme
    }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) throw new Error("useStore must be used within StoreProvider");
  return context;
}
