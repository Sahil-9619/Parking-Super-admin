import { useState, useEffect } from 'react';
import { Sparkles, Eye } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/shared/DataTable';
import { ServerPagination } from '@/components/shared/ServerPagination';
import { dbService, type CustomAddon } from '@/services/dbService';
import toast from 'react-hot-toast';
import { DetailsModal } from '@/components/shared/DetailsModal';

const CustomAddons = () => {
  const [addons, setAddons] = useState<CustomAddon[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<any>(null);
  
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedAddon, setSelectedAddon] = useState<CustomAddon | null>(null);

  const fetchAddons = async () => {
    try {
      setLoading(true);
      const response = await dbService.getCustomAddons({
        page,
        limit: 10,
        search: searchQuery
      });
      setAddons(response.data || []);
      setMeta(response.meta || null);
    } catch (error) {
      console.error(error);
      toast.error('Failed to fetch custom addons list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddons();
  }, [page, searchQuery]);

  useEffect(() => {
    const handleRefresh = () => fetchAddons();
    window.addEventListener('refresh-data', handleRefresh);
    return () => window.removeEventListener('refresh-data', handleRefresh);
  }, [page, searchQuery]);

  useEffect(() => {
    setPage(1);
  }, [searchQuery]);

  const handleOpenView = (addon: CustomAddon) => {
    setSelectedAddon(addon);
    setIsViewOpen(true);
  };

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h2 className="text-3xl font-black text-text-main tracking-tighter">Custom Add-on Services</h2>
        <p className="text-[11px] text-text-muted font-bold uppercase tracking-[0.2em] mt-1">
          Review operator-defined custom auxiliary offerings, pricing, and configurations
        </p>
      </div>

      <div className="bg-card p-4 rounded-xl border border-border-main/50 shadow-sm">
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search addons by name or description..."
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
            data={addons}
            emptyStateIcon={Sparkles}
            emptyStateTitle="No custom addons found"
            emptyStateDescription="Ensure operators have created add-on services or refine your search."
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
                header: 'Service Information',
                accessor: (addon) => (
                  <div className="flex items-center gap-4">
                    {addon.image ? (
                      <img
                        src={addon.image}
                        alt={addon.name}
                        className="w-12 h-12 object-cover rounded-xl border border-border-main"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center font-black">
                        {addon.name.charAt(0)}
                      </div>
                    )}
                    <div className="flex flex-col">
                      <h5 className="text-sm font-black text-text-main leading-tight">{addon.name}</h5>
                      <p className="text-[10px] text-text-muted mt-0.5 line-clamp-1 max-w-sm">
                        {addon.description || 'No description provided.'}
                      </p>
                    </div>
                  </div>
                ),
              },
              {
                header: 'Parking Asset',
                accessor: (addon) => (
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-text-main">
                      {addon.parking?.name || 'Unassigned Spot'}
                    </span>
                    <span className="text-[9px] text-text-muted mt-0.5 max-w-xs truncate">
                      {addon.parking?.address || 'N/A'}
                    </span>
                  </div>
                ),
              },
              {
                header: 'Fee & Charges',
                accessor: (addon) => (
                  <span className="text-xs font-black text-primary">
                    ₹{parseFloat(addon.price).toLocaleString('en-IN')}
                  </span>
                ),
              },
              {
                header: 'Operating Status',
                textCenter: true,
                accessor: (addon) => (
                  <div className="flex items-center justify-center gap-2">
                    {addon.isActive ? (
                      <span className="inline-flex px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest bg-slate-500/10 text-slate-500 border border-slate-500/20">
                        Paused
                      </span>
                    )}
                  </div>
                ),
              },
              {
                header: 'Actions',
                textCenter: true,
                accessor: (addon) => (
                  <div className="flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
                    <Button
                      size="sm"
                      onClick={() => handleOpenView(addon)}
                      className="bg-bg-main/50 text-text-main border-border-main shadow-sm hover:bg-bg-main hover:text-primary text-[9px] font-black uppercase tracking-widest px-2.5 py-1.5 h-auto rounded-lg flex items-center gap-1.5"
                    >
                      <Eye size={11} /> View
                    </Button>
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
        </>
      )}

      <DetailsModal 
        isOpen={isViewOpen} 
        onClose={() => setIsViewOpen(false)} 
        title="Custom Addon" 
        data={selectedAddon} 
      />
    </div>
  );
};

export default CustomAddons;
