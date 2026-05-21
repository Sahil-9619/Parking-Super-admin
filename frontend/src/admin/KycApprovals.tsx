import { useEffect, useState } from 'react';
import { ShieldCheck, XCircle, CheckCircle, FileText, CreditCard, UserCheck, Eye } from 'lucide-react';
import { showStatusToast } from '@/lib/utils';

import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/shared/DataTable';
import { FilterBar } from '@/components/shared/FilterBar';
import { ConfirmDelete } from '@/components/shared/ConfirmDelete';
import { ownerService } from '@/services/ownerService';
import { DetailsModal } from '@/components/shared/DetailsModal';

export default function KycApprovals() {
    const [kycList, setKycList] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [selectedAction, setSelectedAction] = useState<{ id: string; name: string; status: 'approved' | 'rejected' } | null>(null);

    const [isViewOpen, setIsViewOpen] = useState(false);
    const [selectedProfile, setSelectedProfile] = useState<any>(null);

    const fetchKycList = async () => {
        try {
            setLoading(true);
            const response = await ownerService.getOwnerKycList(statusFilter || undefined);
            setKycList(response.data || []);
        } catch (error: any) {
            showStatusToast('rejected', error.message || 'Failed to load KYC profiles');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchKycList();
    }, [statusFilter]);

    const filteredKyc = kycList.filter((profile) => {
        const search = searchQuery.toLowerCase();
        return (
            profile.user?.name?.toLowerCase().includes(search) ||
            profile.user?.email?.toLowerCase().includes(search) ||
            profile.gstNumber?.toLowerCase().includes(search)
        );
    });

    const handleAction = async () => {
        if (!selectedAction) return;
        try {
            await ownerService.approveKyc(selectedAction.id, selectedAction.status);
            showStatusToast(selectedAction.status, `KYC ${selectedAction.status} successfully`);
            fetchKycList();
        } catch (error: any) {
            showStatusToast('rejected', error.message || `Failed to ${selectedAction.status} KYC`);
        } finally {
            setIsConfirmOpen(false);
            setSelectedAction(null);
        }
    };

    const handleOpenView = (profile: any) => {
        setSelectedProfile(profile);
        setIsViewOpen(true);
    };

    return (
        <div className="space-y-6 pb-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-black text-text-main tracking-tighter">KYC Approvals</h2>
                    <p className="text-[11px] text-text-muted font-bold uppercase tracking-[0.2em] mt-1">
                        Review and approve owner business documents
                    </p>
                </div>
            </div>

            <FilterBar
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                searchPlaceholder="Search by name, email, or GST..."
                filterValue={statusFilter}
                onFilterChange={setStatusFilter}
                filterOptions={[
                    { label: 'All Status', value: '' },
                    { label: 'Pending', value: 'pending' },
                    { label: 'Approved', value: 'approved' },
                    { label: 'Rejected', value: 'rejected' },
                ]}
                filterPlaceholder="Filter by status"
            />

            {loading ? (
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
                </div>
            ) : (
                <DataTable
                    data={filteredKyc}
                    itemsPerPage={5}
                    emptyStateIcon={ShieldCheck}
                    emptyStateTitle="No KYC profiles found"
                    emptyStateDescription="All caught up! There are no pending KYC applications matching your criteria."
                    columns={[
                        {
                            header: 'Owner Details',
                            accessor: (profile) => (
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-primary/10 text-primary border border-primary/20 rounded-xl flex items-center justify-center">
                                        <UserCheck size={18} />
                                    </div>
                                    <div>
                                        <h5 className="text-sm font-black text-text-main">{profile.user?.name}</h5>
                                        <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">{profile.user?.email}</p>
                                    </div>
                                </div>
                            ),
                        },
                        {
                            header: 'Business & Tax Info',
                            accessor: (profile) => (
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest w-16">Type:</span>
                                        <span className="text-xs font-bold text-text-main">{profile.ownerType}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest w-16">GST:</span>
                                        <span className="text-xs font-bold text-text-main">{profile.gstNumber || 'N/A'}</span>
                                    </div>
                                </div>
                            ),
                        },
                        {
                            header: 'Identity Docs',
                            accessor: (profile) => (
                                <div className="space-y-1 bg-bg-main p-2 rounded-lg border border-border-main/50">
                                    <div className="flex items-center gap-2">
                                        <FileText size={12} className="text-text-muted" />
                                        <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest w-12">Aadhar:</span>
                                        <span className="text-xs font-black text-text-main">{profile.aadharNumber || 'N/A'}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CreditCard size={12} className="text-text-muted" />
                                        <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest w-12">PAN:</span>
                                        <span className="text-xs font-black text-text-main">{profile.panNumber || 'N/A'}</span>
                                    </div>
                                </div>
                            ),
                        },
                        {
                            header: 'Status',
                            accessor: (profile) => (
                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${profile.verificationStatus === 'approved'
                                    ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                                    : profile.verificationStatus === 'rejected'
                                        ? 'bg-red-500/10 text-red-500 border-red-500/20'
                                        : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                                    }`}>
                                    {profile.verificationStatus}
                                </span>
                            ),
                        },
                        {
                            header: 'Actions',
                            textRight: true,
                            accessor: (profile) => (
                                <div className="flex items-center justify-end gap-2">
                                    <Button
                                        size="sm"
                                        onClick={() => handleOpenView(profile)}
                                        className="bg-bg-main/50 text-text-main border-border-main shadow-sm hover:bg-bg-main hover:text-primary text-[9px] font-black uppercase tracking-widest px-2.5 py-1.5 h-auto rounded-lg flex items-center gap-1.5"
                                    >
                                        <Eye size={11} /> View
                                    </Button>
                                    {profile.verificationStatus === 'pending' && (
                                        <>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all rounded-lg text-xs font-bold"
                                                onClick={() => {
                                                    setSelectedAction({ id: profile.userId, name: profile.user?.name, status: 'approved' });
                                                    setIsConfirmOpen(true);
                                                }}
                                            >
                                                <CheckCircle size={14} className="mr-1" /> Approve
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all rounded-lg text-xs font-bold"
                                                onClick={() => {
                                                    setSelectedAction({ id: profile.userId, name: profile.user?.name, status: 'rejected' });
                                                    setIsConfirmOpen(true);
                                                }}
                                            >
                                                <XCircle size={14} className="mr-1" /> Reject
                                            </Button>
                                        </>
                                    )}
                                </div>
                            ),
                        },
                    ]}
                />
            )}

            <ConfirmDelete
                isOpen={isConfirmOpen}
                onOpenChange={setIsConfirmOpen}
                onConfirm={handleAction}
                title={`${selectedAction?.status === 'approved' ? 'Approve' : 'Reject'} KYC`}
                description={
                    <>
                        Are you sure you want to <strong>{selectedAction?.status}</strong> the KYC profile for <span className="text-primary">{selectedAction?.name}</span>?
                        {selectedAction?.status === 'approved' ? ' This will allow them to create parking lots.' : ' They will need to re-submit their documents.'}
                    </>
                }
            />

            <DetailsModal
                isOpen={isViewOpen}
                onClose={() => setIsViewOpen(false)}
                title="KYC Profile"
                data={selectedProfile ? (({ user, ...rest }) => ({ ...rest, owner: user }))(selectedProfile) : null}
            />
        </div>
    );
}
