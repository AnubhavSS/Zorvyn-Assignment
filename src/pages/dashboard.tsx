import React, { useMemo } from "react";
import { useStore } from "@/lib/store";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts";
import { ArrowUpRight, ArrowDownRight, Wallet, TrendingUp, DollarSign } from "lucide-react";
import { format, subMonths, isSameMonth, parseISO } from "date-fns";

import { AnimatedCounter } from "@/components/ui/animated-counter";

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

export default function Dashboard() {
  const { transactions } = useStore();

  const stats = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    let totalBalance = 0;
    let monthlyIncome = 0;
    let monthlyExpenses = 0;

    transactions.forEach(t => {
      const d = new Date(t.date);
      if (t.type === "income") {
        totalBalance += t.amount;
        if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
          monthlyIncome += t.amount;
        }
      } else {
        totalBalance -= t.amount;
        if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
          monthlyExpenses += t.amount;
        }
      }
    });

    const savingsRate = monthlyIncome > 0 
      ? Math.max(0, ((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100).toFixed(1)
      : "0.0";

    return { totalBalance, monthlyIncome, monthlyExpenses, savingsRate };
  }, [transactions]);

  const trendData = useMemo(() => {
    const data = [];
    const now = new Date();
    let runningBalance = 0;

    // Calculate initial balance 6 months ago
    const sixMonthsAgo = subMonths(now, 5);
    transactions.forEach(t => {
      const d = new Date(t.date);
      if (d < sixMonthsAgo) {
        runningBalance += (t.type === "income" ? t.amount : -t.amount);
      }
    });

    for (let i = 5; i >= 0; i--) {
      const targetMonth = subMonths(now, i);
      
      const monthTx = transactions.filter(t => {
        const d = new Date(t.date);
        return d.getMonth() === targetMonth.getMonth() && d.getFullYear() === targetMonth.getFullYear();
      });

      monthTx.forEach(t => {
        runningBalance += (t.type === "income" ? t.amount : -t.amount);
      });

      data.push({
        month: format(targetMonth, 'MMM'),
        balance: runningBalance
      });
    }

    return data;
  }, [transactions]);

  const categoryData = useMemo(() => {
    const expenses = transactions.filter(t => t.type === "expense");
    const grouped: Record<string, number> = {};
    expenses.forEach(t => {
      grouped[t.category] = (grouped[t.category] || 0) + t.amount;
    });

    return Object.entries(grouped)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5); // top 5
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
        <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
        <p className="text-muted-foreground mt-1">Your financial summary at a glance.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div variants={item}>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Balance</p>
                  <h2 className="text-3xl font-bold mt-2">
                    <AnimatedCounter value={stats.totalBalance} prefix="₹" decimals={0} />
                  </h2>
                </div>
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Wallet className="w-6 h-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Monthly Income</p>
                  <h2 className="text-3xl font-bold mt-2">
                    <AnimatedCounter value={stats.monthlyIncome} prefix="₹" decimals={0} />
                  </h2>
                </div>
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center">
                  <ArrowUpRight className="w-6 h-6 text-emerald-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Monthly Expenses</p>
                  <h2 className="text-3xl font-bold mt-2">
                    <AnimatedCounter value={stats.monthlyExpenses} prefix="₹" decimals={0} />
                  </h2>
                </div>
                <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
                  <ArrowDownRight className="w-6 h-6 text-destructive" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Savings Rate</p>
                  <h2 className="text-3xl font-bold mt-2">
                    <AnimatedCounter value={Number(stats.savingsRate)} suffix="%" decimals={1} />
                  </h2>
                </div>
                <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div variants={item} className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Balance Trend</CardTitle>
              <CardDescription>Your total balance over the last 6 months</CardDescription>
            </CardHeader>
            <CardContent className="h-75">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val}`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                    itemStyle={{ color: 'hsl(var(--foreground))' }}
                  />
                  <Area type="monotone" dataKey="balance" stroke="hsl(var(--primary))" strokeWidth={2} fillOpacity={1} fill="url(#colorBalance)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Spending</CardTitle>
              <CardDescription>Top expense categories</CardDescription>
            </CardHeader>
            <CardContent className="h-75 flex flex-col justify-center">
              {categoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number) => `₹${value}`}
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                  <DollarSign className="h-8 w-8 mb-2 opacity-20" />
                  <p>No spending data</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div variants={item}>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>Your latest 5 transactions</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {transactions.slice(0, 5).map(tx => (
                <div key={tx.id} className="flex items-center justify-between p-3 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center",
                      tx.type === "income" ? "bg-emerald-500/10 text-emerald-500" : "bg-destructive/10 text-destructive"
                    )}>
                      {tx.type === "income" ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                    </div>
                    <div>
                      <p className="font-medium text-sm leading-none">{tx.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">{format(parseISO(tx.date), 'MMM d, yyyy')} • {tx.category}</p>
                    </div>
                  </div>
                  <div className={cn(
                    "font-medium",
                    tx.type === "income" ? "text-emerald-500" : "text-foreground"
                  )}>
                    {tx.type === "income" ? "+" : "-"}₹{tx.amount.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
