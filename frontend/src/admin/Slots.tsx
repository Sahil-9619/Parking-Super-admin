import { useState, useEffect } from 'react';
import { MapPin, Gauge, Eye } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/shared/DataTable';
import { ServerPagination } from '@/components/shared/ServerPagination';
import { dbService, type ParkingSlot } from '@/services/dbService';
import toast from 'react-hot-toast';
import { DetailsModal } from '@/components/shared/DetailsModal';

const Slots = () => {
  const [slots, setSlots] = useState<ParkingSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<any>(null);

  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<ParkingSlot | null>(null);

  const fetchSlots = async () => {
    try {
      setLoading(true);
      const response = await dbService.getParkingSlots({
        page,
        limit: 10,
        search: searchQuery
      });
      setSlots(response.data || []);
      setMeta(response.meta || null);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load slots status');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlots();
  }, [page, searchQuery]);

  useEffect(() => {
    const handleRefresh = () => fetchSlots();
    window.addEventListener('refresh-data', handleRefresh);
    return () => window.removeEventListener('refresh-data', handleRefresh);
  }, [page, searchQuery]);

  useEffect(() => {
    setPage(1);
  }, [searchQuery]);

  const handleOpenView = (slot: ParkingSlot) => {
    setSelectedSlot(slot);
    setIsViewOpen(true);
  };

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h2 className="text-3xl font-black text-text-main tracking-tighter">Parking Slots Directory</h2>
        <p className="text-[11px] text-text-muted font-bold uppercase tracking-[0.2em] mt-1">
          Audit parking occupancy capacities, total designated spaces, and real-time vacancies
        </p>
      </div>

      <div className="bg-card p-4 rounded-xl border border-border-main/50 shadow-sm">
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter slots by parking location name..."
          className="w-full max-w-md h-11 bg-bg-main/50 border-border-main/60 rounded-xl px-4 text-xs font-bold text-text-main focus-visible:ring-primary/20 transition-all"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <>
          <DataTable
            data={slots}
            emptyStateIcon={Gauge}
            emptyStateTitle="No slots directories found"
            emptyStateDescription="Try searching for another parking spot."
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
                header: 'Parking Facility',
                accessor: (slot) => (
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-primary/10 text-primary border border-primary/20 rounded-xl flex items-center justify-center font-black">
                      <MapPin size={16} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-black text-text-main leading-tight">
                        {slot.parking?.name}
                      </span>
                      <span className="text-[10px] text-text-muted mt-0.5 max-w-sm truncate font-medium">
                        {slot.parking?.address}
                      </span>
                    </div>
                  </div>
                ),
              },
              {
                header: 'Classification',
                textCenter: true,
                accessor: (slot) => (
                  <span className="px-3 py-1 bg-bg-main border border-border-main/60 text-text-main rounded-lg text-[10px] font-black uppercase tracking-widest">
                    {slot.vehicleType}
                  </span>
                ),
              },
              {
                header: 'Total Capacity',
                textCenter: true,
                accessor: (slot) => (
                  <span className="text-sm font-black text-text-main">{slot.totalSlots} Slots</span>
                ),
              },
              {
                header: 'Available Spaces',
                textCenter: true,
                accessor: (slot) => (
                  <span className="text-sm font-black text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-xl">
                    {slot.availableSlots} Vacant
                  </span>
                ),
              },
              {
                header: 'Fill Ratio',
                accessor: (slot) => {
                  const fillPercent = ((slot.totalSlots - slot.availableSlots) / slot.totalSlots) * 100;
                  return (
                    <div className="flex items-center gap-3 w-40">
                      <div className="flex-1 h-2 bg-bg-main rounded-full overflow-hidden border border-border-main/20">
                        <div
                          className="h-full bg-primary transition-all duration-500 rounded-full"
                          style={{ width: `${fillPercent}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-black text-text-muted">
                        {Math.round(fillPercent)}% Full
                      </span>
                    </div>
                  );
                },
              },
              {
                header: 'Actions',
                textRight: true,
                accessor: (slot) => (
                  <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                    <Button
                      size="sm"
                      onClick={() => handleOpenView(slot)}
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
        title="Parking Slot" 
        data={selectedSlot} 
      />
    </div>
  );
};

export default Slots;
