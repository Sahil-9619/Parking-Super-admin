import { useState, useEffect } from 'react';
import {
    Eye,
    User,
    MapPin,
    Clock,
    QrCode,
    CalendarCheck,
    CreditCard,
    Trash2
} from 'lucide-react';
import { FilterBar } from '@/components/shared/FilterBar';
import { DataTable } from '@/components/shared/DataTable';
import { ServerPagination } from '@/components/shared/ServerPagination';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ConfirmDelete } from '@/components/shared/ConfirmDelete';
import { bookingService, type Booking } from '@/services/bookingService';
import toast from 'react-hot-toast';

const Bookings = () => {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [vehicleFilter, setVehicleFilter] = useState("");
    const [page, setPage] = useState(1);
    const [meta, setMeta] = useState<any>(null);

    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [isCancelOpen, setIsCancelOpen] = useState(false);
    const [bookingToCancel, setBookingToCancel] = useState<Booking | null>(null);

    const fetchBookings = async () => {
        try {
            setLoading(true);
            const params: any = {
                page,
                limit: 10
            };
            if (statusFilter) params.status = statusFilter.toLowerCase();
            if (vehicleFilter) params.vehicleType = vehicleFilter.toLowerCase();
            if (searchQuery) params.search = searchQuery;
            
            const response = await bookingService.getAllBookings(params);
            const bookingList = response.data || [];
            setBookings(bookingList);
            setMeta(response.meta || null);
        } catch (error) {
            console.error('Failed to fetch bookings:', error);
            toast.error('Error fetching bookings data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
        const handleRefresh = () => fetchBookings();
        window.addEventListener('refresh-data', handleRefresh);
        return () => window.removeEventListener('refresh-data', handleRefresh);
    }, [page, searchQuery, statusFilter, vehicleFilter]);

    useEffect(() => {
        setPage(1);
    }, [searchQuery, statusFilter, vehicleFilter]);

    const handleForceCancel = async () => {
        if (!bookingToCancel) return;
        try {
            const response = await bookingService.cancelBooking(bookingToCancel.id);
            toast.success(response.message || 'Booking force-cancelled successfully');
            fetchBookings();
            setIsCancelOpen(false);
            setBookingToCancel(null);
            if (selectedBooking?.id === bookingToCancel.id) {
                setIsDetailsOpen(false);
            }
        } catch (error: any) {
            const msg = error.response?.data?.message || 'Failed to force cancel booking';
            toast.error(msg);
        }
    };

    const formatIST = (dateStr: string | null) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleString('en-IN', {
            timeZone: 'Asia/Kolkata',
            hour: '2-digit',
            minute: '2-digit',
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    if (loading && bookings.length === 0) {
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
                    <h2 className="text-3xl font-black text-text-main tracking-tighter">User Bookings</h2>
                    <p className="text-[11px] text-text-muted font-bold uppercase tracking-[0.2em] mt-1">Monitor, inspect, and force-cancel driver bookings</p>
                </div>
            </div>
            {/* Filter Bar with Vehicle Type addition */}
            <div className="flex flex-col gap-4">
                <FilterBar
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    searchPlaceholder="Search by Driver Name, Booking ID, or Parking Lot..."
                    filterValue={statusFilter}
                    onFilterChange={setStatusFilter}
                    filterOptions={[
                        { label: "Confirmed", value: "Confirmed" },
                        { label: "Active", value: "Active" },
                        { label: "Completed", value: "Completed" },
                        { label: "Cancelled", value: "Cancelled" }
                    ]}
                    filterPlaceholder="All Statuses"
                />

                <div className="flex gap-2 bg-bg-main p-1.5 rounded-xl border border-border-main/40 self-start">
                    <button
                        onClick={() => setVehicleFilter("")}
                        className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                            vehicleFilter === "" ? "bg-primary text-white shadow-md shadow-primary/20" : "text-text-muted hover:text-text-main"
                        }`}
                    >
                        All Vehicles
                    </button>
                    <button
                        onClick={() => setVehicleFilter("car")}
                        className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                            vehicleFilter === "car" ? "bg-primary text-white shadow-md shadow-primary/20" : "text-text-muted hover:text-text-main"
                        }`}
                    >
                        Cars
                    </button>
                    <button
                        onClick={() => setVehicleFilter("bike")}
                        className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                            vehicleFilter === "bike" ? "bg-primary text-white shadow-md shadow-primary/20" : "text-text-muted hover:text-text-main"
                        }`}
                    >
                        Bikes
                    </button>
                </div>
            </div>

            {/* Data Table */}
            <DataTable
                data={bookings}
                onRowClick={(booking) => { setSelectedBooking(booking); setIsDetailsOpen(true); }}
                emptyStateIcon={CalendarCheck}
                emptyStateTitle="No bookings found"
                emptyStateDescription="Try adjusting your status, vehicle, or search filter."
                columns={[
                    {
                        header: "Sr No",
                        textCenter: true,
                        accessor: (_, idx) => (
                            <span className="text-xs font-black text-text-muted">
                                {((page - 1) * 10 + idx + 1).toString().padStart(2, '0')}
                            </span>
                        )
                    },
                    {
                        header: "Driver",
                        accessor: (booking) => (
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 bg-primary/10 text-primary border border-primary/15 rounded-xl flex items-center justify-center text-xs font-black">
                                    {booking.user?.name?.charAt(0).toUpperCase() || 'D'}
                                </div>
                                <div>
                                    <h5 className="text-xs font-black text-text-main leading-tight">{booking.user?.name || 'Unknown Driver'}</h5>
                                    <p className="text-[10px] text-text-muted font-semibold mt-0.5">{booking.user?.email}</p>
                                </div>
                            </div>
                        )
                    },
                    {
                        header: "Parking Hub",
                        accessor: (booking) => (
                            <div>
                                <h5 className="text-xs font-black text-text-main leading-tight">{booking.parking?.name || 'Unknown Parking'}</h5>
                                <p className="text-[9px] text-primary uppercase font-bold tracking-widest mt-0.5">{booking.vehicleType}</p>
                            </div>
                        )
                    },
                    {
                        header: "Timing (IST)",
                        accessor: (booking) => (
                            <div className="space-y-0.5">
                                <p className="text-[10px] font-bold text-text-main flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                                    {formatIST(booking.startTime)}
                                </p>
                                <p className="text-[10px] font-bold text-text-muted flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
                                    {formatIST(booking.endTime)}
                                </p>
                            </div>
                        )
                    },
                    {
                        header: "Payment",
                        accessor: (booking) => (
                            <div>
                                <p className="text-xs font-black text-text-main">₹{parseFloat(booking.totalCharged).toFixed(2)}</p>
                                <p className="text-[9px] text-text-muted font-bold tracking-wider mt-0.5">Fee: ₹{parseFloat(booking.commission).toFixed(2)}</p>
                            </div>
                        )
                    },
                    {
                        header: "Status",
                        accessor: (booking) => {
                            const styles: Record<string, string> = {
                                confirmed: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
                                active: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 shadow-sm shadow-emerald-500/5',
                                completed: 'bg-slate-500/10 text-slate-500 border-slate-500/20',
                                cancelled: 'bg-red-500/10 text-red-500 border-red-500/20'
                            };
                            const status = booking.status?.toLowerCase() || 'confirmed';
                            return (
                                <span className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border ${styles[status]}`}>
                                    {booking.status}
                                </span>
                            );
                        }
                    },
                    {
                        header: "Actions",
                        textCenter: true,
                        accessor: (booking) => (
                            <div className="flex items-center justify-center gap-2" onClick={(e) => e.stopPropagation()}>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => { setSelectedBooking(booking); setIsDetailsOpen(true); }}
                                    className="p-2 h-auto text-text-muted hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                                >
                                    <Eye size={14} />
                                </Button>
                                {booking.status !== 'cancelled' && booking.status !== 'completed' && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => { setBookingToCancel(booking); setIsCancelOpen(true); }}
                                        className="p-2 h-auto text-text-muted hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
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

            {/* Details Modal */}
            {selectedBooking && (
                <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
                    <DialogContent
                        style={{ backgroundColor: 'rgba(var(--bg-card-rgb), 0.98)' }}
                        className="max-w-4xl rounded-[2rem] border-border-main backdrop-blur-3xl p-0 overflow-hidden shadow-2xl animate-in duration-300 [&>button]:hidden"
                    >
                        <DialogHeader className="p-8 bg-gradient-to-r from-primary/10 to-primary/[0.02] border-b border-border-main/50 flex flex-row items-center justify-between">
                            <div className="flex items-center gap-4 text-left">
                                <div className="p-3 bg-primary/10 text-primary rounded-2xl border border-primary/20">
                                    <CalendarCheck size={20} />
                                </div>
                                <div>
                                    <DialogTitle className="text-xl font-black text-text-main tracking-tight leading-none">Booking Receipt</DialogTitle>
                                    <p className="text-[9px] font-bold text-text-muted uppercase tracking-[0.2em] mt-1.5">ID: {selectedBooking.id}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setIsDetailsOpen(false)}
                                    className="rounded-xl border-border-main text-[9px] font-black uppercase tracking-widest h-9 px-6 hover:bg-bg-main transition-all"
                                >
                                    Close Details
                                </Button>

                            </div>
                        </DialogHeader>

                        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8 max-h-[60vh] overflow-y-auto scrollbar-hide">
                            {/* Driver and Spot cards */}
                            <div className="space-y-6">
                                <section className="space-y-3">
                                    <h6 className="text-[10px] font-black text-text-muted uppercase tracking-widest flex items-center gap-2 px-1 text-left">
                                        <User size={12} className="text-primary" />
                                        Driver Information
                                    </h6>
                                    <div className="p-5 bg-bg-main/30 rounded-2xl border border-border-main/50 space-y-4 text-left">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-primary/10 text-primary border border-primary/15 rounded-xl flex items-center justify-center text-xs font-black">
                                                {selectedBooking.user?.name?.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="text-xs font-black text-text-main">{selectedBooking.user?.name}</p>
                                                <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mt-0.5">{selectedBooking.vehicleType} driver</p>
                                            </div>
                                        </div>
                                        <div className="w-full h-px bg-border-main/20" />
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-[8px] font-black text-text-muted uppercase tracking-wider">Email address</p>
                                                <p className="text-[10px] font-bold text-text-main mt-1 truncate">{selectedBooking.user?.email}</p>
                                            </div>
                                            <div>
                                                <p className="text-[8px] font-black text-text-muted uppercase tracking-wider">Phone number</p>
                                                <p className="text-[10px] font-bold text-text-main mt-1">{selectedBooking.user?.phone || '-'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                <section className="space-y-3">
                                    <h6 className="text-[10px] font-black text-text-muted uppercase tracking-widest flex items-center gap-2 px-1 text-left">
                                        <MapPin size={12} className="text-primary" />
                                        Parking Spot
                                    </h6>
                                    <div className="p-5 bg-bg-main/30 rounded-2xl border border-border-main/50 space-y-4 text-left">
                                        <div>
                                            <p className="text-[8px] font-black text-text-muted uppercase tracking-wider">Parking Hub</p>
                                            <p className="text-xs font-black text-text-main mt-1 leading-snug">{selectedBooking.parking?.name}</p>
                                        </div>
                                        <div>
                                            <p className="text-[8px] font-black text-text-muted uppercase tracking-wider">Physical Address</p>
                                            <p className="text-[10px] font-bold text-text-muted mt-1 leading-relaxed">{selectedBooking.parking?.address}</p>
                                        </div>
                                    </div>
                                </section>
                            </div>

                            {/* Booking schedule and prices */}
                            <div className="space-y-6">
                                <section className="space-y-3">
                                    <h6 className="text-[10px] font-black text-text-muted uppercase tracking-widest flex items-center gap-2 px-1 text-left">
                                        <Clock size={12} className="text-primary" />
                                        Session Timelines (IST)
                                    </h6>
                                    <div className="p-5 bg-bg-main/30 rounded-2xl border border-border-main/50 space-y-4 text-left">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-[8px] font-black text-text-muted uppercase tracking-wider">Reservation Start</p>
                                                <p className="text-[10px] font-black text-text-main mt-1">{formatIST(selectedBooking.startTime)}</p>
                                            </div>
                                            <div>
                                                <p className="text-[8px] font-black text-text-muted uppercase tracking-wider">Reservation End</p>
                                                <p className="text-[10px] font-black text-text-main mt-1">{formatIST(selectedBooking.endTime)}</p>
                                            </div>
                                        </div>
                                        <div className="w-full h-px bg-border-main/20" />
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-[8px] font-black text-text-muted uppercase tracking-wider">Actual Check-in</p>
                                                <p className="text-[10px] font-black text-emerald-500 mt-1">{formatIST(selectedBooking.checkinAt)}</p>
                                            </div>
                                            <div>
                                                <p className="text-[8px] font-black text-text-muted uppercase tracking-wider">Actual Check-out</p>
                                                <p className="text-[10px] font-black text-red-400 mt-1">{formatIST(selectedBooking.checkoutAt)}</p>
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                <section className="space-y-3">
                                    <h6 className="text-[10px] font-black text-text-muted uppercase tracking-widest flex items-center gap-2 px-1 text-left">
                                        <CreditCard size={12} className="text-primary" />
                                        Revenue and Fee Split
                                    </h6>
                                    <div className="p-5 bg-bg-main/30 rounded-2xl border border-border-main/50 space-y-3 text-left">
                                        <div className="flex items-center justify-between text-xs font-bold">
                                            <p className="text-text-muted">Gross Driver Payment</p>
                                            <p className="text-text-main font-black">₹{parseFloat(selectedBooking.totalCharged).toFixed(2)}</p>
                                        </div>
                                        <div className="flex items-center justify-between text-xs font-bold">
                                            <p className="text-text-muted">Platform Commission (15%)</p>
                                            <p className="text-primary font-black">₹{parseFloat(selectedBooking.commission).toFixed(2)}</p>
                                        </div>
                                        {parseFloat(selectedBooking.overstayAmount) > 0 && (
                                            <div className="flex items-center justify-between text-xs font-bold text-red-500">
                                                <p>Overstay Penalties</p>
                                                <p className="font-black">₹{parseFloat(selectedBooking.overstayAmount).toFixed(2)}</p>
                                            </div>
                                        )}
                                        <div className="w-full h-px bg-border-main/20 my-1" />
                                        <div className="flex items-center justify-between text-sm font-black">
                                            <p className="text-text-main">Owner Net Share</p>
                                            <p className="text-emerald-500">₹{parseFloat(selectedBooking.ownerShare).toFixed(2)}</p>
                                        </div>
                                    </div>
                                </section>
                            </div>
                        </div>

                        {/* QR Code section */}
                        <div className="bg-bg-main/40 p-6 border-t border-border-main/50 flex flex-col md:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-3 text-left">
                                <QrCode size={28} className="text-primary" />
                                <div>
                                    <p className="text-[10px] font-black text-text-main uppercase tracking-wider">Gate Access Pass</p>
                                    <p className="text-[9px] font-bold text-text-muted uppercase tracking-widest mt-0.5">{selectedBooking.qrToken}</p>
                                </div>
                            </div>
                            <span className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border border-primary/20 bg-primary/10 text-primary`}>
                                secure qr session active
                            </span>
                        </div>
                    </DialogContent>
                </Dialog>
            )}

            {/* Cancel Booking dialog */}
            <ConfirmDelete
                isOpen={isCancelOpen}
                onOpenChange={setIsCancelOpen}
                onConfirm={handleForceCancel}
                title="Cancel Booking Session"
                description={
                    <span>
                        Are you sure you want to force-cancel booking <span className="font-black text-red-500">{bookingToCancel?.id}</span>? 
                        This action will immediately refund the remaining amount back to the driver's wallet balance, 
                        release their locked slot, and write an audit log entry.
                    </span>
                }
            />
        </div>
    );
};

export default Bookings;
