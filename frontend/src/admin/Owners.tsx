import { useState } from 'react';
import {
    Plus,
    Edit2,
    Trash2,
    Eye,
    Building2,
    MapPin,
    ArrowUpRight,
    ArrowDownRight
} from 'lucide-react';

// Official Shadcn UI Components
import { Button } from '@/components/ui/button';

// Shared Reusable Components
import { DataTable } from '@/components/shared/DataTable';
import { FilterBar } from '@/components/shared/FilterBar';
import { ConfirmDelete } from '@/components/shared/ConfirmDelete';
import { ViewModal } from '../components/shared/ViewModal';
import { EditModal } from '../components/shared/EditModal';

// --- Types & Mock Data ---        

interface Owner {
    id: string;
    name: string;
    ownerName: string;
    email: string;
    phone: string;
    areas: number;
    revenue: string;
    growth: string;
    status: string;
    joined: string;
    avatar: string;
    company: string;
}

const initialOwners: Owner[] = [
    {
        id: "OWN-001",
        name: "Reliance Greens",
        ownerName: "Akash Ambani",
        email: "akash@reliance.com",
        phone: "+91 98765 43210",
        areas: 12,
        revenue: "$45,200",
        growth: "+12.5%",
        status: "Active",
        joined: "12 Oct 2023",
        avatar: "RG",
        company: "Reliance Industries Ltd"
    },
    {
        id: "OWN-002",
        name: "Urban Park Co",
        ownerName: "Siddharth Malhotra",
        email: "sid@urbanpark.in",
        phone: "+91 99887 76655",
        areas: 8,
        revenue: "$28,450",
        growth: "+8.2%",
        status: "Active",
        joined: "05 Nov 2023",
        avatar: "UP",
        company: "Urban Infrastructure"
    },
    {
        id: "OWN-003",
        name: "Metro Parking",
        ownerName: "Priya Sharma",
        email: "priya@metropark.com",
        phone: "+91 91234 56789",
        areas: 15,
        revenue: "$52,100",
        growth: "-2.4%",
        status: "Under Review",
        joined: "20 Jan 2024",
        avatar: "MP",
        company: "Metro Services"
    },
    {
        id: "OWN-004",
        name: "Skyline Infra",
        ownerName: "Rahul Verma",
        email: "rahul@skyline.io",
        phone: "+91 90000 11111",
        areas: 5,
        revenue: "$12,800",
        growth: "+15.1%",
        status: "Active",
        joined: "15 Feb 2024",
        avatar: "SI",
        company: "Skyline Real Estate"
    },
];

export default function Owners() {
    const [owners, setOwners] = useState(initialOwners);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [selectedOwner, setSelectedOwner] = useState<Owner | null>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [ownerToDelete, setOwnerToDelete] = useState<Owner | null>(null);

    const filteredOwners = owners.filter(o => {
        const matchesSearch = o.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            o.ownerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            o.id.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = !statusFilter || o.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const handleDelete = () => {
        if (ownerToDelete) {
            setOwners(owners.filter(o => o.id !== ownerToDelete.id));
            setIsDeleteOpen(false);
            setOwnerToDelete(null);
        }
    };

    return (
        <div className="space-y-6 pb-12">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-black text-text-main tracking-tighter">Owner List</h2>
                    <p className="text-[11px] text-text-muted font-bold uppercase tracking-[0.2em] mt-1">Manage and monitor all parking facility owners</p>
                </div>
                <Button
                    className="bg-primary text-white border-primary shadow-md shadow-primary/20 hover:bg-primary/90 px-4 py-2.5 h-auto rounded-lg flex items-center gap-2 group transition-all"
                >
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
                    { label: "Active", value: "Active" },
                    { label: "Under Review", value: "Under Review" }
                ]}
                filterPlaceholder="All Status"
            />


            <DataTable
                data={filteredOwners}
                itemsPerPage={3}
                onRowClick={(owner) => { setSelectedOwner(owner); setIsDetailsOpen(true); }}
                emptyStateIcon={Building2}
                emptyStateTitle="No owners found"
                emptyStateDescription="Adjust your search or filters to find what you're looking for."
                columns={[
                    {
                        header: "Owner & Company",
                        accessor: (owner) => (
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-primary/10 text-primary border border-primary/20 rounded-2xl flex items-center justify-center text-xs font-black group-hover:scale-105 transition-transform duration-300">
                                    {owner.avatar}
                                </div>
                                <div className="min-w-0">
                                    <h5 className="text-sm font-black text-text-main leading-tight group-hover:text-primary transition-colors truncate">{owner.name}</h5>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">ID: {owner.id}</span>
                                        <span className="w-1 h-1 rounded-full bg-border-main" />
                                        <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest truncate">{owner.company}</span>
                                    </div>
                                </div>
                            </div>
                        )
                    },
                    {
                        header: "Inventory",
                        accessor: (owner) => (
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-bg-main rounded-xl text-text-muted border border-border-main/50">
                                    <MapPin size={14} />
                                </div>
                                <div>
                                    <p className="text-sm font-black text-text-main leading-none">{owner.areas}</p>
                                    <p className="text-[9px] font-bold text-text-muted uppercase mt-1">Total Areas</p>
                                </div>
                            </div>
                        )
                    },
                    {
                        header: "Revenue Share",
                        accessor: (owner) => (
                            <div className="flex flex-col gap-0.5">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-black text-text-main">{owner.revenue}</span>
                                    <span className={`text-[10px] font-bold flex items-center gap-0.5 ${owner.growth.startsWith('+') ? 'text-emerald-500' : 'text-red-500'}`}>
                                        {owner.growth.startsWith('+') ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                                        {owner.growth}
                                    </span>
                                </div>
                                <p className="text-[9px] font-bold text-text-muted uppercase tracking-widest">Platform Commission: 15%</p>
                            </div>
                        )
                    },
                    {
                        header: "Status",
                        accessor: (owner) => (
                            <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${owner.status === 'Active'
                                ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 shadow-sm shadow-emerald-500/5'
                                : 'bg-amber-500/10 text-amber-500 border-amber-500/20 shadow-sm shadow-amber-500/5'
                                }`}>
                                {owner.status}
                            </span>
                        )
                    },
                    {
                        header: "Actions",
                        textRight: true,
                        accessor: (owner) => (
                            <div className="flex items-center justify-end gap-2">
                                <Button
                                    variant="ghost" size="icon" className="rounded-xl h-10 w-10 text-text-muted hover:text-primary hover:bg-primary/10 transition-colors"
                                    onClick={(e) => { e.stopPropagation(); setSelectedOwner(owner); setIsDetailsOpen(true); }}
                                >
                                    <Eye size={16} />
                                </Button>
                                <Button
                                    variant="ghost" size="icon" className="rounded-xl h-10 w-10 text-text-muted hover:text-amber-500 hover:bg-amber-500/10 transition-colors"
                                    onClick={(e) => { e.stopPropagation(); setSelectedOwner(owner); setIsEditOpen(true); }}
                                >
                                    <Edit2 size={16} />
                                </Button>
                                <Button
                                    variant="ghost" size="icon" className="rounded-xl h-10 w-10 text-text-muted hover:text-red-500 hover:bg-red-500/10 transition-colors"
                                    onClick={(e) => { e.stopPropagation(); setOwnerToDelete(owner); setIsDeleteOpen(true); }}
                                >
                                    <Trash2 size={16} />
                                </Button>
                            </div>
                        )
                    }
                ]}
            />

            {/* --- Modals --- */}
            <ViewModal
                isOpen={isDetailsOpen}
                onOpenChange={setIsDetailsOpen}
                type="owner"
                data={selectedOwner}
            />

            <EditModal
                isOpen={isEditOpen}
                onOpenChange={setIsEditOpen}
                type="owner"
                data={selectedOwner}
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
