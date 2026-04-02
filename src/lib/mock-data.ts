import { Transaction } from "./types";

export const CATEGORIES = [
  "Food",
  "Housing",
  "Transport",
  "Entertainment",
  "Health",
  "Shopping",
  "Utilities",
  "Salary",
  "Freelance",
  "Investment"
];

function randomDate(start: Date, end: Date) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function generateMockTransactions(): Transaction[] {
  const transactions: Transaction[] = [];
  const now = new Date();
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(now.getMonth() - 6);

  // Salaries
  for (let i = 0; i < 6; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    transactions.push({
      id: `mock-sal-${i}`,
      date: d.toISOString(),
      description: "Monthly Salary",
      amount: 4500,
      type: "income",
      category: "Salary"
    });
  }

  // Random expenses
  const expenses = [
    { desc: "Groceries", cat: "Food", min: 50, max: 200 },
    { desc: "Dinner at Restaurant", cat: "Food", min: 40, max: 120 },
    { desc: "Uber Ride", cat: "Transport", min: 10, max: 40 },
    { desc: "Gas Station", cat: "Transport", min: 30, max: 60 },
    { desc: "Movie Tickets", cat: "Entertainment", min: 20, max: 50 },
    { desc: "Netflix Subscription", cat: "Entertainment", min: 15, max: 15 },
    { desc: "Pharmacy", cat: "Health", min: 20, max: 100 },
    { desc: "Clothes", cat: "Shopping", min: 50, max: 300 },
    { desc: "Amazon Purchase", cat: "Shopping", min: 20, max: 150 },
    { desc: "Electric Bill", cat: "Utilities", min: 80, max: 150 },
    { desc: "Internet Bill", cat: "Utilities", min: 60, max: 80 },
    { desc: "Rent", cat: "Housing", min: 1500, max: 1500 },
  ];

  for (let i = 0; i < 40; i++) {
    const template = expenses[Math.floor(Math.random() * expenses.length)];
    const amount = Math.floor(Math.random() * (template.max - template.min + 1)) + template.min;
    transactions.push({
      id: `mock-exp-${i}`,
      date: randomDate(sixMonthsAgo, now).toISOString(),
      description: template.desc,
      amount,
      type: "expense",
      category: template.cat
    });
  }

  return transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export const initialMockTransactions = generateMockTransactions();
