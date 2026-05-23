import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, ShieldAlert, CheckCircle, Ban, Eye, Edit2, Trash2 } from 'lucide-react';
import { FilterBar } from '@/components/shared/FilterBar';
import { Button } from '@/components/ui/button';
import { ServerPagination } from '@/components/shared/ServerPagination';
import { parkingService, type ParkingArea, type PaginationMeta } from '@/services/parkingService';
import { showStatusToast } from '@/lib/utils';
import toast from 'react-hot-toast';
import { ParkingViewModal } from '@/components/shared/ParkingViewModal';
import { ParkingEditModal } from '@/components/shared/ParkingEditModal';
import { ConfirmDelete } from '@/components/shared/ConfirmDelete';

export default function Area() {
    const [areas, setAreas] = useState<ParkingArea[]>([]);
    const [meta, setMeta] = useState<PaginationMeta | null>(null);
    const [loading, setLoading] = useState(true);

    // Modal States
    const [selectedArea, setSelectedArea] = useState<ParkingArea | null>(null);
    const [isViewOpen, setIsViewOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);

    // Filters and Pagination
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [page, setPage] = useState(1);
    const limit = 10;

    const fetchAreas = async () => {
        try {
            setLoading(true);
            const response = await parkingService.getAllParkings({
                page,
                limit,
                search: searchQuery,
                status: statusFilter,
                parkingType: typeFilter
            });
            setAreas(response.data);
            setMeta(response.meta);
        } catch (error: any) {
            console.error('Error fetching areas:', error);
            showStatusToast('rejected', error.response?.data?.message || 'Failed to fetch parking areas');
        } finally {
            setLoading(false);
        }
    };

    // Refetch when filters or page change, and listen for global refresh
    useEffect(() => {
        fetchAreas();

        const handleRefresh = () => {
            console.log('Refresh event received in Area');
            fetchAreas();
        };
        window.addEventListener('refresh-data', handleRefresh);
        return () => window.removeEventListener('refresh-data', handleRefresh);
    }, [page, searchQuery, statusFilter, typeFilter]);

    // Reset page to 1 when search or filters change
    useEffect(() => {
        setPage(1);
    }, [searchQuery, statusFilter, typeFilter]);

    const handleStatusUpdate = async (id: string, newStatus: string) => {
        try {
            await parkingService.updateParkingStatus(id, newStatus);
            showStatusToast(newStatus, `Parking status updated to ${newStatus}`);
            fetchAreas();
        } catch (error: any) {
            console.error('Error updating status:', error);
            showStatusToast('rejected', error.response?.data?.message || 'Failed to update parking status');
        }
    };

    const handleEdit = async (data: any) => {
        try {
            await parkingService.updateParking(selectedArea!.id, data);
            toast.success('Parking details updated successfully', {
                style: { border: '1px solid rgba(16, 185, 129, 0.2)', padding: '16px', color: '#10b981', background: 'rgba(16, 185, 129, 0.1)', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '12px' },
            });
            setIsEditOpen(false);
            fetchAreas();
        } catch (error: any) {
            showStatusToast('rejected', error.response?.data?.message || 'Failed to update parking details');
        }
    };

    const handleDelete = async () => {
        if (!selectedArea) return;
        try {
            await parkingService.deleteParking(selectedArea.id);
            toast.success('Parking area deleted successfully');
            setIsDeleteOpen(false);
            fetchAreas();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to delete parking area');
        }
    };

    return (
        <div className="space-y-6 pb-12">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-text-main tracking-tight">Parking Areas</h1>
                    <p className="text-xs font-bold text-text-muted uppercase tracking-widest mt-1">
                        Monitor and Manage Infrastructure
                    </p>
                </div>
            </div>



            {/* Filters */}
            <div className="bg-bg-card border border-border-main rounded-sm p-5 shadow-lg shadow-primary/5">
                <div className="mb-6">
                    <FilterBar
                        searchQuery={searchQuery}
                        onSearchChange={setSearchQuery}
                        filterOptions={[
                            { label: 'Active', value: 'active' },
                            { label: 'Paused', value: 'paused' },
                            { label: 'Banned', value: 'banned' },
                        ]}
                        filterValue={statusFilter}
                        onFilterChange={setStatusFilter}
                        searchPlaceholder="Search by area, location or owner..."
                        secondFilterValue={typeFilter}
                        onSecondFilterChange={setTypeFilter}
                        secondFilterPlaceholder="All Types"
                        secondFilterOptions={[
                            { label: 'Home / Individual', value: 'home' },
                            { label: 'Society', value: 'society' },
                            { label: 'Commercial', value: 'commercial' },
                            { label: 'Government', value: 'govt' },
                            { label: 'Municipal', value: 'municipality' },
                        ]}
                    />
                </div>

                <AnimatePresence mode="wait">
                    {loading && areas.length === 0 ? (
                        <motion.div
                            key="loading"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col items-center justify-center py-20"
                        >
                            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
                            <p className="text-xs font-black text-text-muted uppercase tracking-widest">Loading Infrastructure...</p>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="content"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            {areas.length === 0 ? (
                                <div className="py-24 flex flex-col items-center justify-center text-center bg-white/40 backdrop-blur-sm rounded-sm border border-border-main/50">
                                    <div className="w-24 h-24 bg-bg-main/50 rounded-3xl flex items-center justify-center text-text-muted/60 mb-6 border border-dashed border-border-main/50 shadow-inner">
                                        <MapPin size={40} />
                                    </div>
                                    <h4 className="text-xl font-black text-text-main tracking-tight">No areas found</h4>
                                    <p className="text-sm text-text-muted mt-2 max-w-sm font-medium">Try adjusting your search or filters.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {areas.map((area, index) => {
                                        const total = area.slots.reduce((acc, slot) => acc + slot.totalSlots, 0);
                                        const available = area.slots.reduce((acc, slot) => acc + slot.availableSlots, 0);
                                        const percent = total > 0 ? ((total - available) / total) * 100 : 0;

                                        let statusColor = 'text-gray-500 bg-gray-500/10 border-gray-500/20';
                                        if (area.status === 'active') statusColor = 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
                                        if (area.status === 'paused') statusColor = 'text-amber-500 bg-amber-500/10 border-amber-500/20';
                                        if (area.status === 'banned') statusColor = 'text-red-500 bg-red-500/10 border-red-500/20';

                                        return (
                                            <motion.div
                                                key={area.id}
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ delay: index * 0.05 }}
                                                whileHover={{ y: -5 }}
                                                className="bg-bg-main border border-border-main rounded-sm p-5 flex flex-col justify-between shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 relative overflow-hidden group"
                                            >
                                                {/* Background pattern */}
                                                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/5 to-transparent rounded-bl-full -z-0 opacity-0 group-hover:opacity-100 transition-opacity" />

                                                <div className="relative z-10">
                                                    <div className="flex justify-between items-start mb-4">
                                                        <div className="flex gap-3">
                                                            <div className="w-10 h-10 rounded-xl bg-bg-card border border-border-main flex items-center justify-center text-primary shadow-sm">
                                                                <MapPin size={18} />
                                                            </div>
                                                            <div>
                                                                <h3 className="text-sm font-black text-text-main leading-tight max-w-[150px] truncate">{area.name}</h3>
                                                                <span className="text-[9px] font-bold text-text-muted uppercase tracking-widest">{area.parkingType}</span>
                                                            </div>
                                                        </div>
                                                        <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${statusColor}`}>
                                                            {area.status}
                                                        </span>
                                                    </div>

                                                    <div className="space-y-3 mb-6">
                                                        <div>
                                                            <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1">Location</p>
                                                            <p className="text-xs font-medium text-text-main truncate">{area.address}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1">Owner Contact</p>
                                                            <p className="text-xs font-medium text-text-main truncate">{area.user?.name} <span className="opacity-50">|</span> {area.user?.phone}</p>
                                                        </div>
                                                    </div>

                                                    {/* Capacity Progress */}
                                                    <div className="space-y-1.5 mb-6 bg-bg-card p-3 rounded-xl border border-border-main/50">
                                                        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                                                            <span className="text-text-muted">Occupancy</span>
                                                            <span className="text-primary">{Math.round(percent)}%</span>
                                                        </div>
                                                        <div className="w-full h-1.5 bg-border-main rounded-full overflow-hidden">
                                                            <motion.div
                                                                initial={{ width: 0 }}
                                                                animate={{ width: `${percent}%` }}
                                                                className="h-full bg-primary"
                                                            />
                                                        </div>
                                                        <p className="text-[9px] text-text-muted font-bold text-right pt-1">{total - available} / {total} Slots</p>
                                                    </div>
                                                </div>

                                                {/* Actions Footer */}
                                                <div className="pt-4 border-t border-border-main/50 flex items-center justify-between gap-2 relative z-10">
                                                    <div className="flex items-center gap-1">
                                                        <Button
                                                            variant="ghost"
                                                            className="h-8 w-8 p-0 text-text-muted hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                                                            onClick={() => { setSelectedArea(area); setIsViewOpen(true); }}
                                                        >
                                                            <Eye size={14} />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            className="h-8 w-8 p-0 text-text-muted hover:text-amber-500 hover:bg-amber-500/10 rounded-lg transition-colors"
                                                            onClick={() => { setSelectedArea(area); setIsEditOpen(true); }}
                                                        >
                                                            <Edit2 size={14} />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            className="h-8 w-8 p-0 text-text-muted hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                                            onClick={() => { setSelectedArea(area); setIsDeleteOpen(true); }}
                                                        >
                                                            <Trash2 size={14} />
                                                        </Button>
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        {area.status !== 'active' && (
                                                            <Button
                                                                variant="outline"
                                                                className="h-8 px-2.5 text-[10px] font-black text-emerald-500 border-emerald-500/20 hover:bg-emerald-500 hover:text-white rounded-lg transition-colors uppercase tracking-widest"
                                                                onClick={() => handleStatusUpdate(area.id, 'active')}
                                                            >
                                                                <CheckCircle size={12} className="mr-1.5" /> Activate
                                                            </Button>
                                                        )}
                                                        {area.status === 'active' && (
                                                            <Button
                                                                variant="outline"
                                                                className="h-8 px-2.5 text-[10px] font-black text-amber-500 border-amber-500/20 hover:bg-amber-500 hover:text-white rounded-lg transition-colors uppercase tracking-widest"
                                                                onClick={() => handleStatusUpdate(area.id, 'paused')}
                                                            >
                                                                <ShieldAlert size={12} className="mr-1.5" /> Pause
                                                            </Button>
                                                        )}
                                                        {area.status !== 'banned' && (
                                                            <Button
                                                                variant="outline"
                                                                className="h-8 px-2.5 text-[10px] font-black text-red-500 border-red-500/20 hover:bg-red-500 hover:text-white rounded-lg transition-colors uppercase tracking-widest"
                                                                onClick={() => handleStatusUpdate(area.id, 'banned')}
                                                            >
                                                                <Ban size={12} className="mr-1.5" /> Ban
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Pagination Component */}
                            {meta && (
                                <ServerPagination
                                    currentPage={meta.page}
                                    totalPages={meta.totalPages}
                                    totalItems={meta.total}
                                    itemsPerPage={meta.limit}
                                    onPageChange={setPage}
                                />
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
            {/* Modals */}
            <ParkingViewModal
                isOpen={isViewOpen}
                onOpenChange={setIsViewOpen}
                data={selectedArea}
            />

            <ParkingEditModal
                isOpen={isEditOpen}
                onOpenChange={setIsEditOpen}
                data={selectedArea}
                onSave={handleEdit}
            />

            <ConfirmDelete
                isOpen={isDeleteOpen}
                onOpenChange={setIsDeleteOpen}
                onConfirm={handleDelete}
                title="Delete Parking Area"
                description={`Are you sure you want to delete ${selectedArea?.name}? This action cannot be undone and will remove all associated slots.`}
            />
        </div>
    );
}
