import React, { useMemo } from "react";
import { useStore } from "@/lib/store";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Lightbulb, TrendingDown, TrendingUp, AlertTriangle } from "lucide-react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { subMonths, isSameMonth, format } from "date-fns";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export default function Insights() {
  const { transactions } = useStore();

  const insights = useMemo(() => {
    const now = new Date();
    const prevMonthDate = subMonths(now, 1);
    
    let currentMonthExp = 0;
    let prevMonthExp = 0;
    let currentMonthInc = 0;
    let prevMonthInc = 0;

    const categoryExp: Record<string, number> = {};

    transactions.forEach(t => {
      const d = new Date(t.date);
      const isCurrent = isSameMonth(d, now);
      const isPrev = isSameMonth(d, prevMonthDate);

      if (t.type === "expense") {
        if (isCurrent) currentMonthExp += t.amount;
        if (isPrev) prevMonthExp += t.amount;
        
        categoryExp[t.category] = (categoryExp[t.category] || 0) + t.amount;
      } else {
        if (isCurrent) currentMonthInc += t.amount;
        if (isPrev) prevMonthInc += t.amount;
      }
    });

    const momChange = prevMonthExp > 0 
      ? ((currentMonthExp - prevMonthExp) / prevMonthExp) * 100 
      : 0;

    const topCategories = Object.entries(categoryExp)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    const highestCat = topCategories[0];
    const totalExpAllTime = Object.values(categoryExp).reduce((a,b) => a+b, 0);
    const highestCatPct = highestCat && totalExpAllTime > 0 ? (highestCat.value / totalExpAllTime) * 100 : 0;

    // Calculate savings rate trend (last 6 months)
    const savingsTrend = [];
    for (let i = 5; i >= 0; i--) {
      const targetMonth = subMonths(now, i);
      let inc = 0;
      let exp = 0;
      transactions.forEach(t => {
        const d = new Date(t.date);
        if (isSameMonth(d, targetMonth)) {
          if (t.type === "income") inc += t.amount;
          else exp += t.amount;
        }
      });
      const rate = inc > 0 ? ((inc - exp) / inc) * 100 : 0;
      savingsTrend.push({
        month: format(targetMonth, 'MMM'),
        rate: parseFloat(Math.max(0, rate).toFixed(1))
      });
    }

    return {
      currentMonthExp,
      prevMonthExp,
      momChange,
      topCategories,
      highestCat,
      highestCatPct,
      currentMonthInc,
      savingsTrend
    };
  }, [transactions]);

  const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

  return (
    <motion.div 
      variants={container} 
      initial="hidden" 
      animate="show"
      className="space-y-6"
    >
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Insights</h1>
        <p className="text-muted-foreground mt-1">Smart observations about your spending habits.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div variants={item}>
          <Card className="bg-primary text-primary-foreground">
            <CardContent className="p-6">
              <Lightbulb className="w-8 h-8 mb-4 opacity-80" />
              <h3 className="text-lg font-semibold mb-2">Primary Expense</h3>
              <p className="text-primary-foreground/80 text-sm">
                You spend most of your money on <strong className="text-white">{insights.highestCat?.name || "N/A"}</strong>, 
                making up {insights.highestCatPct.toFixed(1)}% of your total lifetime expenses.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card>
            <CardContent className="p-6">
              {insights.momChange > 0 ? (
                <TrendingUp className="w-8 h-8 mb-4 text-destructive" />
              ) : (
                <TrendingDown className="w-8 h-8 mb-4 text-emerald-500" />
              )}
              <h3 className="text-lg font-semibold mb-2">Month over Month</h3>
              <p className="text-muted-foreground text-sm">
                Your expenses are <strong className={insights.momChange > 0 ? "text-destructive" : "text-emerald-500"}>
                  {Math.abs(insights.momChange).toFixed(1)}% {insights.momChange > 0 ? "higher" : "lower"}
                </strong> than last month.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card>
            <CardContent className="p-6">
              <AlertTriangle className="w-8 h-8 mb-4 text-amber-500" />
              <h3 className="text-lg font-semibold mb-2">Savings Check</h3>
              <p className="text-muted-foreground text-sm">
                {insights.currentMonthExp > insights.currentMonthInc ? (
                  "You are currently spending more than you earn this month. Time to review the budget."
                ) : (
                  "Great job! You are living within your means this month."
                )}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div variants={item}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Top Spending Categories</CardTitle>
              <CardDescription>Where your money goes (All Time)</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={insights.topCategories}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="hsl(var(--border))" />
                  <XAxis type="number" stroke="hsl(var(--muted-foreground))" tickFormatter={(val) => `$${val}`} fontSize={12} />
                  <YAxis dataKey="name" type="category" stroke="hsl(var(--foreground))" fontWeight={500} fontSize={12} />
                  <Tooltip 
                    cursor={{ fill: 'hsl(var(--muted))' }}
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                    formatter={(value: number) => [`$${value}`, 'Total Spent']}
                  />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={24}>
                    {insights.topCategories.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Savings Rate Trend</CardTitle>
              <CardDescription>Your savings percentage over time</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={insights.savingsTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `${val}%`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                    itemStyle={{ color: 'hsl(var(--foreground))' }}
                    formatter={(value: number) => [`${value}%`, 'Savings Rate']}
                  />
                  <Line type="monotone" dataKey="rate" stroke="hsl(var(--accent))" strokeWidth={3} dot={{ fill: 'hsl(var(--accent))', r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
