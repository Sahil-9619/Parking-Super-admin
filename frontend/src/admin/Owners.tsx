import { useEffect, useMemo, useState } from 'react';
import {
    BadgeCheck,
    Ban,
    Building2,
    Calendar,
    Edit2,
    Eye,
    MapPin,
    Plus,
    ShieldCheck,
    Star,
    Trash2,
    Wallet
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { ConfirmDelete } from '@/components/shared/ConfirmDelete';
import { DataTable } from '@/components/shared/DataTable';
import { FilterBar } from '@/components/shared/FilterBar';
import { EditModal } from '../components/shared/EditModal';
import { ViewModal } from '../components/shared/ViewModal';
import { ParkingViewModal } from '../components/shared/ParkingViewModal';
import { ownerService, type Owner } from '@/services/ownerService';


type AdminOwner = Owner;

type OwnersResponse = {
    data?: AdminOwner[] | { data?: AdminOwner[] };
};


const getOwnerList = (response: OwnersResponse | AdminOwner[]): AdminOwner[] => {
    if (Array.isArray(response)) return response;
    if (Array.isArray(response?.data)) return response.data;
    if (Array.isArray(response?.data?.data)) return response.data.data;
    return [];
};

const formatDate = (date?: string) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString();
};

const formatCurrency = (amount?: string | number) => {
    const value = Number(amount ?? 0);
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(Number.isNaN(value) ? 0 : value);
};

const formatLabel = (value?: string | null) => {
    if (!value) return 'N/A';
    return value.replace(/_/g, ' ');
};

export default function Owners() {
    const [owners, setOwners] = useState<AdminOwner[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [selectedOwner, setSelectedOwner] = useState<AdminOwner | null>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [ownerToDelete, setOwnerToDelete] = useState<AdminOwner | null>(null);
    const [selectedParking, setSelectedParking] = useState<any>(null);
    const [isParkingDetailsOpen, setIsParkingDetailsOpen] = useState(false);


    useEffect(() => {
        fetchOwners();

        const handleRefresh = () => fetchOwners();
        window.addEventListener('refresh-data', handleRefresh);
        return () => window.removeEventListener('refresh-data', handleRefresh);
    }, []);


    const fetchOwners = async () => {
        try {
            setLoading(true);
            const response = await ownerService.getAllOwners();
            setOwners(getOwnerList(response));
        } catch (error: any) {
            console.error('Failed to fetch owners:', error);
            if (error.message === 'Invalid token' || error.status === 403) {
                // Clear token and potentially redirect (manual for now as we only work on 2 files)
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                alert('Your session has expired or is invalid. Please log in again.');
                window.location.href = '/'; // Login is at root
            }
            setOwners([]);
        } finally {
            setLoading(false);
        }
    };


    const handleDelete = async () => {
        if (!ownerToDelete) return;

        try {
            await ownerService.deleteOwner(ownerToDelete.id);
            await fetchOwners(); // Refresh list
            setIsDeleteOpen(false);
            setOwnerToDelete(null);
        } catch (error) {
            console.error('Failed to delete owner:', error);
        }
    };

    const handleUpdate = async (formData: any) => {
        if (!selectedOwner) return;
        try {
            await ownerService.updateOwner(selectedOwner.id, formData);
            await fetchOwners();
            setIsEditOpen(false);
        } catch (error) {
            console.error('Failed to update owner:', error);
        }
    };

    const handleToggleStatus = async (owner: AdminOwner) => {
        try {
            if (owner.status === 'suspended') {
                await ownerService.enableOwner(owner.id);
            } else {
                await ownerService.disableOwner(owner.id);
            }
            await fetchOwners();
        } catch (error) {
            console.error('Failed to toggle owner status:', error);
        }
    };


    const handleApproveKyc = async (ownerId: string, status: 'approved' | 'rejected') => {
        try {
            await ownerService.approveKyc(ownerId, status);
            await fetchOwners();
        } catch (error) {
            console.error('Failed to update KYC status:', error);
        }
    };

    const statusOptions = useMemo(() => {
        const statuses = owners
            .map((owner) => owner.status)
            .filter((status): status is AdminOwner['status'] => Boolean(status));

        return Array.from(new Set(statuses)).map((status) => ({
            label: formatLabel(status),
            value: status
        }));
    }, [owners]);

    const filteredOwners = owners.filter((owner) => {
        const search = searchQuery.toLowerCase().trim();
        const searchableValues = [
            owner.id,
            owner.name,
            owner.email,
            owner.phone,
            owner.status,
            owner.ownerProfile?.ownerType,
            owner.ownerProfile?.gstNumber,
            owner.ownerProfile?.verificationStatus,
            ...(owner.parkings?.map((parking) => parking.name) || [])
        ];

        const matchesSearch =
            !search ||
            searchableValues.some((value) => value?.toString().toLowerCase().includes(search));

        const matchesStatus = !statusFilter || owner.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const selectedOwnerModalData = selectedOwner
        ? {
            id: selectedOwner.id,
            name: selectedOwner.name || 'Unnamed Owner',
            email: selectedOwner.email || 'N/A',
            phone: selectedOwner.phone || 'N/A',
            status: formatLabel(selectedOwner.status),
            joined: formatDate(selectedOwner.createdAt),
            parkings: selectedOwner._count?.parkings ?? selectedOwner.parkings?.length ?? 0,
            company: formatLabel(selectedOwner.ownerProfile?.ownerType),
            gstNumber: selectedOwner.ownerProfile?.gstNumber || 'N/A',
            verificationStatus: formatLabel(selectedOwner.ownerProfile?.verificationStatus),
            strikeCount: selectedOwner.ownerProfile?.strikeCount ?? 0,
            walletBalance: selectedOwner.walletBalance?.toString() || '0',

            updated: formatDate(selectedOwner.updatedAt),
            parkingList: selectedOwner.parkings || [],
            role: formatLabel(selectedOwner.userType)
        }


        : null;



    if (loading) {
        return (
            <div className="flex min-h-[320px] items-center justify-center text-[11px] font-black uppercase tracking-[0.2em] text-text-muted">
                Loading owners...
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-black text-text-main tracking-tighter">Owner List</h2>
                    <p className="text-[11px] text-text-muted font-bold uppercase tracking-[0.2em] mt-1">
                        Manage and monitor all parking facility owners
                    </p>
                </div>
                <Button 
                    onClick={() => {
                        setSelectedOwner(null);
                        setIsEditOpen(true);
                    }}
                    className="bg-primary text-white border-primary shadow-md shadow-primary/20 hover:bg-primary/90 px-4 py-2.5 h-auto rounded-lg flex items-center gap-2 group transition-all"
                >
                    <Plus size={14} className="group-hover:scale-110 transition-transform" />
                    <span className="text-[9px] font-black uppercase tracking-widest">Add New Owner</span>
                </Button>
            </div>

            <FilterBar
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                searchPlaceholder="Search by name, email, phone, GST, parking, or ID..."
                filterValue={statusFilter}
                onFilterChange={setStatusFilter}
                filterOptions={statusOptions}
                filterPlaceholder="All Status"
            />

            <DataTable
                data={filteredOwners}
                itemsPerPage={10}

                onRowClick={(owner) => {
                    setSelectedOwner(owner);
                    setIsDetailsOpen(true);
                }}
                emptyStateIcon={Building2}
                emptyStateTitle="No owners found"
                emptyStateDescription="Adjust your search or filters to find what you're looking for."
                columns={[
                    {
                        header: 'Sr No',
                        textCenter: true,
                        accessor: (_, index) => (
                            <span className="text-xs font-black text-text-muted">
                                {(index + 1).toString().padStart(2, '0')}
                            </span>
                        )
                    },
                    {
                        header: 'Owner Name',
                        accessor: (owner) => (
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-primary/10 text-primary border border-primary/20 rounded-xl flex items-center justify-center text-xs font-black group-hover:scale-105 transition-transform duration-300">
                                    {owner.name?.charAt(0).toUpperCase() || 'O'}
                                </div>
                                <div className="flex flex-col">
                                    <h5 className="text-sm font-black text-text-main leading-tight group-hover:text-primary transition-colors truncate max-w-[150px]">
                                        {owner.name || 'Unnamed Owner'}
                                    </h5>
                                </div>
                            </div>
                        )
                    },
                    {
                        header: 'Contact Email',
                        accessor: (owner) => (
                            <span className="text-[11px] font-bold lowercase text-text-main">
                                {owner.email}
                            </span>
                        )
                    },

                    {
                        header: 'Parking Lots',
                        textCenter: true,
                        accessor: (owner) => (
                            <span className="text-sm font-black text-text-main">
                                {owner._count?.parkings ?? owner.parkings?.length ?? 0}
                            </span>
                        )
                    },

                    {
                        header: 'Joined Date',
                        textCenter: true,
                        accessor: (owner) => (
                            <span className="text-[11px] font-bold uppercase text-text-muted tracking-tighter">
                                {formatDate(owner.createdAt)}
                            </span>
                        )
                    },
                    {
                        header: 'Status',
                        textCenter: true,
                        accessor: (owner) => {
                            const isActive = owner.status?.toLowerCase() === 'active';
                            return (
                                <span
                                    className={`inline-flex px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border transition-all ${isActive
                                        ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                                        : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                                        }`}
                                >
                                    {formatLabel(owner.status)}
                                </span>
                            );
                        }
                    },
                    {
                        header: 'Actions',
                        textRight: true,
                        accessor: (owner) => (
                            <div className="flex items-center justify-end gap-2">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="rounded-xl h-9 w-9 text-text-muted hover:text-primary hover:bg-primary/10 transition-colors"
                                    onClick={(event) => {
                                        event.stopPropagation();
                                        setSelectedOwner(owner);
                                        setIsDetailsOpen(true);
                                    }}
                                >
                                    <Eye size={16} />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="rounded-xl h-9 w-9 text-text-muted hover:text-amber-500 hover:bg-amber-500/10 transition-colors"
                                    onClick={(event) => {
                                        event.stopPropagation();
                                        setSelectedOwner(owner);
                                        setIsEditOpen(true);
                                    }}
                                >
                                    <Edit2 size={16} />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="rounded-xl h-9 w-9 text-text-muted hover:text-red-500 hover:bg-red-500/10 transition-colors"
                                    onClick={(event) => {
                                        event.stopPropagation();
                                        setOwnerToDelete(owner);
                                        setIsDeleteOpen(true);
                                    }}
                                >
                                    <Trash2 size={16} />
                                </Button>
                            </div>
                        )
                    }
                ]}

            />

            <ViewModal
                isOpen={isDetailsOpen}
                onOpenChange={setIsDetailsOpen}
                type="owner"
                data={selectedOwnerModalData}
                onViewParking={(parking) => {
                    setSelectedParking(parking);
                    setIsParkingDetailsOpen(true);
                }}
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
                onSave={handleUpdate}
            />


            <ConfirmDelete
                isOpen={isDeleteOpen}
                onOpenChange={setIsDeleteOpen}
                onConfirm={handleDelete}
                title="Delete Owner Account"
                description={
                    <>
                        Are you sure you want to delete{' '}
                        <span className="font-black text-red-500">{ownerToDelete?.name}</span>? This action
                        is irreversible and will remove this owner from the current admin view.
                    </>
                }
            />
        </div>
    );
}
