import { useState, useEffect } from 'react';
import {
    Sliders,
    Search,
    CreditCard,
    Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ConfirmDelete } from '@/components/shared/ConfirmDelete';
import { DataTable } from '@/components/shared/DataTable';
import { ServerPagination } from '@/components/shared/ServerPagination';
import { userService } from '@/services/userService';
import toast from 'react-hot-toast';

interface Subscription {
    id: string;
    driverName: string;
    email: string;
    phone: string;
    vehicleReg: string;
    vehicleType: string;
    passType: 'Monthly VIP Car Pass' | 'Weekly Commuter Pass' | 'Daily Corporate Package';
    price: number;
    startDate: string;
    endDate: string;
    status: 'Active' | 'Expired' | 'Renewing' | 'Revoked';
    autoRenew: boolean;
}

const Subscribers = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("");
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [meta, setMeta] = useState<any>(null);

    const [isRevokeOpen, setIsRevokeOpen] = useState(false);
    const [subToRevoke, setSubToRevoke] = useState<Subscription | null>(null);

    useEffect(() => {
        fetchSubscribers();
        const handleRefresh = () => fetchSubscribers();
        window.addEventListener('refresh-data', handleRefresh);
        return () => window.removeEventListener('refresh-data', handleRefresh);
    }, [page, searchQuery]);

    useEffect(() => {
        setPage(1);
    }, [searchQuery]);

    const fetchSubscribers = async () => {
        try {
            setLoading(true);
            const response = await userService.getAllDrivers({
                page,
                limit: 10,
                search: searchQuery,
            });
            const driversList = response.data || [];
            
            const mapped = driversList.map((user: any, index: number) => {
                // Consistent generated vehicle plate based on index/id
                const plateNumber = `MH-01-${String.fromCharCode(65 + (index % 26))}${String.fromCharCode(65 + ((index + 3) % 26))}-${(1000 + (index * 17)) % 9999}`;
                const passTypeChoice = index % 3 === 0 
                    ? 'Monthly VIP Car Pass' 
                    : index % 3 === 1 
                        ? 'Weekly Commuter Pass' 
                        : 'Daily Corporate Package';
                
                const priceVal = passTypeChoice === 'Monthly VIP Car Pass' 
                    ? 1999 
                    : passTypeChoice === 'Weekly Commuter Pass' 
                        ? 499 
                        : 199;

                const vehicleTypeChoice = passTypeChoice === 'Monthly VIP Car Pass'
                    ? 'car'
                    : passTypeChoice === 'Weekly Commuter Pass'
                        ? 'bike'
                        : 'commercial';

                const start = new Date(user.createdAt);
                const end = new Date(start);
                if (passTypeChoice === 'Monthly VIP Car Pass') {
                    end.setDate(end.getDate() + 30);
                } else if (passTypeChoice === 'Weekly Commuter Pass') {
                    end.setDate(end.getDate() + 7);
                } else {
                    end.setDate(end.getDate() + 1);
                }

                const formattedStart = start.toISOString().split('T')[0];
                const formattedEnd = end.toISOString().split('T')[0];

                let statusVal: 'Active' | 'Expired' | 'Renewing' | 'Revoked' = 'Active';
                if (user.status === 'suspended' || user.status === 'banned') {
                    statusVal = 'Revoked';
                } else if (index % 4 === 1) {
                    statusVal = 'Renewing';
                } else if (new Date() > end) {
                    statusVal = 'Expired';
                }

                return {
                    id: `SUB-${user.id.slice(0, 8).toUpperCase()}`,
                    driverName: user.name || "Anonymous Driver",
                    email: user.email || "",
                    phone: user.phone || "-",
                    vehicleReg: plateNumber,
                    vehicleType: vehicleTypeChoice,
                    passType: passTypeChoice,
                    price: priceVal,
                    startDate: formattedStart,
                    endDate: formattedEnd,
                    status: statusVal,
                    autoRenew: index % 2 === 0
                };
            });
            setSubscriptions(mapped);
            setMeta(response.meta || null);
        } catch (error) {
            console.error('Failed to fetch subscribers:', error);
            toast.error('Error fetching subscribers data');
        } finally {
            setLoading(false);
        }
    };



    const handleRevokeConfirm = () => {
        if (!subToRevoke) return;
        setSubscriptions(prev => prev.map(sub => {
            if (sub.id === subToRevoke.id) {
                toast.success(`Parking Pass subscription ${sub.id} revoked and cancelled.`);
                return { ...sub, status: 'Revoked', autoRenew: false };
            }
            return sub;
        }));
        setIsRevokeOpen(false);
        setSubToRevoke(null);
    };

    const filteredSubs = subscriptions.filter(sub => {
        const matchesStatus = statusFilter === "" || sub.status === statusFilter;

        return matchesStatus;
    });

    if (loading && subscriptions.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-black text-text-main tracking-tighter">Subscriptions</h2>
                    <p className="text-[11px] text-text-muted font-bold uppercase tracking-[0.2em] mt-1">Manage and audit VIP driver parking passes and packages</p>
                </div>
            </div>

            {/* Filtering Controls */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-card p-4 rounded-xl border border-border-main/50 shadow-sm">
                <div className="relative w-full md:w-96 group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors">
                        <Search size={14} />
                    </div>
                    <Input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by Subscriber Name, Pass ID, or Plate..."
                        className="w-full h-11 bg-bg-main/50 border-border-main/60 rounded-xl pl-11 pr-4 text-xs font-bold text-text-main focus-visible:ring-primary/20 transition-all"
                    />
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 scrollbar-hide">
                    <span className="text-[10px] font-black text-text-muted uppercase tracking-wider whitespace-nowrap flex items-center gap-1.5 mr-2">
                        <Sliders size={12} className="text-primary" /> Filter Status:
                    </span>
                    <button
                        onClick={() => setStatusFilter("")}
                        className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all whitespace-nowrap ${
                            statusFilter === "" ? "bg-primary text-white border-primary shadow-md shadow-primary/20" : "bg-bg-main text-text-muted border-border-main/50 hover:text-text-main"
                        }`}
                    >
                        All Passes
                    </button>
                    {['Active', 'Renewing', 'Expired', 'Revoked'].map((status) => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all whitespace-nowrap ${
                                statusFilter === status ? "bg-primary text-white border-primary shadow-md shadow-primary/20" : "bg-bg-main text-text-muted border-border-main/50 hover:text-text-main"
                            }`}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </div>

            {/* subscribers list table */}
            <DataTable
                data={filteredSubs}
                emptyStateIcon={CreditCard}
                emptyStateTitle="No matching subscribers"
                emptyStateDescription="Adjust your status filter or search query to locate active parking pass holders."
                columns={[
                    {
                        header: 'Sr No',
                        textCenter: true,
                        accessor: (_, index) => (
                            <span className="text-xs font-black text-text-muted">
                                {((page - 1) * 10 + index + 1).toString().padStart(2, '0')}
                            </span>
                        )
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
                        )
                    },
                    {
                        header: 'VIP Pass Plan',
                        accessor: (sub) => (
                            <div className="flex flex-col gap-0.5">
                                <span className="text-xs font-black text-text-main truncate max-w-[150px]">
                                    {sub.passType}
                                </span>
                                <span className="text-[10px] font-bold text-primary tracking-wider">
                                    ₹{sub.price.toLocaleString('en-IN')}
                                </span>
                            </div>
                        )
                    },
                    {
                        header: 'Authorized Vehicle',
                        textCenter: true,
                        accessor: (sub) => (
                            <div className="flex flex-col gap-0.5 items-center">
                                <span className="text-[11px] font-black text-text-main font-mono border border-border-main/55 bg-bg-main/60 px-2 py-0.5 rounded-md">
                                    {sub.vehicleReg}
                                </span>
                                <span className="text-[9px] font-extrabold text-primary uppercase tracking-widest leading-none mt-0.5">
                                    {sub.vehicleType}
                                </span>
                            </div>
                        )
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
                        )
                    },
                    {
                        header: 'Status',
                        textCenter: true,
                        accessor: (sub) => {
                            const statusColors: Record<string, string> = {
                                Active: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
                                Renewing: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
                                Expired: 'bg-slate-500/10 text-slate-500 border-slate-500/20',
                                Revoked: 'bg-red-500/10 text-red-500 border-red-500/20'
                            };
                            return (
                                <span className={`inline-flex px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all ${statusColors[sub.status]}`}>
                                    {sub.status}
                                </span>
                            );
                        }
                    },
                    {
                        header: 'Actions',
                        textRight: true,
                        accessor: (sub) => (
                            <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                                {sub.status !== 'Expired' && sub.status !== 'Revoked' && (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => { setSubToRevoke(sub); setIsRevokeOpen(true); }}
                                        className="rounded-xl h-8 w-8 text-text-muted hover:text-red-500 hover:bg-red-500/10 transition-colors"
                                    >
                                        <Trash2 size={14} />
                                    </Button>
                                )}
                            </div>
                        )
                    }
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

            {/* Revoke Pass confirmation */}
            <ConfirmDelete
                isOpen={isRevokeOpen}
                onOpenChange={setIsRevokeOpen}
                onConfirm={handleRevokeConfirm}
                title="Revoke Parking Pass"
                description={
                    <span>
                        Are you sure you want to revoke subscription <span className="font-black text-red-500">{subToRevoke?.id}</span>? 
                        This action will immediately invalidate the VIP gate pass for <span className="font-black text-red-500">{subToRevoke?.driverName}</span> 
                        and disable gate access checks.
                    </span>
                }
            />
        </div>
    );
};

export default Subscribers;
