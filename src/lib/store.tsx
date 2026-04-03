
import { Transaction, Role, Filters } from "./types";
import { initialMockTransactions } from "./mock-data";
import {create} from "zustand";

interface StoreState {
  transactions: Transaction[];
  role: Role;
  theme: "light" | "dark";

  // actions
  addTransaction: (t: Omit<Transaction, "id">) => void;
  updateTransaction: (id: string, t: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;

  setRole: (r: Role) => void;
  setTheme: (t: "light" | "dark") => void;

  initialize: () => void;
}

export const useStore = create<StoreState>((set, get) => ({
  transactions: [],
  role: "admin",
  theme: "light",

  // --- INIT (like your useEffect) ---
  initialize: () => {
    try {
      const savedTransactions = localStorage.getItem("fin-transactions");
      const savedRole = localStorage.getItem("fin-role") as Role | null;
      const savedTheme = localStorage.getItem("fin-theme") as "light" | "dark" | null;

      set({
        transactions: savedTransactions
          ? JSON.parse(savedTransactions)
          : initialMockTransactions,
        role: savedRole || "admin",
        theme:
          savedTheme ||
          (window.matchMedia("(prefers-color-scheme: dark)").matches
            ? "dark"
            : "light"),
      });

      // apply theme immediately
      const root = document.documentElement;
      root.classList.remove("light", "dark");
      root.classList.add(get().theme);

    } catch {
      set({ transactions: initialMockTransactions });
    }
  },

  // --- TRANSACTIONS ---
  addTransaction: (t) => {
    const newT: Transaction = {
      ...t,
      id: Math.random().toString(36).substring(2, 9),
    };

    const updated = [newT, ...get().transactions];

    set({ transactions: updated });
    localStorage.setItem("fin-transactions", JSON.stringify(updated));
  },

  updateTransaction: (id, t) => {
    const updated = get().transactions.map((pt) =>
      pt.id === id ? { ...pt, ...t } : pt
    );

    set({ transactions: updated });
    localStorage.setItem("fin-transactions", JSON.stringify(updated));
  },

  deleteTransaction: (id) => {
    const updated = get().transactions.filter((t) => t.id !== id);

    set({ transactions: updated });
    localStorage.setItem("fin-transactions", JSON.stringify(updated));
  },

  // --- ROLE ---
  setRole: (role) => {
    set({ role });
    localStorage.setItem("fin-role", role);
  },

  // --- THEME ---
  setTheme: (theme) => {
    set({ theme });
    localStorage.setItem("fin-theme", theme);

    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
  },
}));