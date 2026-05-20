import { useEffect, useState } from 'react';
import {
    Plus,
    Edit2,
    Trash2,
    Eye,
    Building2,
    MapPin,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/shared/DataTable';
import { FilterBar } from '@/components/shared/FilterBar';
import { ConfirmDelete } from '@/components/shared/ConfirmDelete';
import { ViewModal } from '../components/shared/ViewModal';
import { EditModal } from '../components/shared/EditModal';
import { ParkingViewModal } from '@/components/shared/ParkingViewModal';
import type { Owner } from '@/services/ownerService';
import { ownerService } from '@/services/ownerService';

export default function Owners() {
    const [owners, setOwners] = useState<Owner[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [selectedOwner, setSelectedOwner] = useState<Owner | null>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [ownerToDelete, setOwnerToDelete] = useState<Owner | null>(null);
    const [selectedParking, setSelectedParking] = useState<any | null>(null);
    const [isParkingDetailsOpen, setIsParkingDetailsOpen] = useState(false);

    const fetchOwners = async () => {
        try {
            setLoading(true);
            const response = await ownerService.getAllOwners();
            setOwners(response.data || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOwners();
    }, []);

    useEffect(() => {
        const handleRefresh = () => fetchOwners();
        window.addEventListener('refresh-data', handleRefresh);
        return () => window.removeEventListener('refresh-data', handleRefresh);
    }, []);

    const filteredOwners = owners.filter((owner) => {
        const search = searchQuery.toLowerCase();
        const matchesSearch =
            owner.name?.toLowerCase().includes(search) ||
            owner.email?.toLowerCase().includes(search) ||
            owner.phone?.toLowerCase().includes(search);

        const matchesStatus = !statusFilter || owner.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const handleDelete = async () => {
        if (!ownerToDelete) return;

        await ownerService.deleteOwner(ownerToDelete.id);
        setOwners((currentOwners) => currentOwners.filter((owner) => owner.id !== ownerToDelete.id));
        setIsDeleteOpen(false);
        setOwnerToDelete(null);
    };

    const selectedOwnerModalData = selectedOwner ? {
        id: selectedOwner.id,
        name: selectedOwner.name,
        email: selectedOwner.email,
        phone: selectedOwner.phone,
        status: selectedOwner.status,
        joined: selectedOwner.createdAt ? new Date(selectedOwner.createdAt).toLocaleDateString() : 'N/A',
        updated: selectedOwner.updatedAt ? new Date(selectedOwner.updatedAt).toLocaleDateString() : 'N/A',
        company: selectedOwner.ownerProfile?.ownerType,
        gstNumber: selectedOwner.ownerProfile?.gstNumber,
        verificationStatus: selectedOwner.ownerProfile?.verificationStatus,
        strikeCount: selectedOwner.ownerProfile?.strikeCount,
        walletBalance: `Rs. ${Number(selectedOwner.walletBalance || 0).toLocaleString('en-IN')}`,
        parkingList: selectedOwner.parkings || [],
        role: selectedOwner.userType,
        bankDetails: {
            holder: selectedOwner.ownerProfile?.accountHolderName,
            account: selectedOwner.ownerProfile?.bankAccount,
            ifsc: selectedOwner.ownerProfile?.bankIfsc,
        },
    } : null;

    const handleViewParking = (parking: any) => {
        setSelectedParking(parking);
        setIsParkingDetailsOpen(true);
    };

    return (
        <div className="space-y-6 pb-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-black text-text-main tracking-tighter">Owner List</h2>
                    <p className="text-[11px] text-text-muted font-bold uppercase tracking-[0.2em] mt-1">
                        Manage and monitor all parking facility owners
                    </p>
                </div>
                <Button className="bg-primary text-white border-primary shadow-md shadow-primary/20 hover:bg-primary/90 px-4 py-2.5 h-auto rounded-lg flex items-center gap-2 group transition-all">
                    <Plus size={14} className="group-hover:scale-110 transition-transform" />
                    <span className="text-[9px] font-black uppercase tracking-widest">Add New Owner</span>
                </Button>
            </div>

            <FilterBar
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                searchPlaceholder="Search by name, ID, or company..."
                filterValue={statusFilter}
                onFilterChange={setStatusFilter}
                filterOptions={[
                    { label: 'Active', value: 'active' },
                    { label: 'Pending', value: 'pending' },
                    { label: 'Suspended', value: 'suspended' },
                    { label: 'Banned', value: 'banned' },
                ]}
                filterPlaceholder="All Status"
            />

            {loading ? (
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
                </div>
            ) : (
                <DataTable
                    data={filteredOwners}
                    itemsPerPage={3}
                    onRowClick={(owner) => { setSelectedOwner(owner); setIsDetailsOpen(true); }}
                    emptyStateIcon={Building2}
                    emptyStateTitle="No owners found"
                    emptyStateDescription="Adjust your search or filters to find what you're looking for."
                    columns={[
                        {
                            header: 'Owner & Company',
                            accessor: (owner) => (
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-primary/10 text-primary border border-primary/20 rounded-2xl flex items-center justify-center text-xs font-black group-hover:scale-105 transition-transform duration-300">
                                        {owner.name?.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="min-w-0">
                                        <h5 className="text-sm font-black text-text-main leading-tight group-hover:text-primary transition-colors truncate">
                                            {owner.name}
                                        </h5>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">ID: {owner.id}</span>
                                            <span className="w-1 h-1 rounded-full bg-border-main" />
                                            <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest truncate">{owner.email}</span>
                                        </div>
                                    </div>
                                </div>
                            ),
                        },
                        {
                            header: 'Inventory',
                            accessor: (owner) => (
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-bg-main rounded-xl text-text-muted border border-border-main/50">
                                        <MapPin size={14} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-text-main leading-none">{owner.phone}</p>
                                        <p className="text-[9px] font-bold text-text-muted uppercase mt-1">Phone Number</p>
                                    </div>
                                </div>
                            ),
                        },
                        {
                            header: 'Wallet Balance',
                            accessor: (owner) => (
                                <div className="flex flex-col gap-0.5">
                                    <span className="text-sm font-black text-text-main">
                                        Rs. {Number(owner.walletBalance || 0).toLocaleString('en-IN')}
                                    </span>
                                    <p className="text-[9px] font-bold text-text-muted uppercase tracking-widest">
                                        Parking Count: {owner._count?.parkings || 0}
                                    </p>
                                </div>
                            ),
                        },
                        {
                            header: 'Status',
                            accessor: (owner) => (
                                <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${owner.status === 'active'
                                    ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 shadow-sm shadow-emerald-500/5'
                                    : 'bg-amber-500/10 text-amber-500 border-amber-500/20 shadow-sm shadow-amber-500/5'
                                    }`}>
                                    {owner.status}
                                </span>
                            ),
                        },
                        {
                            header: 'Actions',
                            textRight: true,
                            accessor: (owner) => (
                                <div className="flex items-center justify-end gap-2">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="rounded-xl h-10 w-10 text-text-muted hover:text-primary hover:bg-primary/10 transition-colors"
                                        onClick={(e) => { e.stopPropagation(); setSelectedOwner(owner); setIsDetailsOpen(true); }}
                                    >
                                        <Eye size={16} />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="rounded-xl h-10 w-10 text-text-muted hover:text-amber-500 hover:bg-amber-500/10 transition-colors"
                                        onClick={(e) => { e.stopPropagation(); setSelectedOwner(owner); setIsEditOpen(true); }}
                                    >
                                        <Edit2 size={16} />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="rounded-xl h-10 w-10 text-text-muted hover:text-red-500 hover:bg-red-500/10 transition-colors"
                                        onClick={(e) => { e.stopPropagation(); setOwnerToDelete(owner); setIsDeleteOpen(true); }}
                                    >
                                        <Trash2 size={16} />
                                    </Button>
                                </div>
                            ),
                        },
                    ]}
                />
            )}

            <ViewModal
                isOpen={isDetailsOpen}
                onOpenChange={setIsDetailsOpen}
                type="owner"
                data={selectedOwnerModalData}
                onViewParking={handleViewParking}
            />

            <ParkingViewModal
                isOpen={isParkingDetailsOpen}
                onOpenChange={setIsParkingDetailsOpen}
                data={selectedParking}
            />

            <EditModal
                isOpen={isEditOpen}
                onOpenChange={setIsEditOpen}
                type="owner"
                data={selectedOwnerModalData}
                onSave={() => setIsEditOpen(false)}
            />

            <ConfirmDelete
                isOpen={isDeleteOpen}
                onOpenChange={setIsDeleteOpen}
                onConfirm={handleDelete}
                title="Delete Owner Account"
                description={
                    <>
                        Are you sure you want to delete <span className="font-black text-red-500">{ownerToDelete?.name}</span>? This action is irreversible and will remove all associated parking data from the production system.
                    </>
                }
            />
        </div>
    );
}
