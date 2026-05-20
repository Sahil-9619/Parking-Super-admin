import { useState, useEffect } from 'react';
import { Landmark } from 'lucide-react';
import { FilterBar } from '@/components/shared/FilterBar';
import { DataTable } from '@/components/shared/DataTable';
import { ServerPagination } from '@/components/shared/ServerPagination';
import { dbService, type Payout } from '@/services/dbService';
import toast from 'react-hot-toast';

const Payouts = () => {
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<any>(null);

  const fetchPayouts = async () => {
    try {
      setLoading(true);
      const response = await dbService.getPayouts({
        page,
        limit: 10,
        search: searchQuery,
      });
      setPayouts(response.data || []);
      setMeta(response.meta || null);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load payouts log');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayouts();
  }, [page, searchQuery]);

  useEffect(() => {
    const handleRefresh = () => fetchPayouts();
    window.addEventListener('refresh-data', handleRefresh);
    return () => window.removeEventListener('refresh-data', handleRefresh);
  }, [page, searchQuery]);

  useEffect(() => {
    setPage(1);
  }, [searchQuery]);

  const filteredPayouts = statusFilter
    ? payouts.filter((p) => p.status === statusFilter)
    : payouts;

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h2 className="text-3xl font-black text-text-main tracking-tighter">Owner Payout Audits</h2>
        <p className="text-[11px] text-text-muted font-bold uppercase tracking-[0.2em] mt-1">
          Review commissions, transfers, dispute holds, and bank receipts for parking partners
        </p>
      </div>

      <FilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search payouts by operator name..."
        filterValue={statusFilter}
        onFilterChange={setStatusFilter}
        filterOptions={[
          { label: 'Pending', value: 'pending' },
          { label: 'Processing', value: 'processing' },
          { label: 'Transferred', value: 'transferred' },
          { label: 'Failed', value: 'failed' },
        ]}
        filterPlaceholder="All Statuses"
      />

      {loading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <>
          <DataTable
            data={filteredPayouts}
            emptyStateIcon={Landmark}
            emptyStateTitle="No payouts matched"
            emptyStateDescription="Try adjusting status filter or searching for another operator."
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
                header: 'Parking Partner',
                accessor: (payout) => (
                  <div className="flex flex-col">
                    <span className="text-sm font-black text-text-main">
                      {payout.user?.name || 'Partner Account'}
                    </span>
                    <span className="text-[10px] text-text-muted font-bold">
                      {payout.user?.email || 'N/A'}
                    </span>
                  </div>
                ),
              },
              {
                header: 'Settlement Week',
                accessor: (payout) => (
                  <div className="flex flex-col text-[11px] font-bold text-text-main">
                    <span>From: {new Date(payout.weekStart).toLocaleDateString()}</span>
                    <span className="text-text-muted">To: {new Date(payout.weekEnd).toLocaleDateString()}</span>
                  </div>
                ),
              },
              {
                header: 'Gross Revenue',
                accessor: (payout) => (
                  <span className="text-xs font-black text-text-main">
                    ₹{parseFloat(payout.grossAmount).toLocaleString('en-IN')}
                  </span>
                ),
              },
              {
                header: 'Platform Comm.',
                accessor: (payout) => (
                  <span className="text-xs font-bold text-red-500">
                    -₹{parseFloat(payout.commission).toLocaleString('en-IN')}
                  </span>
                ),
              },
              {
                header: 'Dispute Hold',
                accessor: (payout) => (
                  <span className="text-xs font-bold text-amber-500">
                    ₹{parseFloat(payout.disputeHold).toLocaleString('en-IN')}
                  </span>
                ),
              },
              {
                header: 'Net Settled',
                accessor: (payout) => (
                  <span className="text-sm font-black text-emerald-500">
                    ₹{parseFloat(payout.finalPayout).toLocaleString('en-IN')}
                  </span>
                ),
              },
              {
                header: 'Payout Status',
                textCenter: true,
                accessor: (payout) => {
                  const styles: Record<string, string> = {
                    pending: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
                    processing: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
                    transferred: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
                    failed: 'bg-red-500/10 text-red-500 border-red-500/20',
                  };
                  return (
                    <span
                      className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all ${
                        styles[payout.status] || styles.pending
                      }`}
                    >
                      {payout.status}
                    </span>
                  );
                },
              },
              {
                header: 'Bank Transaction Ref',
                accessor: (payout) => (
                  <div className="flex flex-col">
                    <span className="text-xs font-black text-text-main font-mono">
                      {payout.utrNumber || 'Awaiting Sync'}
                    </span>
                    {payout.processedAt && (
                      <span className="text-[9px] text-text-muted mt-0.5 font-bold">
                        Paid: {new Date(payout.processedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
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
    </div>
  );
};

export default Payouts;
