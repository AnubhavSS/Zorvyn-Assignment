export interface Transaction {
  id: string;
  date: string; // ISO date
  description: string;
  amount: number; // always positive
  type: "income" | "expense";
  category: string; // "Food", "Housing", "Transport", "Entertainment", "Health", "Shopping", "Utilities", "Salary", "Freelance", "Investment"
}

export type Role = "admin" | "viewer";

export interface Filters {
  type: "all" | "income" | "expense";
  category: string;
  search: string;
  dateRange: {
    from?: string;
    to?: string;
  };
  sortBy: "date" | "amount";
  sortDir: "asc" | "desc";
}
