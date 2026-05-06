import { useState } from 'react';
import { 
    Plus, 
    User, 
    Phone, 
    Mail, 
    Calendar,
    Eye,
    Edit2,
    Trash2
} from 'lucide-react';
import { FilterBar } from '@/components/shared/FilterBar';
import { DataTable } from '@/components/shared/DataTable';
import { Button } from '@/components/ui/button';
import { ViewModal } from '../components/shared/ViewModal';
import { EditModal } from '../components/shared/EditModal';
import { ConfirmDelete } from '@/components/shared/ConfirmDelete';

// --- Types & Mock Data ---

interface UserData {
    id: string;
    name: string;
    email: string;
    phone: string;
    bookings: number;
    status: 'Active' | 'Inactive' | 'Suspended';
    joined: string;
    avatar: string;
}

const initialUsers: UserData[] = [
    {
        id: "USR-001",
        name: "Rahul Sharma",
        email: "rahul.s@example.com",
        phone: "+91 98765 43210",
        bookings: 42,
        status: "Active",
        joined: "12 Oct 2023",
        avatar: "RS"
    },
    {
        id: "USR-002",
        name: "Ananya Patel",
        email: "ananya.p@example.com",
        phone: "+91 99887 76655",
        bookings: 15,
        status: "Active",
        joined: "05 Nov 2023",
        avatar: "AP"
    },
    {
        id: "USR-003",
        name: "Vikram Singh",
        email: "vikram.v@example.com",
        phone: "+91 91234 56789",
        bookings: 8,
        status: "Inactive",
        joined: "20 Jan 2024",
        avatar: "VS"
    },
    {
        id: "USR-004",
        name: "Sneha Reddy",
        email: "sneha.r@example.com",
        phone: "+91 90000 11111",
        bookings: 31,
        status: "Active",
        joined: "15 Feb 2024",
        avatar: "SR"
    },
    {
        id: "USR-005",
        name: "Arjun Mehta",
        email: "arjun.m@example.com",
        phone: "+91 88776 65544",
        bookings: 0,
        status: "Suspended",
        joined: "01 Mar 2024",
        avatar: "AM"
    }
];

const Users = () => {
    const [users, setUsers] = useState<UserData[]>(initialUsers);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    
    const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<UserData | null>(null);

    const filteredUsers = users.filter(u => {
        const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                             u.id.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = !statusFilter || u.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const handleDelete = () => {
        if (userToDelete) {
            setUsers(users.filter(u => u.id !== userToDelete.id));
            setIsDeleteOpen(false);
            setUserToDelete(null);
        }
    };

    return (
        <div className="space-y-6 pb-12">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-black text-text-main tracking-tighter">User List</h2>
                    <p className="text-[11px] text-text-muted font-bold uppercase tracking-[0.2em] mt-1">Manage and monitor all platform customers</p>
                </div>
                <Button
                    className="bg-primary text-white border-primary shadow-md shadow-primary/20 hover:bg-primary/90 px-4 py-2.5 h-auto rounded-lg flex items-center gap-2 group transition-all"
                >
                    <Plus size={14} className="group-hover:scale-110 transition-transform" />
                    <span className="text-[9px] font-black uppercase tracking-widest">Add New User</span>
                </Button>
            </div>

            {/* Reusable Filter Bar */}
            <FilterBar 
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                searchPlaceholder="Search by name, email, or ID..."
                filterValue={statusFilter}
                onFilterChange={setStatusFilter}
                filterOptions={[
                    { label: "Active", value: "Active" },
                    { label: "Inactive", value: "Inactive" },
                    { label: "Suspended", value: "Suspended" }
                ]}
                filterPlaceholder="All Status"
            />

            {/* User Data Table */}
            <DataTable 
                data={filteredUsers}
                itemsPerPage={3}
                onRowClick={(user) => { setSelectedUser(user); setIsDetailsOpen(true); }}
                emptyStateIcon={User}
                emptyStateTitle="No users found"
                emptyStateDescription="Try adjusting your search or status filter."
                columns={[
                    {
                        header: "User Details",
                        accessor: (user) => (
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-primary/10 text-primary border border-primary/20 rounded-2xl flex items-center justify-center text-xs font-black">
                                    {user.avatar}
                                </div>
                                <div>
                                    <h5 className="text-sm font-black text-text-main leading-tight">{user.name}</h5>
                                    <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mt-0.5">ID: {user.id}</p>
                                </div>
                            </div>
                        )
                    },
                    {
                        header: "Contact Info",
                        accessor: (user) => (
                            <div className="space-y-1">
                                <div className="flex items-center gap-2 text-text-main">
                                    <Mail size={12} className="text-text-muted" />
                                    <span className="text-[11px] font-medium">{user.email}</span>
                                </div>
                                <div className="flex items-center gap-2 text-text-main">
                                    <Phone size={12} className="text-text-muted" />
                                    <span className="text-[11px] font-medium">{user.phone}</span>
                                </div>
                            </div>
                        )
                    },
                    {
                        header: "Activity",
                        accessor: (user) => (
                            <div>
                                <p className="text-sm font-black text-text-main leading-none">{user.bookings}</p>
                                <p className="text-[9px] font-bold text-text-muted uppercase mt-1">Total Bookings</p>
                            </div>
                        )
                    },
                    {
                        header: "Status",
                        accessor: (user) => {
                            const styles = {
                                Active: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
                                Inactive: 'bg-slate-500/10 text-slate-500 border-slate-500/20',
                                Suspended: 'bg-red-500/10 text-red-500 border-red-500/20'
                            };
                            return (
                                <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border ${styles[user.status]}`}>
                                    {user.status}
                                </span>
                            );
                        }
                    },
                    {
                        header: "Joined",
                        accessor: (user) => (
                            <div className="flex items-center gap-2 text-text-muted">
                                <Calendar size={12} />
                                <span className="text-[11px] font-bold uppercase tracking-tighter">{user.joined}</span>
                            </div>
                        )
                    },
                    {
                        header: "Actions",
                        textRight: true,
                        accessor: (user) => (
                            <div className="flex items-center justify-end gap-2">
                                <Button
                                    variant="ghost" size="icon" className="rounded-xl h-10 w-10 text-text-muted hover:text-primary hover:bg-primary/10 transition-colors"
                                    onClick={(e) => { e.stopPropagation(); setSelectedUser(user); setIsDetailsOpen(true); }}
                                >
                                    <Eye size={16} />
                                </Button>
                                <Button
                                    variant="ghost" size="icon" className="rounded-xl h-10 w-10 text-text-muted hover:text-amber-500 hover:bg-amber-500/10 transition-colors"
                                    onClick={(e) => { e.stopPropagation(); setSelectedUser(user); setIsEditOpen(true); }}
                                >
                                    <Edit2 size={16} />
                                </Button>
                                <Button
                                    variant="ghost" size="icon" className="rounded-xl h-10 w-10 text-text-muted hover:text-red-500 hover:bg-red-500/10 transition-colors"
                                    onClick={(e) => { e.stopPropagation(); setUserToDelete(user); setIsDeleteOpen(true); }}
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
                type="user"
                data={selectedUser}
            />

            <EditModal 
                isOpen={isEditOpen}
                onOpenChange={setIsEditOpen}
                type="user"
                data={selectedUser}
                onSave={() => setIsEditOpen(false)}
            />

            <ConfirmDelete 
                isOpen={isDeleteOpen}
                onOpenChange={setIsDeleteOpen}
                onConfirm={handleDelete}
                title="Delete User Account"
                description={
                    <>
                        Are you sure you want to permanently delete the account for <span className="font-black text-red-500">{userToDelete?.name}</span>? This action will immediately terminate all active sessions and booking history.
                    </>
                }
            />
        </div>
    );
};

export default Users;