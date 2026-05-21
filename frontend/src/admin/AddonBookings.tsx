import { useState, useEffect } from 'react';
import { Box, Calendar, Eye } from 'lucide-react';
import { FilterBar } from '@/components/shared/FilterBar';
import { DataTable } from '@/components/shared/DataTable';
import { ServerPagination } from '@/components/shared/ServerPagination';
import { dbService, type AddonBooking } from '@/services/dbService';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';
import { DetailsModal } from '@/components/shared/DetailsModal';

const AddonBookings = () => {
  const [bookings, setBookings] = useState<AddonBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<any>(null);

  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<AddonBooking | null>(null);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await dbService.getAddonBookings({
        page,
        limit: 10,
        search: searchQuery,
        status: statusFilter,
      });
      setBookings(response.data || []);
      setMeta(response.meta || null);
    } catch (error) {
      console.error(error);
      toast.error('Failed to fetch addon bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [page, searchQuery, statusFilter]);

  useEffect(() => {
    const handleRefresh = () => fetchBookings();
    window.addEventListener('refresh-data', handleRefresh);
    return () => window.removeEventListener('refresh-data', handleRefresh);
  }, [page, searchQuery, statusFilter]);

  useEffect(() => {
    setPage(1);
  }, [searchQuery, statusFilter]);

  const handleOpenView = (booking: AddonBooking) => {
    setSelectedBooking(booking);
    setIsViewOpen(true);
  };

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h2 className="text-3xl font-black text-text-main tracking-tighter">Add-on Bookings</h2>
        <p className="text-[11px] text-text-muted font-bold uppercase tracking-[0.2em] mt-1">
          Monitor and track custom services like EV charging, car washing, and tire inflation
        </p>
      </div>

      <FilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search by service name, client..."
        filterValue={statusFilter}
        onFilterChange={setStatusFilter}
        filterOptions={[
          { label: 'Pending', value: 'pending' },
          { label: 'In Progress', value: 'in_progress' },
          { label: 'Completed', value: 'completed' },
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
            data={bookings}
            emptyStateIcon={Box}
            emptyStateTitle="No add-on bookings found"
            emptyStateDescription="Try modifying your status filter or search parameters."
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
                header: 'Add-on Service',
                accessor: (booking) => (
                  <div className="flex flex-col">
                    <span className="text-sm font-black text-text-main leading-tight">
                      {booking.addonName}
                    </span>
                    {booking.serviceLevel && (
                      <span className="text-[10px] text-text-muted font-semibold mt-0.5">
                        Level: {booking.serviceLevel}
                      </span>
                    )}
                  </div>
                ),
              },
              {
                header: 'Driver / Account',
                accessor: (booking) => (
                  <div className="flex flex-col">
                    <span className="text-xs font-black text-text-main">
                      {booking.booking?.user?.name || 'Anonymous'}
                    </span>
                    <span className="text-[10px] text-text-muted">
                      {booking.booking?.user?.phone || 'N/A'}
                    </span>
                  </div>
                ),
              },
              {
                header: 'Facility Spot',
                accessor: (booking) => (
                  <span className="text-xs font-bold text-text-main">
                    {booking.booking?.parking?.name || 'Main Parking'}
                  </span>
                ),
              },
              {
                header: 'Financials',
                accessor: (booking) => (
                  <div className="flex flex-col">
                    <span className="text-xs font-black text-primary">
                      ₹{parseFloat(booking.amount).toLocaleString('en-IN')}
                    </span>
                    <span className="text-[9px] text-text-muted font-bold mt-0.5">
                      Platform Share: ₹{parseFloat(booking.commission).toLocaleString('en-IN')}
                    </span>
                  </div>
                ),
              },
              {
                header: 'Service Status',
                textCenter: true,
                accessor: (booking) => {
                  const styles: Record<string, string> = {
                    pending: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
                    in_progress: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
                    completed: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
                  };
                  return (
                    <span
                      className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all ${
                        styles[booking.status] || styles.pending
                      }`}
                    >
                      {booking.status.replace('_', ' ')}
                    </span>
                  );
                },
              },
              {
                header: 'Booked Date',
                accessor: (booking) => (
                  <div className="flex items-center gap-2 text-text-muted">
                    <Calendar size={12} />
                    <span className="text-[10px] font-bold">
                      {new Date(booking.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ),
              },
              {
                header: 'Actions',
                textRight: true,
                accessor: (booking) => (
                  <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                    <Button
                      size="sm"
                      onClick={() => handleOpenView(booking)}
                      className="bg-bg-main/50 text-text-main border-border-main shadow-sm hover:bg-bg-main hover:text-primary text-[9px] font-black uppercase tracking-widest px-2.5 py-1.5 h-auto rounded-lg flex items-center gap-1.5"
                    >
                      <Eye size={11} /> View
                    </Button>
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

      <DetailsModal 
        isOpen={isViewOpen} 
        onClose={() => setIsViewOpen(false)} 
        title="Add-on Booking" 
        data={selectedBooking} 
      />
    </div>
  );
};

export default AddonBookings;
