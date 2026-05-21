import { useState, useEffect } from 'react';
import { AlertOctagon, CheckCircle2, Scale, Eye } from 'lucide-react';
import { DataTable } from '@/components/shared/DataTable';
import { ServerPagination } from '@/components/shared/ServerPagination';
import { dbService, type Dispute } from '@/services/dbService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import toast from 'react-hot-toast';
import { DetailsModal } from '@/components/shared/DetailsModal';

const Disputes = () => {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<any>(null);

  // Settlement Form modal state
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
  const [isResolveOpen, setIsResolveOpen] = useState(false);
  const [resolution, setResolution] = useState('full_refund');
  const [refundAmount, setRefundAmount] = useState('0');
  const [adminNote, setAdminNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // View Details Modal state
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedDisputeForView, setSelectedDisputeForView] = useState<Dispute | null>(null);

  const fetchDisputes = async () => {
    try {
      setLoading(true);
      const response = await dbService.getDisputes({ page, limit: 10 });
      setDisputes(response.data || []);
      setMeta(response.meta || null);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load active disputes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDisputes();
  }, [page]);

  useEffect(() => {
    const handleRefresh = () => fetchDisputes();
    window.addEventListener('refresh-data', handleRefresh);
    return () => window.removeEventListener('refresh-data', handleRefresh);
  }, [page]);

  const handleOpenResolve = (dispute: Dispute) => {
    setSelectedDispute(dispute);
    // Suggest refund based on booking charges
    const gross = parseFloat(dispute.booking?.grossAmount || '0');
    setRefundAmount(gross.toString());
    setResolution('full_refund');
    setAdminNote('');
    setIsResolveOpen(true);
  };

  const handleOpenView = (dispute: Dispute) => {
    setSelectedDisputeForView(dispute);
    setIsViewOpen(true);
  };

  const handleResolveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDispute) return;

    try {
      setSubmitting(true);
      const payload = {
        resolution,
        refundAmount: parseFloat(refundAmount) || 0,
        adminNote,
      };

      await dbService.resolveDispute(selectedDispute.id, payload);
      toast.success('Dispute resolved successfully!');
      setIsResolveOpen(false);
      setSelectedDispute(null);
      fetchDisputes();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Failed to resolve dispute');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h2 className="text-3xl font-black text-text-main tracking-tighter">Dispute Settlement Desk</h2>
        <p className="text-[11px] text-text-muted font-bold uppercase tracking-[0.2em] mt-1">
          Review, settle, and issue refunds for driver or owner disputes
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <>
          <DataTable
            data={disputes}
            emptyStateIcon={AlertOctagon}
            emptyStateTitle="No disputes found"
            emptyStateDescription="All bookings are verified and running smoothly."
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
                header: 'Ticket Info',
                accessor: (dispute) => (
                  <div className="flex flex-col">
                    <span className="text-xs font-black text-text-main font-mono">
                      #{dispute.id.slice(0, 8).toUpperCase()}
                    </span>
                    <span className="text-[10px] font-extrabold text-primary uppercase tracking-widest mt-0.5">
                      Raised By: {dispute.raisedBy?.name || 'Driver'} ({dispute.raisedByType})
                    </span>
                  </div>
                ),
              },
              {
                header: 'Claim & Details',
                accessor: (dispute) => (
                  <div className="flex flex-col max-w-sm">
                    <span className="text-xs font-black text-text-main leading-tight mb-0.5">
                      {dispute.reason}
                    </span>
                    <p className="text-[10px] text-text-muted italic line-clamp-2">
                      "{dispute.description}"
                    </p>
                  </div>
                ),
              },
              {
                header: 'Parking spot / Booking',
                accessor: (dispute) => (
                  <div className="flex flex-col text-[11px] font-bold">
                    <span className="text-text-main">{dispute.booking?.parking?.name || 'Main Parking'}</span>
                    <span className="text-text-muted">
                      Charged: ₹{parseFloat(dispute.booking?.grossAmount || '0').toLocaleString('en-IN')}
                    </span>
                  </div>
                ),
              },
              {
                header: 'Status',
                textCenter: true,
                accessor: (dispute) => {
                  const styles: Record<string, string> = {
                    open: 'bg-red-500/10 text-red-500 border-red-500/20 shadow-sm',
                    reviewing: 'bg-blue-500/10 text-blue-500 border-blue-500/20 shadow-sm',
                    resolved: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 shadow-sm',
                  };
                  return (
                    <span
                      className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all ${
                        styles[dispute.status] || styles.open
                      }`}
                    >
                      {dispute.status}
                    </span>
                  );
                },
              },
              {
                header: 'Resolution Decision',
                accessor: (dispute) => {
                  if (dispute.status !== 'resolved') {
                    return <span className="text-[10px] text-text-muted font-bold">Pending Review</span>;
                  }
                  return (
                    <div className="flex flex-col text-[10px] font-bold">
                      <span className="text-emerald-500 uppercase tracking-wider">
                        {dispute.resolution?.replace('_', ' ')}
                      </span>
                      {dispute.refundAmount && parseFloat(dispute.refundAmount) > 0 && (
                        <span className="text-primary mt-0.5">
                          Refunded: ₹{parseFloat(dispute.refundAmount).toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>
                  );
                },
              },
              {
                header: 'Settle / Actions',
                textRight: true,
                accessor: (dispute) => (
                  <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                    <Button
                      size="sm"
                      onClick={() => handleOpenView(dispute)}
                      className="bg-bg-main/50 text-text-main border-border-main shadow-sm hover:bg-bg-main hover:text-primary text-[9px] font-black uppercase tracking-widest px-2.5 py-1.5 h-auto rounded-lg flex items-center gap-1.5"
                    >
                      <Eye size={11} /> View
                    </Button>
                    {dispute.status !== 'resolved' ? (
                      <Button
                        size="sm"
                        onClick={() => handleOpenResolve(dispute)}
                        className="bg-primary text-white border-primary shadow-md hover:bg-primary/95 text-[9px] font-black uppercase tracking-widest px-3 py-1.5 h-auto rounded-lg flex items-center gap-1.5"
                      >
                        <Scale size={11} /> Settle Claim
                      </Button>
                    ) : (
                      <span className="text-text-muted flex items-center gap-1 text-[10px] font-black uppercase tracking-widest px-3">
                        <CheckCircle2 size={13} className="text-emerald-500" /> Settled
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

      {/* Resolution Dialog Form */}
      <Dialog open={isResolveOpen} onOpenChange={setIsResolveOpen}>
        <DialogContent
          style={{ backgroundColor: 'rgba(var(--bg-card-rgb), 0.98)' }}
          className="max-w-md rounded-[2rem] border border-border-main backdrop-blur-3xl p-6 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 [&>button]:hidden"
        >
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-text-main tracking-tight flex items-center gap-2">
              <Scale size={20} className="text-primary" /> Dispute Resolution Settle
            </DialogTitle>
            <DialogDescription className="text-xs text-text-muted font-bold mt-1">
              Select resolution rules. Wallet refunds are processed instantly.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleResolveSubmit} className="space-y-5 pt-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-text-muted uppercase tracking-wider block">
                Resolution Strategy
              </label>
              <select
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
                className="w-full bg-bg-main/50 border border-border-main/60 rounded-xl px-3 py-2.5 text-xs font-bold text-text-main focus:outline-none focus:border-primary transition-all"
              >
                <option value="full_refund">Full Refund (100%)</option>
                <option value="partial_refund">Partial Refund</option>
                <option value="no_refund">No Refund (Reject Claim)</option>
                <option value="owner_penalty">Owner Penalty</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-text-muted uppercase tracking-wider block">
                Authorized Refund Amount (₹)
              </label>
              <Input
                type="number"
                step="0.01"
                min="0"
                max={selectedDispute?.booking?.grossAmount}
                value={refundAmount}
                onChange={(e) => setRefundAmount(e.target.value)}
                placeholder="0.00"
                className="w-full h-11 bg-bg-main/50 border-border-main/60 rounded-xl px-4 text-xs font-bold text-text-main focus-visible:ring-primary/20 transition-all"
                disabled={resolution === 'no_refund'}
              />
              <span className="text-[9px] text-text-muted font-bold">
                Max Allowed: ₹{parseFloat(selectedDispute?.booking?.grossAmount || '0').toFixed(2)}
              </span>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-text-muted uppercase tracking-wider block">
                Internal Administrative Notes
              </label>
              <textarea
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                required
                placeholder="Reasoning for approving/rejecting refund..."
                className="w-full min-h-[90px] bg-bg-main/50 border border-border-main/60 rounded-xl px-3 py-2.5 text-xs font-semibold text-text-main focus:outline-none focus:border-primary transition-all resize-none"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsResolveOpen(false)}
                className="flex-1 rounded-xl border-border-main text-[10px] font-black uppercase tracking-widest h-11"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-primary text-white border-primary shadow-md hover:bg-primary/95 text-[10px] font-black uppercase tracking-widest h-11 rounded-xl"
              >
                {submitting ? 'Settling...' : 'Confirm Settle'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      
      <DetailsModal 
        isOpen={isViewOpen} 
        onClose={() => setIsViewOpen(false)} 
        title="Dispute" 
        data={selectedDisputeForView} 
      />
    </div>
  );
};

export default Disputes;
