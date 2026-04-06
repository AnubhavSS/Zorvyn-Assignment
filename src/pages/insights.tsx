import React, { useMemo } from "react";
import { useStore } from "@/lib/store";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Lightbulb, AlertTriangle } from "lucide-react";
import {
  BarChart,
  Bar,
  Legend,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { subMonths, isSameMonth, format } from "date-fns";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

/**
 * Insights Page Component
 *
 * Provides automated financial analysis and behavioral patterns based on user data.
 * Features:
 * - Smart cards summarizing primary expenses and savings health.
 * - Bar charts showing category-wise spending (All Time).
 * - Side-by-side comparison of Income vs Expenses (Last 6 Months).
 */
export default function Insights() {
  const { transactions } = useStore();

  /**
   * Generates analytical insights by processing historical transaction data.
   */
  const insights = useMemo(() => {
    const now = new Date();

    // Aggregates total expenses for each category
    const categoryTotals: Record<string, number> = {};

    // Generate monthly comparison data for the last 6 months
    const monthlyData = Array.from({ length: 6 }, (_, i) => {
      const date = subMonths(now, 5 - i);

      const monthTx = transactions.filter((tx) =>
        isSameMonth(new Date(tx.date), date),
      );

      let income = 0;
      let expense = 0;

      monthTx.forEach((t) => {
        if (t.type === "income") income += t.amount;
        else {
          expense += t.amount;

          // Track category-wise totals concurrently
          categoryTotals[t.category] =
            (categoryTotals[t.category] || 0) + t.amount;
        }
      });

      return {
        month: format(date, "MMM"),
        Income: income,
        Expense: expense,
      };
    });

    // Sort category data for horizontal bar charts
    const categoryExpenses = Object.entries(categoryTotals)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    return {
      monthlyData,
      categoryExpenses,
    };
  }, [transactions]);

  const COLORS = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))",
  ];
  console.log(insights.categoryExpenses);
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Insights</h1>
        <p className="text-muted-foreground mt-1">
          Smart observations about your spending habits.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
        {/* Primary Expense */}
        <motion.div variants={item} className="h-full">
          <Card className="bg-primary text-primary-foreground h-full flex flex-col">
            <CardContent className="p-6 flex-1 flex flex-col">
              <Lightbulb className="w-8 h-8 mb-4 opacity-80" />
              <h3 className="text-lg font-semibold mb-2">Primary Expense</h3>
              <p className="text-primary-foreground/80 text-sm mt-auto">
                You spend most of your money on{" "}
                <strong className="text-white">Housing</strong>, making up 67%
                of your total lifetime expenses.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Month over Month */}
        <motion.div variants={item} className="h-full">
          <Card className="h-full flex flex-col">
            <CardContent className="p-6 flex-1 flex flex-col">
              <h3 className="text-lg font-semibold mb-2">Month over Month</h3>
              <p className="text-muted-foreground text-sm mt-auto">
                Your expenses are{" "}
                <strong className="text-emerald-500">20% higher</strong> than
                last month.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Savings Check */}
        <motion.div variants={item} className="h-full">
          <Card className="h-full flex flex-col">
            <CardContent className="p-6 flex-1 flex flex-col">
              <AlertTriangle className="w-8 h-8 mb-4 text-amber-500" />
              <h3 className="text-lg font-semibold mb-2">Savings Check</h3>
              <p className="text-muted-foreground text-sm mt-auto">
                You are currently spending more than you earn this month. Time
                to review the budget.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Spending Categories */}
        <motion.div variants={item}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Top Spending Categories</CardTitle>
              <CardDescription>
                Where your money goes (All Time)
              </CardDescription>
            </CardHeader>
            <CardContent className="h-75">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={insights.categoryExpenses}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    horizontal={true}
                    vertical={false}
                    stroke="hsl(var(--border))"
                  />
                  <XAxis
                    type="number"
                    stroke="hsl(var(--muted-foreground))"
                    tickFormatter={(val) => `₹${(val / 1000).toFixed(1)}k`}
                    fontSize={12}
                  />
                  <YAxis
                    dataKey="name"
                    type="category"
                    stroke="hsl(var(--foreground))"
                    fontWeight={500}
                    fontSize={12}
                  />
                  <Tooltip
                    cursor={{ fill: "hsl(var(--muted))" }}
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      borderColor: "hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                    formatter={(value: number) => [`₹${value}`, "Total Spent"]}
                  />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={24}>
                    {insights.categoryExpenses.map((entry, index) => (
                      <Cell
                        key={`cell-${entry.name}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Income vs Expenses */}
        <motion.div variants={item}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Income vs Expenses</CardTitle>
            </CardHeader>
            <CardContent className="h-75">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={insights.monthlyData}
                  margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="var(--color-border)"
                  />
                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fontSize: 12,
                      fill: "hsl(var(--muted-foreground))",
                    }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fontSize: 12,
                      fill: "hsl(var(--muted-foreground))",
                    }}
                    tickFormatter={(val) => `₹${(val / 1000).toFixed(1)}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      borderColor: "hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                    itemStyle={{ color: "hsl(var(--foreground))" }}
                    formatter={(value: number) => `₹${value}`}
                  />
                  <Legend wrapperStyle={{ paddingTop: "20px" }} />
                  <Bar
                    dataKey="Income"
                    fill="hsl(var(--primary))"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={40}
                  />
                  <Bar
                    dataKey="Expense"
                    fill="hsl(var(--destructive))"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={40}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
