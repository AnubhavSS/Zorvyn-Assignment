## Overview

This project is a finance dashboard application built to help users track, analyze, and understand their financial activity.

It provides:
- A clear financial summary
- Transaction management
- Spending insights
- Role-based UI simulation

## Tech Stack

- React + TypeScript
- Vite
- Tailwind CSS
- Radixui
- Zustand (State Management)
- Recharts (Charts & Visualization)

## Features

- **Dashboard** – Animated summary cards (Balance, Income, Expenses, Savings Rate), Balance Trend area chart, Spending breakdown pie chart
- **Transactions** – Full CRUD (Admin role), search/filter/sort, CSV export
- **Insights** – Spending analysis, top categories bar chart, Income vs Expense chart
- **Roles** – Switch between Admin and Viewer roles in the header
- **Dark Mode** – Toggle via the sun/moon icon in the header
- **Persistence** – All data saved to localStorage

## Design Approach

- Feature-based architecture for scalability
- Separation of concerns (UI vs logic)
- Reusable components using radix
- Global state management using Zustand
- Derived insights from data instead of hardcoding
- Local persistence to simulate real-world usage

## Project Structure
src/
├── pages/      
│   ├── dashboard.tsx           
│   ├── not-found.tsx                 
│   ├── transactions.tsx
│   └── insights.tsx
│       
│
├── components/
│   └── layout/
│       ├── Header.tsx           
│       ├── Shell.tsx        
│       ├── Sidebar.tsx      
|   └── ui/
│       ├── avatar.tsx           
│       ├── button.tsx        
│       ├── card.tsx  etc. 
|
│
├── lib/
│   ├── mockData.ts              
│   ├── store.tsx   
│   ├── types.ts      
│   ├── utils.tsx  
|
|        
├── App.tsx                     
├── index.css
└──main.tsx   

## Getting Started

```bash
npm install
npm run dev
```

Then open http://localhost:3000 in your browser.

## Build for Production

```bash
npm run build
npm run preview
```
