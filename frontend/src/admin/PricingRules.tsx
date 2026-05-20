import { useState, useEffect } from 'react';
import { BadgeCent, MapPin, Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { DataTable } from '@/components/shared/DataTable';
import { ServerPagination } from '@/components/shared/ServerPagination';
import { dbService, type PricingRule } from '@/services/dbService';
import toast from 'react-hot-toast';

const PricingRules = () => {
  const [rules, setRules] = useState<PricingRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<any>(null);

  const fetchRules = async () => {
    try {
      setLoading(true);
      const response = await dbService.getPricingRules({
        page,
        limit: 10,
        search: searchQuery
      });
      setRules(response.data || []);
      setMeta(response.meta || null);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load pricing structures');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRules();
  }, [page, searchQuery]);

  useEffect(() => {
    const handleRefresh = () => fetchRules();
    window.addEventListener('refresh-data', handleRefresh);
    return () => window.removeEventListener('refresh-data', handleRefresh);
  }, [page, searchQuery]);

  useEffect(() => {
    setPage(1);
  }, [searchQuery]);

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h2 className="text-3xl font-black text-text-main tracking-tighter">Pricing Rules Configuration</h2>
        <p className="text-[11px] text-text-muted font-bold uppercase tracking-[0.2em] mt-1">
          Monitor standard tariffs, weekend rates, and peak hour pricing multipliers
        </p>
      </div>

      <div className="bg-card p-4 rounded-xl border border-border-main/50 shadow-sm">
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter tariffs by parking facility..."
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
            data={rules}
            emptyStateIcon={BadgeCent}
            emptyStateTitle="No pricing rules matched"
            emptyStateDescription="Ensure parking zones have pricing tariffs configured."
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
                header: 'Parking Asset',
                accessor: (rule) => (
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-primary/10 text-primary border border-primary/20 rounded-xl flex items-center justify-center font-black">
                      <MapPin size={16} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-black text-text-main leading-tight">
                        {rule.parking?.name}
                      </span>
                      <span className="text-[10px] text-text-muted mt-0.5 max-w-xs truncate font-medium">
                        {rule.parking?.address}
                      </span>
                    </div>
                  </div>
                ),
              },
              {
                header: 'Classification',
                textCenter: true,
                accessor: (rule) => (
                  <span className="px-3 py-1 bg-bg-main border border-border-main/60 text-text-main rounded-lg text-[10px] font-black uppercase tracking-widest">
                    {rule.vehicleType}
                  </span>
                ),
              },
              {
                header: 'Weekday Rate',
                accessor: (rule) => (
                  <span className="text-sm font-black text-text-main">
                    ₹{parseFloat(rule.weekdayPrice).toFixed(2)} / hr
                  </span>
                ),
              },
              {
                header: 'Weekend Rate',
                accessor: (rule) => (
                  <span className="text-sm font-black text-primary">
                    ₹{parseFloat(rule.weekendPrice).toFixed(2)} / hr
                  </span>
                ),
              },
              {
                header: 'Peak Multiplier Configuration',
                accessor: (rule) => {
                  const peak = rule.peakRules;
                  if (!peak) return <span className="text-xs text-text-muted">None Configured</span>;
                  return (
                    <div className="flex flex-col gap-0.5 max-w-xs">
                      <span className="text-xs font-black text-amber-500 flex items-center gap-1">
                        <Sparkles size={12} /> {peak.multiplier}x Rate Multiplier
                      </span>
                      <span className="text-[9px] text-text-muted font-bold truncate">
                        Peak: {peak.peakHours?.join(', ') || 'N/A'}
                      </span>
                    </div>
                  );
                },
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

export default PricingRules;
