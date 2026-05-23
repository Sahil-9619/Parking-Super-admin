import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, XCircle, CheckCircle, FileText, CreditCard, UserCheck, Eye, MapPin, Building2 } from 'lucide-react';
import { ServerPagination } from '@/components/shared/ServerPagination';
import { showStatusToast } from '@/lib/utils';

import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/shared/DataTable';
import { FilterBar } from '@/components/shared/FilterBar';
import { ConfirmDelete } from '@/components/shared/ConfirmDelete';
import { ownerService } from '@/services/ownerService';
import { DetailsModal } from '@/components/shared/DetailsModal';
import { parkingService, type ParkingArea } from '@/services/parkingService';

export default function KycApprovals() {
    const [activeTab, setActiveTab] = useState<'owner' | 'parking'>('owner');

    const [kycList, setKycList] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [selectedAction, setSelectedAction] = useState<{ id: string; name: string; status: 'approved' | 'rejected' } | null>(null);

    const [isViewOpen, setIsViewOpen] = useState(false);
    const [selectedProfile, setSelectedProfile] = useState<any>(null);

    const [ownerPage, setOwnerPage] = useState(1);
    const [ownerMeta, setOwnerMeta] = useState<any>(null);

    const [parkingKycList, setParkingKycList] = useState<ParkingArea[]>([]);
    const [parkingLoading, setParkingLoading] = useState(true);
    const [parkingPage, setParkingPage] = useState(1);
    const [parkingMeta, setParkingMeta] = useState<any>(null);

    const fetchKycList = async () => {
        try {
            setLoading(true);
            const response = await ownerService.getOwnerKycList({ status: statusFilter || undefined, page: ownerPage, limit: 10 });
            setKycList(response.data || []);
            setOwnerMeta(response.meta || null);
        } catch (error: any) {
            showStatusToast('rejected', error.message || 'Failed to load KYC profiles');
        } finally {
            setLoading(false);
        }
    };

    const fetchParkingKycList = async () => {
        try {
            setParkingLoading(true);
            const response = await parkingService.getAllParkings({ kycStatus: statusFilter || undefined, page: parkingPage, limit: 10 });
            setParkingKycList(response.data || []);
            setParkingMeta(response.meta || null);
        } catch (error: any) {
            showStatusToast('rejected', error.message || 'Failed to load Parking KYC list');
        } finally {
            setParkingLoading(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'owner') fetchKycList();
        else fetchParkingKycList();
    }, [statusFilter, activeTab, ownerPage, parkingPage]);

    useEffect(() => {
        setOwnerPage(1);
        setParkingPage(1);
    }, [statusFilter, activeTab]);

    const filteredKyc = kycList.filter((profile) => {
        const search = searchQuery.toLowerCase();
        return (
            profile.user?.name?.toLowerCase().includes(search) ||
            profile.user?.email?.toLowerCase().includes(search) ||
            profile.gstNumber?.toLowerCase().includes(search)
        );
    });

    const filteredParkingKyc = parkingKycList.filter((parking) => {
        const search = searchQuery.toLowerCase();
        return parking.name.toLowerCase().includes(search) ||
               (parking.user?.name || '').toLowerCase().includes(search) ||
               parking.address.toLowerCase().includes(search);
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

    const handleDirectApprove = async (id: string) => {
        try {
            await ownerService.approveKyc(id, 'approved');
            showStatusToast('approved', `KYC approved successfully`);
            fetchKycList();
        } catch (error: any) {
            showStatusToast('rejected', error.message || `Failed to approve KYC`);
        }
    };

    const handleOpenView = (profile: any) => {
        setSelectedProfile(profile);
        setIsViewOpen(true);
    };

    const handleParkingApprove = async (id: string, status: 'approved' | 'rejected') => {
        try {
            await parkingService.updateParkingKycStatus(id, status);
            showStatusToast(status, `Parking KYC ${status} successfully`);
            fetchParkingKycList();
        } catch (error: any) {
            showStatusToast('rejected', error.message || `Failed to ${status} Parking KYC`);
        }
    };

    return (
        <div className="space-y-6 pb-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-black text-text-main tracking-tighter">KYC Approvals</h2>
                    <p className="text-[11px] text-text-muted font-bold uppercase tracking-[0.2em] mt-1">
                        Review and approve business documents and parking locations
                    </p>
                </div>
            </div>

            {/* Custom Tab Switcher */}
            <div className="relative flex bg-bg-main p-1.5 rounded-2xl w-fit border border-border-main shadow-sm">
                <button
                    onClick={() => setActiveTab('owner')}
                    className={`relative z-10 px-6 py-2.5 text-xs font-black uppercase tracking-widest rounded-xl transition-colors duration-300 ${activeTab === 'owner' ? 'text-white' : 'text-text-muted hover:text-text-main hover:bg-border-main/50'}`}
                >
                    Owner KYC
                    {activeTab === 'owner' && (
                        <motion.div
                            layoutId="kycTabIndicator"
                            className="absolute inset-0 bg-primary rounded-xl shadow-md -z-10"
                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                        />
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('parking')}
                    className={`relative z-10 px-6 py-2.5 text-xs font-black uppercase tracking-widest rounded-xl transition-colors duration-300 ${activeTab === 'parking' ? 'text-white' : 'text-text-muted hover:text-text-main hover:bg-border-main/50'}`}
                >
                    Parking Area KYC
                    {activeTab === 'parking' && (
                        <motion.div
                            layoutId="kycTabIndicator"
                            className="absolute inset-0 bg-primary rounded-xl shadow-md -z-10"
                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                        />
                    )}
                </button>
            </div>

            <FilterBar
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                searchPlaceholder={activeTab === 'owner' ? "Search by name, email, or GST..." : "Search by parking name, owner, or address..."}
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

            {activeTab === 'owner' && (
                loading ? (
                    <div className="flex items-center justify-center min-h-[400px]">
                        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
                    </div>
                ) : (
                    <DataTable
                        data={filteredKyc}
                        emptyStateIcon={ShieldCheck}
                        emptyStateTitle="No Owner KYC profiles found"
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
                                            <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest w-16">Aadhar Pic:</span>
                                            {profile.aadharPic ? (
                                                <a href={profile.aadharPic} target="_blank" rel="noreferrer" className="text-xs font-black text-primary hover:underline">View Image</a>
                                            ) : (
                                                <span className="text-xs font-black text-text-main">N/A</span>
                                            )}
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
                                        {profile.verificationStatus === 'pending' && profile.aadharNumber && profile.aadharPic && profile.bankAccount && (
                                            <>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all rounded-lg text-xs font-bold"
                                                    onClick={() => {
                                                        handleDirectApprove(profile.userId);
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
                )
            )}
            {activeTab === 'owner' && !loading && ownerMeta && (
                <ServerPagination
                    currentPage={ownerPage}
                    totalPages={ownerMeta.totalPages}
                    totalItems={ownerMeta.total}
                    itemsPerPage={10}
                    onPageChange={setOwnerPage}
                />
            )}

            {activeTab === 'parking' && (
                parkingLoading ? (
                    <div className="flex items-center justify-center min-h-[400px]">
                        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
                    </div>
                ) : (
                    <DataTable
                        data={filteredParkingKyc}
                        emptyStateIcon={Building2}
                        emptyStateTitle="No Parking Area KYC found"
                        emptyStateDescription="There are no parking areas pending KYC verification."
                        columns={[
                            {
                                header: 'Parking Details',
                                accessor: (parking) => (
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-primary/10 text-primary border border-primary/20 rounded-xl flex items-center justify-center">
                                            <Building2 size={18} />
                                        </div>
                                        <div>
                                            <h5 className="text-sm font-black text-text-main">{parking.name}</h5>
                                            <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">{parking.user?.name || 'Unknown Owner'}</p>
                                        </div>
                                    </div>
                                ),
                            },
                            {
                                header: 'Location & Type',
                                accessor: (parking) => (
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <MapPin size={14} className="text-text-muted" />
                                            <span className="text-xs font-bold text-text-main line-clamp-1">{parking.address}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Type:</span>
                                            <span className="text-xs font-bold text-primary">{parking.ownershipType === 'owned' ? 'Owned' : 'Rental'}</span>
                                        </div>
                                    </div>
                                ),
                            },
                            {
                                header: 'Property Docs',
                                accessor: (parking) => (
                                    <div className="space-y-1 bg-bg-main p-2 rounded-lg border border-border-main/50">
                                        {parking.ownershipType === 'owned' && parking.propertyPaper && (
                                            <div className="flex items-center gap-2">
                                                <FileText size={12} className="text-text-muted" />
                                                <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest w-16">Property:</span>
                                                <a href={parking.propertyPaper} target="_blank" rel="noreferrer" className="text-xs font-black text-primary hover:underline">View Paper</a>
                                            </div>
                                        )}
                                        {parking.ownershipType === 'rental' && parking.leaseAgreement && (
                                            <div className="flex items-center gap-2">
                                                <FileText size={12} className="text-text-muted" />
                                                <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest w-16">Lease:</span>
                                                <a href={parking.leaseAgreement} target="_blank" rel="noreferrer" className="text-xs font-black text-primary hover:underline">View Lease</a>
                                            </div>
                                        )}
                                        {parking.parkingAreaPics && parking.parkingAreaPics.length > 0 && (
                                            <div className="flex items-center gap-2">
                                                <FileText size={12} className="text-text-muted" />
                                                <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest w-16">Pics:</span>
                                                <a href={parking.parkingAreaPics[0]} target="_blank" rel="noreferrer" className="text-xs font-black text-primary hover:underline">{parking.parkingAreaPics.length} Photos</a>
                                            </div>
                                        )}
                                    </div>
                                ),
                            },
                            {
                                header: 'Status',
                                accessor: (parking) => (
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${parking.kycStatus === 'approved'
                                        ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                                        : parking.kycStatus === 'rejected'
                                            ? 'bg-red-500/10 text-red-500 border-red-500/20'
                                            : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                                        }`}>
                                        {parking.kycStatus}
                                    </span>
                                ),
                            },
                            {
                                header: 'Actions',
                                textRight: true,
                                accessor: (parking) => (
                                    <div className="flex items-center justify-end gap-2">
                                        {parking.kycStatus === 'pending' && (
                                            <>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all rounded-lg text-xs font-bold"
                                                    onClick={() => handleParkingApprove(parking.id, 'approved')}
                                                >
                                                    <CheckCircle size={14} className="mr-1" /> Approve
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all rounded-lg text-xs font-bold"
                                                    onClick={() => handleParkingApprove(parking.id, 'rejected')}
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
                )
            )}
            {activeTab === 'parking' && !parkingLoading && parkingMeta && (
                <ServerPagination
                    currentPage={parkingPage}
                    totalPages={parkingMeta.totalPages}
                    totalItems={parkingMeta.total}
                    itemsPerPage={10}
                    onPageChange={setParkingPage}
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
                confirmText="Confirm Reject"
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
