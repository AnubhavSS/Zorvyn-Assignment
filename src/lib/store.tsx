
import { Transaction, Role, Filters } from "./types";
import { initialMockTransactions } from "./mock-data";
import {create} from "zustand";

/**
 * Represents the state and actions of the application store.
 */
interface StoreState {
  /** Array of all financial transactions */
  transactions: Transaction[];
  /** Current user role determining access levels */
  role: Role;
  /** UI color theme preference */
  theme: "light" | "dark";

  // actions
  /** Adds a new transaction with an auto-generated ID */
  addTransaction: (t: Omit<Transaction, "id">) => void;
  /** Updates specific fields of an existing transaction */
  updateTransaction: (id: string, t: Partial<Transaction>) => void;
  /** Removes a transaction from the store and storage */
  deleteTransaction: (id: string) => void;

  /** Updates the user role and persists it */
  setRole: (r: Role) => void;
  /** Updates the theme, persists it, and applies it to the DOM */
  setTheme: (t: "light" | "dark") => void;

  /** Hydrates the store from localStorage and sets initial theme */
  initialize: () => void;
}

/**
 * Main application store using Zustand for state management.
 * Handles transactions, user roles, and theme preferences with localStorage persistence.
 */
export const useStore = create<StoreState>((set, get) => ({
  transactions: [],
  role: "admin",
  theme: "light",

  /**
   * Initializes the store by loading saved data from localStorage.
   * Also handles system theme detection if no preference is saved.
   */
  initialize: () => {
    try {
      const savedTransactions = localStorage.getItem("fin-transactions");
      const savedRole = localStorage.getItem("fin-role") as Role | null;
      const savedTheme = localStorage.getItem("fin-theme") as "light" | "dark" | null;

      // Determine initial state values
      const initialTransactions = savedTransactions
        ? JSON.parse(savedTransactions)
        : initialMockTransactions;
      
      const initialRole = savedRole || "admin";
      
      const initialTheme = savedTheme ||
        (window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light");

      set({
        transactions: initialTransactions,
        role: initialRole,
        theme: initialTheme,
      });

      // Apply theme class to document root for CSS targeting
      const root = document.documentElement;
      root.classList.remove("light", "dark");
      root.classList.add(initialTheme);

    } catch (error) {
      console.error("Failed to initialize store:", error);
      set({ transactions: initialMockTransactions });
    }
  },

  /**
   * Creates a new transaction entry.
   * @param t - Transaction data without the ID
   */
  addTransaction: (t) => {
    const newT: Transaction = {
      ...t,
      // Generate a simple unique ID
      id: Math.random().toString(36).substring(2, 9),
    };

    const updated = [newT, ...get().transactions];

    set({ transactions: updated });
    localStorage.setItem("fin-transactions", JSON.stringify(updated));
  },

  /**
   * Updates an existing transaction's properties.
   * @param id - The ID of the transaction to update
   * @param t - Partial transaction data to merge
   */
  updateTransaction: (id, t) => {
    const updated = get().transactions.map((pt) =>
      pt.id === id ? { ...pt, ...t } : pt
    );

    set({ transactions: updated });
    localStorage.setItem("fin-transactions", JSON.stringify(updated));
  },

  /**
   * Deletes a transaction by its ID.
   * @param id - The ID of the transaction to remove
   */
  deleteTransaction: (id) => {
    const updated = get().transactions.filter((t) => t.id !== id);

    set({ transactions: updated });
    localStorage.setItem("fin-transactions", JSON.stringify(updated));
  },

  /**
   * Updates the global user role.
   * @param role - The new role to assign
   */
  setRole: (role) => {
    set({ role });
    localStorage.setItem("fin-role", role);
  },

  /**
   * Updates the UI theme and applies it to the document.
   * @param theme - 'light' or 'dark'
   */
  setTheme: (theme) => {
    set({ theme });
    localStorage.setItem("fin-theme", theme);

    // Update DOM class for Tailwind or global CSS
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
  },
}));
