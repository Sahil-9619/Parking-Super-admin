import { useState, useEffect } from 'react';
import {
    User,
    Phone,
    Mail,
    Calendar,
    Eye,
    Edit2,
    Trash2,
    Download
} from 'lucide-react';
import { FilterBar } from '@/components/shared/FilterBar';
import { DataTable } from '@/components/shared/DataTable';
import { ServerPagination } from '@/components/shared/ServerPagination';
import { Button } from '@/components/ui/button';
import { ViewModal } from '../components/shared/ViewModal';
import { EditModal } from '../components/shared/EditModal';
import { ConfirmDelete } from '@/components/shared/ConfirmDelete';
import { showStatusToast } from '@/lib/utils';
import toast from 'react-hot-toast';
import { userService } from '@/services/userService';
import type { User as PlatformUser } from '@/services/userService';

const Users = () => {
    const [users, setUsers] = useState<PlatformUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [page, setPage] = useState(1);
    const [meta, setMeta] = useState<any>(null);

    const [selectedUser, setSelectedUser] = useState<PlatformUser | null>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<PlatformUser | null>(null);

    const fetchDrivers = async () => {
        try {
            setLoading(true);
            const response = await userService.getAllDrivers({
                page,
                limit: 10,
                search: searchQuery,
                status: statusFilter
            });
            setUsers(response.data || []);
            setMeta(response.meta || null);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDrivers();

        const handleRefresh = () => fetchDrivers();
        window.addEventListener('refresh-data', handleRefresh);
        return () => window.removeEventListener('refresh-data', handleRefresh);
    }, [page, searchQuery, statusFilter]);

    useEffect(() => {
        setPage(1);
    }, [searchQuery, statusFilter]);

    const handleDelete = async () => {
        try {
            if (!userToDelete) return;
            await userService.deleteUser(userToDelete.id);
            fetchDrivers();
            setIsDeleteOpen(false);
            setUserToDelete(null);
        } catch (error) {
            console.error(error);
        }
    };

    const handleUpdate = async (formData: any) => {
        if (!selectedUser) return;
        try {
            await userService.updateUser(selectedUser.id, formData);
            toast.success('User details updated successfully', {
                style: { border: '1px solid rgba(16, 185, 129, 0.2)', padding: '16px', color: '#10b981', background: 'rgba(16, 185, 129, 0.1)', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '12px' },
            });
            fetchDrivers();
            setIsEditOpen(false);
        } catch (error: any) {
            console.error(error);
            showStatusToast('rejected', error.message || 'Failed to update user');
        }
    };

    const handleExportExcel = () => {
        if (users.length === 0) {
            toast.error('No data to export');
            return;
        }

        const headers = ['ID', 'Name', 'Email', 'Phone', 'Role', 'Status', 'Wallet Balance', 'Joined Date'];

        const csvRows = users.map(user => [
            user.id,
            `"${user.name || ''}"`,
            `"${user.email || ''}"`,
            `"${user.phone || ''}"`,
            user.userType || '',
            user.status || '',
            user.walletBalance || 0,
            user.createdAt ? new Date(user.createdAt).toLocaleDateString() : ''
        ].join(','));

        const csvString = [headers.join(','), ...csvRows].join('\n');

        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `users_export_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        toast.success('Export downloaded successfully');
    };




    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="space-y-6 pb-12">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-black text-text-main tracking-tighter">User List</h2>
                    <p className="text-[11px] text-text-muted font-bold uppercase tracking-[0.2em] mt-1">Manage and monitor all platform customers</p>
                </div>
                <Button
                    onClick={handleExportExcel}
                    className="bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-500/20 hover:bg-emerald-600 px-4 py-2.5 h-auto rounded-lg flex items-center gap-2 group transition-all"
                >
                    <Download size={14} className="group-hover:translate-y-0.5 transition-transform" />
                    <span className="text-[9px] font-black uppercase tracking-widest">Export to Excel</span>
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
                    { label: "Active", value: "active" },
                    { label: "Banned", value: "banned" }
                ]}
                filterPlaceholder="All Status"
            />

            {/* User Data Table */}
            <DataTable
                data={users}

                onRowClick={(user) => { setSelectedUser(user); setIsDetailsOpen(true); }}
                emptyStateIcon={User}
                emptyStateTitle="No users found"
                emptyStateDescription="Try adjusting your search or status filter."
                columns={[
                    {
                        header: 'Sr No',
                        textCenter: true,
                        accessor: (_, index) => (
                            <span className="text-xs font-black text-text-muted">
                                {((page - 1) * 10 + index + 1).toString().padStart(2, '0')}
                            </span>
                        )
                    },
                    {
                        header: "User Details",
                        accessor: (user) => (
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-primary/10 text-primary border border-primary/20 rounded-xl flex items-center justify-center text-xs font-black">
                                    {user.name?.charAt(0).toUpperCase()}
                                </div>
                                <h5 className="text-sm font-black text-text-main leading-tight">{user.name}</h5>
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
                        header: "Account Role",
                        textCenter: true,
                        accessor: (user) => (
                            <div>
                                <p className="text-[10px] font-black text-primary uppercase tracking-widest bg-primary/5 px-3 py-1 rounded-lg border border-primary/10">
                                    {user.userType}
                                </p>
                            </div>
                        )
                    },


                    {
                        header: "Status",
                        accessor: (user) => {
                            const styles: Record<string, string> = {
                                active: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
                                banned: 'bg-red-500/10 text-red-500 border-red-500/20'
                            };
                            const normalizedStatus = user.status?.toLowerCase() || 'active';
                            return (
                                <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border ${styles[normalizedStatus] || styles.active}`}>
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
                                <span className="text-[11px] font-bold uppercase tracking-tighter">{user.createdAt
                                    ? new Date(user.createdAt).toLocaleDateString()
                                    : 'N/A'}</span>
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

            {meta && (
                <ServerPagination
                    currentPage={page}
                    totalPages={meta.totalPages}
                    totalItems={meta.total}
                    itemsPerPage={10}
                    onPageChange={setPage}
                />
            )}

            {/* --- Modals --- */}

            <ViewModal
                isOpen={isDetailsOpen}
                onOpenChange={setIsDetailsOpen}
                type="user"
                data={selectedUser ? {
                    ...selectedUser,
                    role: selectedUser.userType ? selectedUser.userType.charAt(0).toUpperCase() + selectedUser.userType.slice(1) : 'User',
                    joined: selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString() : 'N/A',
                    updated: selectedUser.updatedAt ? new Date(selectedUser.updatedAt).toLocaleDateString() : 'N/A',
                    walletBalance: selectedUser.walletBalance?.toString() || '0'
                } : null}

            />


            <EditModal
                isOpen={isEditOpen}
                onOpenChange={setIsEditOpen}
                type="user"
                data={selectedUser ? {
                    ...selectedUser,
                    role: selectedUser.userType ? selectedUser.userType.charAt(0).toUpperCase() + selectedUser.userType.slice(1) : 'User',
                    joined: selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString() : 'N/A',
                    updated: selectedUser.updatedAt ? new Date(selectedUser.updatedAt).toLocaleDateString() : 'N/A',
                    walletBalance: selectedUser.walletBalance?.toString() || '0'
                } : null}

                onSave={handleUpdate}
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