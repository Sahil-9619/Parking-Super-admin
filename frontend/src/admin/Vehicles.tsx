import { useState, useEffect } from 'react';
import { Car, Eye } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/shared/DataTable';
import { ServerPagination } from '@/components/shared/ServerPagination';
import { dbService, type Vehicle } from '@/services/dbService';
import toast from 'react-hot-toast';
import { DetailsModal } from '@/components/shared/DetailsModal';

const Vehicles = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<any>(null);

  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const response = await dbService.getVehicles({
        page,
        limit: 10,
        search: searchQuery,
      });
      setVehicles(response.data || []);
      setMeta(response.meta || null);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load vehicles registration data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, [page, searchQuery]);

  useEffect(() => {
    const handleRefresh = () => fetchVehicles();
    window.addEventListener('refresh-data', handleRefresh);
    return () => window.removeEventListener('refresh-data', handleRefresh);
  }, [page, searchQuery]);

  useEffect(() => {
    setPage(1);
  }, [searchQuery]);

  const handleOpenView = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setIsViewOpen(true);
  };

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h2 className="text-3xl font-black text-text-main tracking-tighter">Registered Driver Vehicles</h2>
        <p className="text-[11px] text-text-muted font-bold uppercase tracking-[0.2em] mt-1">
          Review vehicle license plates, types, ownership relations, and gateway authorization status
        </p>
      </div>

      <div className="bg-card p-4 rounded-xl border border-border-main/50 shadow-sm">
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by license plate number, driver, or type..."
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
            data={vehicles}
            emptyStateIcon={Car}
            emptyStateTitle="No vehicles found"
            emptyStateDescription="Try a different license plate search query."
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
                header: 'License Plate',
                accessor: (vehicle) => (
                  <span className="text-xs font-black text-text-main font-mono border border-border-main bg-bg-main/60 px-3 py-1 rounded-lg">
                    {vehicle.regNumber}
                  </span>
                ),
              },
              {
                header: 'Vehicle Type',
                textCenter: true,
                accessor: (vehicle) => (
                  <span className="px-3 py-1 bg-primary/5 text-primary border border-primary/10 rounded-lg text-[10px] font-black uppercase tracking-widest">
                    {vehicle.vehicleType}
                  </span>
                ),
              },
              {
                header: 'Driver Owner',
                accessor: (vehicle) => (
                  <div className="flex flex-col">
                    <span className="text-xs font-black text-text-main">
                      {vehicle.user?.name || 'Anonymous Driver'}
                    </span>
                    <span className="text-[10px] text-text-muted">
                      {vehicle.user?.email || 'N/A'} • {vehicle.user?.phone || ''}
                    </span>
                  </div>
                ),
              },
              {
                header: 'Gateway Access Auth',
                textCenter: true,
                accessor: (vehicle) => (
                  <div className="flex items-center justify-center">
                    {vehicle.isActive ? (
                      <span className="px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                        Default
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest bg-slate-500/10 text-slate-500 border border-slate-500/20">
                        Inactive
                      </span>
                    )}
                  </div>
                ),
              },
              {
                header: 'Date Added',
                accessor: (vehicle) => (
                  <span className="text-[11px] font-semibold text-text-muted">
                    {new Date(vehicle.createdAt).toLocaleDateString()}
                  </span>
                ),
              },
              {
                header: 'Actions',
                textRight: true,
                accessor: (vehicle) => (
                  <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                    <Button
                      size="sm"
                      onClick={() => handleOpenView(vehicle)}
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
        title="Vehicle Details" 
        data={selectedVehicle} 
      />
    </div>
  );
};

export default Vehicles;
