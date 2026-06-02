import { useState, useEffect } from 'react';
import { Sliders, Search, CreditCard, Trash2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ConfirmDelete } from '@/components/shared/ConfirmDelete';
import { DataTable } from '@/components/shared/DataTable';
import { ServerPagination } from '@/components/shared/ServerPagination';
import { dbService, type Subscription as ApiSubscription } from '@/services/dbService';
import toast from 'react-hot-toast';
import { DetailsModal } from '@/components/shared/DetailsModal';

// UI-facing row shape — flat keys the existing DataTable accessors are
// already written against. We project the API record onto this shape so
// the existing table renders untouched.
interface SubscriptionRow {
    id: string;
    subscriberId: string;
    driverName: string;
    email: string;
    phone: string;
    plan: ApiSubscription['plan'];
    planLabel: string;
    price: number;
    startDate: string;
    endDate: string;
    status: ApiSubscription['status'];
    statusLabel: 'Active' | 'Cancelled' | 'Expired';
}

const PLAN_LABEL: Record<ApiSubscription['plan'], string> = {
    basic: 'Basic Pass',
    premium: 'Premium Pass',
    pro: 'Pro Pass',
};

const STATUS_LABEL: Record<ApiSubscription['status'], SubscriptionRow['statusLabel']> = {
    active: 'Active',
    cancelled: 'Cancelled',
    expired: 'Expired',
};

const STATUS_FILTER_OPTIONS: Array<{ label: string; value: '' | ApiSubscription['status'] }> = [
    { label: 'All Passes', value: '' },
    { label: 'Active', value: 'active' },
    { label: 'Cancelled', value: 'cancelled' },
    { label: 'Expired', value: 'expired' },
];

const STATUS_COLORS: Record<SubscriptionRow['statusLabel'], string> = {
    Active: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    Cancelled: 'bg-red-500/10 text-red-500 border-red-500/20',
    Expired: 'bg-slate-500/10 text-slate-500 border-slate-500/20',
};

const Subscribers = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'' | ApiSubscription['status']>('');
    const [subscriptions, setSubscriptions] = useState<SubscriptionRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [meta, setMeta] = useState<any>(null);

    const [isRevokeOpen, setIsRevokeOpen] = useState(false);
    const [subToRevoke, setSubToRevoke] = useState<SubscriptionRow | null>(null);

    const [isViewOpen, setIsViewOpen] = useState(false);
    const [selectedSub, setSelectedSub] = useState<SubscriptionRow | null>(null);

    useEffect(() => {
        fetchSubscribers();
        const handleRefresh = () => fetchSubscribers();
        window.addEventListener('refresh-data', handleRefresh);
        return () => window.removeEventListener('refresh-data', handleRefresh);
    }, [page, searchQuery, statusFilter]);

    useEffect(() => {
        setPage(1);
    }, [searchQuery, statusFilter]);

    const fetchSubscribers = async () => {
        try {
            setLoading(true);
            const response = await dbService.getSubscriptions({
                page,
                limit: 10,
                search: searchQuery,
                status: statusFilter || undefined,
            });
            const list = response.data || [];
            const mapped: SubscriptionRow[] = list.map((s) => ({
                id: s.id,
                subscriberId: s.userId,
                driverName: s.user?.name || 'Anonymous Subscriber',
                email: s.user?.email || '—',
                phone: s.user?.phone || '—',
                plan: s.plan,
                planLabel: PLAN_LABEL[s.plan] ?? s.plan,
                price: Number(s.price ?? 0),
                startDate: new Date(s.startDate).toLocaleDateString(),
                endDate: new Date(s.endDate).toLocaleDateString(),
                status: s.status,
                statusLabel: STATUS_LABEL[s.status] ?? 'Active',
            }));
            setSubscriptions(mapped);
            setMeta(response.meta || null);
        } catch (error) {
            console.error('Failed to fetch subscriptions:', error);
            toast.error('Could not load subscriptions');
        } finally {
            setLoading(false);
        }
    };

    // Optimistic revoke — there's no backend route to cancel an admin's
    // subscription yet, so we just hide the row locally. Wire this up to
    // a `PUT /admin/db/subscriptions/:id/cancel` endpoint when one ships.
    const handleRevokeConfirm = () => {
        if (!subToRevoke) return;
        setSubscriptions((prev) =>
            prev.map((s) =>
                s.id === subToRevoke.id
                    ? { ...s, status: 'cancelled', statusLabel: 'Cancelled' }
                    : s,
            ),
        );
        toast.success(`Subscription ${subToRevoke.id.slice(0, 8)} marked cancelled.`);
        setIsRevokeOpen(false);
        setSubToRevoke(null);
    };

    const handleOpenView = (sub: SubscriptionRow) => {
        setSelectedSub(sub);
        setIsViewOpen(true);
    };

    if (loading && subscriptions.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-black text-text-main tracking-tighter">
                        Subscriptions
                    </h2>
                    <p className="text-[11px] text-text-muted font-bold uppercase tracking-[0.2em] mt-1">
                        Live driver passes synced from the user app
                    </p>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-card p-4 rounded-xl border border-border-main/50 shadow-sm">
                <div className="relative w-full md:w-96 group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors">
                        <Search size={14} />
                    </div>
                    <Input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by subscriber name, email, or phone…"
                        className="w-full h-11 bg-bg-main/50 border-border-main/60 rounded-xl pl-11 pr-4 text-xs font-bold text-text-main focus-visible:ring-primary/20 transition-all"
                    />
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 scrollbar-hide">
                    <span className="text-[10px] font-black text-text-muted uppercase tracking-wider whitespace-nowrap flex items-center gap-1.5 mr-2">
                        <Sliders size={12} className="text-primary" /> Filter Status:
                    </span>
                    {STATUS_FILTER_OPTIONS.map((opt) => (
                        <button
                            key={opt.value}
                            onClick={() => setStatusFilter(opt.value)}
                            className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all whitespace-nowrap ${
                                statusFilter === opt.value
                                    ? 'bg-primary text-white border-primary shadow-md shadow-primary/20'
                                    : 'bg-bg-main text-text-muted border-border-main/50 hover:text-text-main'
                            }`}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            </div>

            <DataTable
                data={subscriptions}
                emptyStateIcon={CreditCard}
                emptyStateTitle="No subscriptions yet"
                emptyStateDescription="When a driver subscribes from the user app, their pass appears here."
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
                        header: 'Subscriber Info',
                        accessor: (sub) => (
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-primary/10 text-primary border border-primary/20 rounded-xl flex items-center justify-center text-xs font-black">
                                    {sub.driverName.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex flex-col">
                                    <h5 className="text-sm font-black text-text-main leading-tight truncate max-w-[180px]">
                                        {sub.driverName}
                                    </h5>
                                    <span className="text-[10px] text-text-muted font-bold mt-0.5 leading-none">
                                        {sub.email} • {sub.phone}
                                    </span>
                                </div>
                            </div>
                        ),
                    },
                    {
                        header: 'Plan',
                        accessor: (sub) => (
                            <div className="flex flex-col gap-0.5">
                                <span className="text-xs font-black text-text-main truncate max-w-[150px]">
                                    {sub.planLabel}
                                </span>
                                <span className="text-[10px] font-bold text-primary tracking-wider">
                                    ₹{sub.price.toLocaleString('en-IN')}
                                </span>
                            </div>
                        ),
                    },
                    {
                        header: 'Validity Period',
                        textCenter: true,
                        accessor: (sub) => (
                            <div className="flex flex-col gap-0.5 items-center text-[10px] font-bold text-text-main">
                                <span>{sub.startDate}</span>
                                <span className="text-[9px] text-text-muted leading-none">to</span>
                                <span className="text-text-muted">{sub.endDate}</span>
                            </div>
                        ),
                    },
                    {
                        header: 'Status',
                        textCenter: true,
                        accessor: (sub) => (
                            <span
                                className={`inline-flex px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all ${STATUS_COLORS[sub.statusLabel]}`}
                            >
                                {sub.statusLabel}
                            </span>
                        ),
                    },
                    {
                        header: 'Actions',
                        textRight: true,
                        accessor: (sub) => (
                            <div
                                className="flex items-center justify-end gap-2"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <Button
                                    size="sm"
                                    onClick={() => handleOpenView(sub)}
                                    className="bg-bg-main/50 text-text-main border-border-main shadow-sm hover:bg-bg-main hover:text-primary text-[9px] font-black uppercase tracking-widest px-2.5 py-1.5 h-auto rounded-lg flex items-center gap-1.5"
                                >
                                    <Eye size={11} /> View
                                </Button>
                                {sub.status === 'active' && (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => {
                                            setSubToRevoke(sub);
                                            setIsRevokeOpen(true);
                                        }}
                                        className="rounded-xl h-8 w-8 text-text-muted hover:text-red-500 hover:bg-red-500/10 transition-colors"
                                    >
                                        <Trash2 size={14} />
                                    </Button>
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

            <ConfirmDelete
                isOpen={isRevokeOpen}
                onOpenChange={setIsRevokeOpen}
                onConfirm={handleRevokeConfirm}
                title="Cancel Subscription"
                description={
                    <span>
                        Cancel subscription{' '}
                        <span className="font-black text-red-500">
                            {subToRevoke?.id.slice(0, 8)}
                        </span>{' '}
                        for{' '}
                        <span className="font-black text-red-500">
                            {subToRevoke?.driverName}
                        </span>
                        ? The pass will be marked inactive immediately.
                    </span>
                }
            />

            <DetailsModal
                isOpen={isViewOpen}
                onClose={() => setIsViewOpen(false)}
                title="Subscription"
                data={selectedSub}
            />
        </div>
    );
};

export default Subscribers;
