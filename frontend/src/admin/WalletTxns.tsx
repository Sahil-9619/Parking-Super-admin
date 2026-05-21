import { useState, useEffect } from 'react';
import { Wallet, ArrowDownLeft, ArrowUpRight, FileText, Calendar, User as UserIcon, ShieldAlert, ChevronDown, Check, Search, Download, Trash2, Eye } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/shared/dropdown-menu';
import { DataTable } from '@/components/shared/DataTable';
import { ServerPagination } from '@/components/shared/ServerPagination';
import { dbService } from '@/services/dbService';
import toast from 'react-hot-toast';

interface WalletTxn {
  id: string;
  userId: string;
  type: 'credit' | 'debit' | 'refund' | 'overstay_charge' | 'payout';
  amount: string;
  referenceId: string | null;
  referenceType: string | null;
  description: string;
  balanceAfter: string;
  createdAt: string;
  user?: {
    name: string;
    phone: string;
    email: string;
    userType: string;
  };
}

const WalletTxns = () => {
  const [transactions, setTransactions] = useState<WalletTxn[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('');
  const [refTypeFilter, setRefTypeFilter] = useState('');
  const [userIdFilter] = useState('');
  const [selectedTxn, setSelectedTxn] = useState<WalletTxn | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<any>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleDelete = () => {
    if (!selectedTxn) return;
    if (!confirmDelete) { setConfirmDelete(true); return; }
    setTransactions(prev => prev.filter(t => t.id !== selectedTxn.id));
    toast.success('Transaction record removed');
    setSelectedTxn(null);
    setConfirmDelete(false);
  };

  const exportToCSV = () => {
    if (transactions.length === 0) {
      toast.error("No transactions to export");
      return;
    }
    const headers = ["ID", "User Name", "User Email", "Type", "Amount (INR)", "Balance After", "Description", "Reference Type", "Reference ID", "Timestamp"];
    const rows = transactions.map(t => [
      t.id,
      t.user?.name || "N/A",
      t.user?.email || "N/A",
      t.type.toUpperCase(),
      t.amount,
      t.balanceAfter,
      t.description,
      t.referenceType || "N/A",
      t.referenceId || "N/A",
      new Date(t.createdAt).toLocaleString()
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.map(val => `"${val.toString().replace(/"/g, '""')}"`).join(","))].join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `financial_ledger_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Ledger exported successfully as CSV!");
  };

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await dbService.getTransactionLedger({
        page,
        limit: 10,
        search: searchQuery || undefined,
        userId: userIdFilter || undefined,
        type: typeFilter || undefined,
        referenceType: refTypeFilter || undefined,
      });
      setTransactions(response.data || []);
      setMeta(response.meta || null);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load transaction ledger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [page, typeFilter, refTypeFilter, userIdFilter, searchQuery]);

  useEffect(() => {
    const handleRefresh = () => fetchTransactions();
    window.addEventListener('refresh-data', handleRefresh);
    return () => window.removeEventListener('refresh-data', handleRefresh);
  }, [page, typeFilter, refTypeFilter, userIdFilter, searchQuery]);

  useEffect(() => {
    setPage(1);
  }, [typeFilter, refTypeFilter, userIdFilter, searchQuery]);

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-text-main tracking-tighter">Financial Audit Ledger</h2>
          <p className="text-[11px] text-text-muted font-bold uppercase tracking-[0.2em] mt-1">
            Immutable log of all user credit additions, parking debits, overstay charges, and partner payouts
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-2 bg-card-bg/40 backdrop-blur-md rounded-xl border border-border-color/30 h-[38px]">
            <Wallet className="h-4 w-4 text-emerald-500" />
            <span className="text-xs font-black text-text-main">
              Total Logs: {meta?.total || transactions.length}
            </span>
          </div>
          <Button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer h-[38px]"
          >
            <Download className="h-3.5 w-3.5" />
            Export CSV
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-card p-4 rounded-xl border border-border-main/50 shadow-sm items-end">
        <div>
          <label className="text-[10px] text-text-muted font-black uppercase tracking-wider block mb-1.5">
            Search Audit Log
          </label>
          <div className="relative group w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted transition-colors group-focus-within:text-primary z-10" size={15} />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, email, description..."
              className="pl-10 w-full h-11 bg-bg-main/50 border border-border-main/60 rounded-xl text-xs font-bold text-text-main focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary/50 focus:outline-none focus-visible:outline-none transition-all placeholder:text-text-muted/50"
            />
          </div>
        </div>
        <div>
          <label className="text-[10px] text-text-muted font-black uppercase tracking-wider block mb-1.5">
            Filter by Txn Type
          </label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="w-full h-11 bg-bg-main/50 border border-border-main/60 rounded-xl px-4 text-xs font-bold text-text-main hover:bg-bg-card hover:text-text-main transition-all justify-between group"
              >
                <span className="truncate">
                  {typeFilter === "" && "All Types"}
                  {typeFilter === "credit" && "Credit (Deposit)"}
                  {typeFilter === "debit" && "Debit (Payment)"}
                  {typeFilter === "refund" && "Refund (Credit)"}
                  {typeFilter === "overstay_charge" && "Overstay Charge (Debit)"}
                  {typeFilter === "payout" && "Payout (Debit)"}
                </span>
                <ChevronDown size={14} className="text-text-main opacity-50 group-hover:opacity-100 transition-opacity ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              className="w-[240px] bg-bg-card border border-border-main rounded-xl shadow-xl p-1 animate-in fade-in-0 zoom-in-95"
            >
              {[
                { value: "", label: "All Types" },
                { value: "credit", label: "Credit (Deposit)" },
                { value: "debit", label: "Debit (Payment)" },
                { value: "refund", label: "Refund (Credit)" },
                { value: "overstay_charge", label: "Overstay Charge (Debit)" },
                { value: "payout", label: "Payout (Debit)" }
              ].map((option) => (
                <DropdownMenuItem
                  key={option.value}
                  onClick={() => setTypeFilter(option.value)}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-widest cursor-pointer transition-colors ${typeFilter === option.value ? 'bg-primary/10 text-primary' : 'text-text-muted hover:bg-bg-main hover:text-text-main'}`}
                >
                  {option.label}
                  {typeFilter === option.value && <Check size={12} />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div>
          <label className="text-[10px] text-text-muted font-black uppercase tracking-wider block mb-1.5">
            Filter by Ref Type
          </label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="w-full h-11 bg-bg-main/50 border border-border-main/60 rounded-xl px-4 text-xs font-bold text-text-main hover:bg-bg-card hover:text-text-main transition-all justify-between group"
              >
                <span className="truncate">
                  {refTypeFilter === "" && "All References"}
                  {refTypeFilter === "booking" && "Bookings"}
                  {refTypeFilter === "dispute" && "Disputes"}
                  {refTypeFilter === "payout" && "Payouts"}
                  {refTypeFilter === "stripe" && "Stripe Gateway"}
                  {refTypeFilter === "admin" && "Admin Action"}
                </span>
                <ChevronDown size={14} className="text-text-main opacity-50 group-hover:opacity-100 transition-opacity ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              className="w-[240px] bg-bg-card border border-border-main rounded-xl shadow-xl p-1 animate-in fade-in-0 zoom-in-95"
            >
              {[
                { value: "", label: "All References" },
                { value: "booking", label: "Bookings" },
                { value: "dispute", label: "Disputes" },
                { value: "payout", label: "Payouts" },
                { value: "stripe", label: "Stripe Gateway" },
                { value: "admin", label: "Admin Action" }
              ].map((option) => (
                <DropdownMenuItem
                  key={option.value}
                  onClick={() => setRefTypeFilter(option.value)}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-widest cursor-pointer transition-colors ${refTypeFilter === option.value ? 'bg-primary/10 text-primary' : 'text-text-muted hover:bg-bg-main hover:text-text-main'}`}
                >
                  {option.label}
                  {refTypeFilter === option.value && <Check size={12} />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div>
          <Button
            variant="outline"
            onClick={() => {
              setSearchQuery("");
              setTypeFilter("");
              setRefTypeFilter("");
              toast.success("Filters cleared");
            }}
            className="w-full h-11 bg-bg-main/30 hover:bg-bg-main/80 text-text-muted hover:text-text-main border-border-main/60 hover:border-border-main rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer animate-fade-in"
          >
            Clear Filters
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <>
          <DataTable
            data={transactions}
            emptyStateIcon={Wallet}
            emptyStateTitle="No transactions found"
            emptyStateDescription="Try resetting your filters or adjusting your search query."
            columns={[
              {
                header: 'Sr No',
                textCenter: true,
                accessor: (_, index) => (
                  <span className="text-xs font-black text-text-muted">
                    {((page - 1) * 10 + index + 1).toString().padStart(2, '0')}
                  </span>
                ),
              },
              {
                header: 'User Account',
                accessor: (txn) => (
                  <div className="flex flex-col">
                    <span className="text-sm font-black text-text-main">
                      {txn.user?.name || 'Unknown Account'}
                    </span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[9px] font-black uppercase tracking-widest text-primary">
                        {txn.user?.userType || 'N/A'}
                      </span>
                      <span className="text-[10px] text-text-muted font-bold font-mono">
                        {txn.user?.email || 'N/A'}
                      </span>
                    </div>
                  </div>
                ),
              },
              {
                header: 'Type',
                textCenter: true,
                accessor: (txn) => {
                  const styles: Record<string, string> = {
                    credit: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
                    refund: 'bg-teal-500/10 text-teal-500 border-teal-500/20',
                    debit: 'bg-red-500/10 text-red-500 border-red-500/20',
                    overstay_charge: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
                    payout: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
                  };
                  return (
                    <span
                      className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all ${
                        styles[txn.type] || 'bg-text-muted/10 text-text-muted border-text-muted/20'
                      }`}
                    >
                      {txn.type.replace('_', ' ')}
                    </span>
                  );
                },
              },
              {
                header: 'Amount',
                accessor: (txn) => {
                  const isCredit = txn.type === 'credit' || txn.type === 'refund';
                  return (
                    <div className="flex items-center gap-1 text-sm font-black">
                      {isCredit ? (
                        <ArrowDownLeft className="h-4.5 w-4.5 text-emerald-500 stroke-[2.5]" />
                      ) : (
                        <ArrowUpRight className="h-4.5 w-4.5 text-red-500 stroke-[2.5]" />
                      )}
                      <span className={isCredit ? 'text-emerald-500' : 'text-red-500'}>
                        ₹{parseFloat(txn.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  );
                },
              },
              {
                header: 'Balance After',
                accessor: (txn) => (
                  <span className="text-xs font-black text-text-main/90 font-mono">
                    ₹{parseFloat(txn.balanceAfter).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                ),
              },
              {
                header: 'Description & Reference',
                accessor: (txn) => (
                  <div className="flex flex-col max-w-[280px]">
                    <span className="text-xs font-bold text-text-main line-clamp-1">
                      {txn.description}
                    </span>
                    {txn.referenceType && (
                      <span className="text-[9px] text-text-muted font-bold font-mono tracking-tighter mt-0.5">
                        Ref: {txn.referenceType.toUpperCase()} ({txn.referenceId?.slice(0, 8) || 'N/A'})
                      </span>
                    )}
                  </div>
                ),
              },
              {
                header: 'Timestamp',
                accessor: (txn) => (
                  <span className="text-xs font-bold text-text-muted">
                    {new Date(txn.createdAt).toLocaleString()}
                  </span>
                ),
              },
              {
                header: 'Actions',
                textCenter: true,
                accessor: (txn) => (
                  <button
                    onClick={() => setSelectedTxn(txn)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-primary hover:text-white bg-primary/5 hover:bg-primary border border-primary/20 hover:border-primary rounded-lg transition-all group"
                  >
                    <Eye className="h-3.5 w-3.5 transition-transform group-hover:scale-110" />
                    View
                  </button>
                ),
              },
            ]}
          />

          {meta && (
            <ServerPagination
              currentPage={page}
              totalPages={meta.totalPages}
              totalItems={meta.total}
              itemsPerPage={10}
              onPageChange={setPage}
            />
          )}
        </>
      )}

      {/* Details Modal — matches ViewModal / EditModal pattern */}
      <Dialog open={!!selectedTxn} onOpenChange={(open) => { if (!open) { setSelectedTxn(null); setConfirmDelete(false); } }}>
        <DialogContent
          style={{ backgroundColor: 'rgba(var(--bg-card-rgb), 0.98)' }}
          className="max-w-lg rounded-[2rem] border-border-main backdrop-blur-3xl p-0 overflow-hidden shadow-2xl shadow-black/20 animate-in fade-in zoom-in duration-300 [&>button]:hidden"
        >
          {/* Gradient header strip */}
          <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-primary/10 to-transparent -z-10 pointer-events-none" />

          <div className="p-7 space-y-5 max-h-[88vh] overflow-y-auto">
            {/* Header */}
            <DialogHeader className="flex flex-row items-center justify-between space-y-0">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-primary/10 rounded-2xl border border-primary/20">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-black text-text-main tracking-tight leading-none mb-1">
                    Ledger Deep Audit
                  </DialogTitle>
                  <span className="text-[9px] text-text-muted font-bold font-mono uppercase tracking-wider">
                    TXN_ID: {selectedTxn?.id}
                  </span>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => { setSelectedTxn(null); setConfirmDelete(false); }}
                className="rounded-xl border-border-main text-[9px] font-black uppercase tracking-widest h-9 px-5 hover:bg-bg-main transition-all shadow-sm"
              >
                Close
              </Button>
              <DialogDescription className="hidden">Ledger transaction audit record</DialogDescription>
            </DialogHeader>

            {selectedTxn && (
              <div className="space-y-4">
                {/* Amount hero */}
                <div className="p-4 bg-bg-main/60 rounded-2xl border border-border-main/40 flex justify-between items-center">
                  <span className="text-xs font-black text-text-muted uppercase tracking-wider">Transaction Amount</span>
                  <span className={`text-2xl font-black ${
                    selectedTxn.type === 'credit' || selectedTxn.type === 'refund' ? 'text-emerald-500' : 'text-red-500'
                  }`}>
                    {selectedTxn.type === 'credit' || selectedTxn.type === 'refund' ? '+' : '−'}₹
                    {parseFloat(selectedTxn.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                {/* Balance & Type */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 bg-bg-main/50 rounded-xl border border-border-main/30">
                    <span className="text-[10px] text-text-muted font-black uppercase tracking-wider block mb-1">Balance After</span>
                    <span className="text-sm font-black text-text-main font-mono">
                      ₹{parseFloat(selectedTxn.balanceAfter).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="p-3.5 bg-bg-main/50 rounded-xl border border-border-main/30">
                    <span className="text-[10px] text-text-muted font-black uppercase tracking-wider block mb-1">Txn Type</span>
                    <span className="text-xs font-black text-text-main uppercase tracking-widest">
                      {selectedTxn.type.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                {/* User Details */}
                <div className="p-4 bg-bg-main/50 rounded-2xl border border-border-main/30 space-y-3">
                  <div className="flex items-center gap-1.5 pb-2 border-b border-border-main/30">
                    <UserIcon className="h-3.5 w-3.5 text-primary" />
                    <span className="text-xs font-black text-text-muted uppercase tracking-wider">User Details</span>
                  </div>
                  <div className="space-y-2">
                    {[
                      { label: 'Account Holder', value: selectedTxn.user?.name || 'N/A' },
                      { label: 'Registered Email', value: selectedTxn.user?.email || 'N/A', mono: true },
                      { label: 'Contact Phone', value: selectedTxn.user?.phone || 'N/A', mono: true },
                      { label: 'Profile Type', value: selectedTxn.user?.userType || 'N/A', accent: true },
                    ].map(({ label, value, mono, accent }) => (
                      <div key={label} className="flex justify-between items-center text-xs font-bold">
                        <span className="text-text-muted">{label}</span>
                        <span className={`${mono ? 'font-mono' : ''} ${accent ? 'text-primary uppercase text-[10px] font-black' : 'text-text-main'}`}>{value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Reference Logs */}
                <div className="p-4 bg-bg-main/50 rounded-2xl border border-border-main/30 space-y-3">
                  <div className="flex items-center gap-1.5 pb-2 border-b border-border-main/30">
                    <ShieldAlert className="h-3.5 w-3.5 text-amber-500" />
                    <span className="text-xs font-black text-text-muted uppercase tracking-wider">Reference Logs</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-text-muted">Ref Type</span>
                      <span className="text-text-main uppercase font-mono">{selectedTxn.referenceType || 'None'}</span>
                    </div>
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-text-muted">Ref ID</span>
                      <span className="text-text-main font-mono text-[10.5px] select-all">{selectedTxn.referenceId || 'N/A'}</span>
                    </div>
                    <div className="flex flex-col gap-1 text-xs font-bold pt-2 border-t border-border-main/20">
                      <span className="text-text-muted">Description</span>
                      <span className="text-text-main bg-bg-main/80 p-2.5 rounded-xl border border-border-main/30 leading-relaxed">
                        {selectedTxn.description}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Timestamp */}
                <div className="flex items-center gap-2 text-[10px] text-text-muted font-bold justify-center pt-1">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>Audited on {new Date(selectedTxn.createdAt).toLocaleString()}</span>
                </div>

                {/* Delete action */}
                <div className="pt-1 border-t border-border-main/30 flex items-center gap-3">
                  <button
                    onClick={handleDelete}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all border ${
                      confirmDelete
                        ? 'bg-red-500 text-white border-red-500 hover:bg-red-600'
                        : 'bg-red-500/10 text-red-500 border-red-500/30 hover:bg-red-500/20'
                    }`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    {confirmDelete ? 'Confirm Delete' : 'Delete Record'}
                  </button>
                  {confirmDelete && (
                    <button
                      onClick={() => setConfirmDelete(false)}
                      className="text-xs font-black text-text-muted hover:text-text-main transition-colors underline underline-offset-2"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WalletTxns;
