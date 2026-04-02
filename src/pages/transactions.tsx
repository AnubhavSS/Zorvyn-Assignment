import React, { useState, useMemo } from "react";
import { useStore } from "@/lib/store";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, Search, Filter, Download, FileText,
  ArrowUpRight, ArrowDownRight, MoreHorizontal,
  Edit2, Trash2, ArrowUpDown
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { CATEGORIES } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export default function Transactions() {
  const { transactions, role, addTransaction, updateTransaction, deleteTransaction } = useStore();
  
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState<"date" | "amount">("date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<any>(null);

  // Form state
  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    type: "expense",
    category: CATEGORIES[0],
    date: new Date().toISOString().split('T')[0]
  });

  const filteredTransactions = useMemo(() => {
    let result = transactions.filter(t => {
      const matchSearch = t.description.toLowerCase().includes(search.toLowerCase());
      const matchType = typeFilter === "all" || t.type === typeFilter;
      const matchCat = categoryFilter === "all" || t.category === categoryFilter;
      return matchSearch && matchType && matchCat;
    });

    result.sort((a, b) => {
      let comparison = 0;
      if (sortBy === "date") {
        comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
      } else {
        comparison = a.amount - b.amount;
      }
      return sortDir === "asc" ? comparison : -comparison;
    });

    return result;
  }, [transactions, search, typeFilter, categoryFilter, sortBy, sortDir]);

  const handleExport = () => {
    const headers = ["ID", "Date", "Type", "Category", "Description", "Amount"];
    const csvContent = [
      headers.join(","),
      ...filteredTransactions.map(t => 
        `${t.id},${t.date},${t.type},${t.category},"${t.description}",${t.amount}`
      )
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `transactions_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSave = () => {
    if (!formData.description || !formData.amount || isNaN(Number(formData.amount))) return;

    const payload = {
      description: formData.description,
      amount: Number(formData.amount),
      type: formData.type as "income" | "expense",
      category: formData.category,
      date: new Date(formData.date).toISOString()
    };

    if (editingTx) {
      updateTransaction(editingTx.id, payload);
    } else {
      addTransaction(payload);
    }
    setIsFormOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setEditingTx(null);
    setFormData({
      description: "",
      amount: "",
      type: "expense",
      category: CATEGORIES[0],
      date: new Date().toISOString().split('T')[0]
    });
  };

  const openEdit = (tx: any) => {
    setEditingTx(tx);
    setFormData({
      description: tx.description,
      amount: tx.amount.toString(),
      type: tx.type,
      category: tx.category,
      date: tx.date.split('T')[0]
    });
    setIsFormOpen(true);
  };

  const toggleSort = (field: "date" | "amount") => {
    if (sortBy === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortDir("desc");
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
          <p className="text-muted-foreground mt-1">Manage and view your financial history.</p>
        </div>
        
        {role === "admin" && (
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleExport} data-testid="btn-export">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button onClick={() => setIsFormOpen(true)} data-testid="btn-add-tx">
              <Plus className="w-4 h-4 mr-2" />
              Add Record
            </Button>
          </div>
        )}
      </div>

      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search transactions..." 
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                data-testid="input-search-tx"
              />
            </div>
            
            <div className="flex w-full sm:w-auto items-center gap-2 flex-wrap">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[110px]">
                  <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="income">Income</SelectItem>
                  <SelectItem value="expense">Expense</SelectItem>
                </SelectContent>
              </Select>

              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="rounded-md border border-border">
            <div className="grid grid-cols-12 gap-4 p-4 font-medium text-sm text-muted-foreground border-b border-border bg-muted/40">
              <div className="col-span-5 sm:col-span-4">Description</div>
              <div className="col-span-3 hidden sm:block">Category</div>
              <div 
                className="col-span-4 sm:col-span-3 flex items-center gap-1 cursor-pointer hover:text-foreground select-none"
                onClick={() => toggleSort("date")}
              >
                Date <ArrowUpDown className="w-3 h-3" />
              </div>
              <div 
                className="col-span-3 sm:col-span-2 flex items-center justify-end gap-1 cursor-pointer hover:text-foreground select-none"
                onClick={() => toggleSort("amount")}
              >
                <ArrowUpDown className="w-3 h-3" /> Amount
              </div>
            </div>
            
            <div className="divide-y divide-border">
              <AnimatePresence>
                {filteredTransactions.length > 0 ? (
                  filteredTransactions.map(tx => (
                    <motion.div 
                      key={tx.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-muted/50 transition-colors text-sm"
                    >
                      <div className="col-span-5 sm:col-span-4 flex items-center gap-3 overflow-hidden">
                        <div className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center shrink-0 hidden sm:flex",
                          tx.type === "income" ? "bg-emerald-500/10 text-emerald-500" : "bg-destructive/10 text-destructive"
                        )}>
                          {tx.type === "income" ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                        </div>
                        <span className="font-medium truncate">{tx.description}</span>
                      </div>
                      
                      <div className="col-span-3 hidden sm:block text-muted-foreground truncate">
                        {tx.category}
                      </div>
                      
                      <div className="col-span-4 sm:col-span-3 text-muted-foreground">
                        {format(parseISO(tx.date), 'MMM d, yyyy')}
                      </div>
                      
                      <div className="col-span-3 sm:col-span-2 flex items-center justify-end gap-2">
                        <span className={cn(
                          "font-medium whitespace-nowrap",
                          tx.type === "income" ? "text-emerald-500" : ""
                        )}>
                          {tx.type === "income" ? "+" : "-"}${tx.amount.toLocaleString()}
                        </span>
                        
                        {role === "admin" && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="w-8 h-8 -mr-2 shrink-0">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => openEdit(tx)} data-testid={`edit-tx-${tx.id}`}>
                                <Edit2 className="w-4 h-4 mr-2" /> Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                                onClick={() => deleteTransaction(tx.id)}
                                data-testid={`delete-tx-${tx.id}`}
                              >
                                <Trash2 className="w-4 h-4 mr-2" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="p-12 text-center text-muted-foreground flex flex-col items-center">
                    <FileText className="w-12 h-12 mb-4 opacity-20" />
                    <p className="text-lg font-medium text-foreground">No transactions found</p>
                    <p className="text-sm">Try adjusting your filters or search query.</p>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isFormOpen} onOpenChange={(open) => {
        setIsFormOpen(open);
        if (!open) resetForm();
      }}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingTx ? "Edit Transaction" : "New Transaction"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="type">Type</Label>
              <Select value={formData.type} onValueChange={(v) => setFormData({...formData, type: v})}>
                <SelectTrigger data-testid="select-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="income">Income</SelectItem>
                  <SelectItem value="expense">Expense</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="desc">Description</Label>
              <Input 
                id="desc" 
                value={formData.description} 
                onChange={(e) => setFormData({...formData, description: e.target.value})} 
                placeholder="e.g. Groceries"
                data-testid="input-desc"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="amount">Amount ($)</Label>
                <Input 
                  id="amount" 
                  type="number" 
                  min="0"
                  step="0.01"
                  value={formData.amount} 
                  onChange={(e) => setFormData({...formData, amount: e.target.value})} 
                  placeholder="0.00"
                  data-testid="input-amount"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="date">Date</Label>
                <Input 
                  id="date" 
                  type="date" 
                  value={formData.date} 
                  onChange={(e) => setFormData({...formData, date: e.target.value})} 
                  data-testid="input-date"
                />
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="category">Category</Label>
              <Select value={formData.category} onValueChange={(v) => setFormData({...formData, category: v})}>
                <SelectTrigger data-testid="select-category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFormOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} data-testid="btn-save-tx">Save Record</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
