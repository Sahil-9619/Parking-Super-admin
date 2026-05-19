import { Mail, Phone, Calendar, ChevronRight, Activity, Wallet, ShieldCheck, Building2, Smartphone, Star, MapPin, Ban, User, CreditCard } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { cn } from '@/lib/utils';

export type EntityType = 'owner' | 'user';

interface ViewModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    type: EntityType;
    onViewParking?: (parking: any) => void;
    data: {

        id: string;
        name: string;
        email: string;
        phone: string;
        status: string;
        joined: string;
        updated?: string;
        avatar?: string;
        parkings?: number;
        company?: string;
        gstNumber?: string;
        verificationStatus?: string;
        strikeCount?: number;
        walletBalance?: string;
        parkingList?: any[];
        role?: string;
        bankDetails?: {

            account?: string;
            ifsc?: string;
            holder?: string;
        };
    } | null;
}

export function ViewModal({ isOpen, onOpenChange, type, data, onViewParking }: ViewModalProps) {

    if (!data) return null;

    const isOwner = type === 'owner';

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent
                style={{ backgroundColor: 'rgba(var(--bg-card-rgb), 0.98)' }}
                className="max-w-4xl rounded-[2.5rem] border-border-main backdrop-blur-3xl p-0 overflow-hidden shadow-2xl shadow-black/20 animate-in fade-in zoom-in duration-300 [&>button]:hidden"
            >
                <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-b from-primary/10 to-transparent -z-10" />

                <div className="p-10 space-y-10 max-h-[90vh] overflow-y-auto custom-scrollbar">
                    <DialogHeader className="flex flex-row items-center justify-between space-y-0 text-left">
                        <div className="flex items-center gap-6">
                            <div className="w-24 h-24 bg-primary/10 text-primary border-4 border-bg-card shadow-2xl rounded-[2rem] flex items-center justify-center text-4xl font-black">
                                {data.avatar || data.name?.charAt(0)}
                            </div>

                            <div>
                                <DialogTitle className="text-4xl font-black text-text-main tracking-tighter leading-none mb-2">
                                    {data.name}
                                </DialogTitle>
                                <div className="flex items-center gap-3">
                                    <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${data.status.toLowerCase() === 'active' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 shadow-sm shadow-emerald-500/5' :
                                            'bg-amber-500/10 text-amber-500 border-amber-500/20 shadow-sm shadow-amber-500/5'
                                        }`}>
                                        {data.status}
                                    </span>
                                    <p className="text-[11px] font-bold text-text-muted uppercase tracking-[0.2em] bg-bg-main px-3 py-1.5 rounded-lg border border-border-main/50">
                                        Partner ID: {data.id}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onOpenChange(false)}
                            className="rounded-xl border-border-main text-[9px] font-black uppercase tracking-widest h-9 px-6 hover:bg-bg-main transition-all shadow-sm"
                        >
                            Close Profile
                        </Button>

                        <DialogDescription className="hidden">Detailed view of {type} profile</DialogDescription>
                    </DialogHeader>

                    <div className={cn("grid gap-6 pt-4", isOwner ? "grid-cols-1 md:grid-cols-4" : "grid-cols-1 md:grid-cols-2")}>

                        {/* Column 1: Contact & Personal */}
                        <div className="space-y-6">
                            <h6 className="text-[11px] font-black text-text-muted uppercase tracking-[0.25em] flex items-center gap-2 px-1 text-left">
                                <Smartphone size={12} className="text-primary" />
                                Communication
                            </h6>
                            <div className="space-y-3">
                                <InfoCard icon={Mail} label="Professional Email" value={data.email} color="text-primary" />
                                <InfoCard icon={Phone} label="Direct Contact" value={data.phone} color="text-primary" />
                                <InfoCard icon={User} label="Assigned Role" value={data.role} color="text-primary" />
                                <InfoCard icon={Calendar} label="Member Since" value={data.joined} color="text-primary" />
                            </div>
                        </div>


                        {/* Column 2: Business & KYC (Owners Only) */}
                        {isOwner && (
                            <div className="space-y-6">
                                <h6 className="text-[11px] font-black text-text-muted uppercase tracking-[0.25em] flex items-center gap-2 px-1 text-left">
                                    <Building2 size={12} className="text-primary" />
                                    Business Profile
                                </h6>
                                <div className="space-y-3">
                                    <InfoCard icon={ShieldCheck} label="Account Category" value={data.company} color="text-primary" />
                                    <InfoCard icon={Activity} label="GST Identification" value={data.gstNumber} color="text-primary" />
                                    <InfoCard icon={Activity} label="KYC Compliance" value={data.verificationStatus} color="text-primary" />
                                </div>
                            </div>
                        )}


                        {/* Column 3: Financial Accounts (Owners Only) */}
                        {isOwner && (
                            <div className="space-y-6">
                                <h6 className="text-[11px] font-black text-text-muted uppercase tracking-[0.25em] flex items-center gap-2 px-1 text-left">
                                    <CreditCard size={12} className="text-primary" />
                                    Financial Accounts
                                </h6>
                                <div className="space-y-3">
                                    <InfoCard icon={User} label="Account Holder" value={data.bankDetails?.holder || 'N/A'} color="text-primary" />
                                    <InfoCard icon={CreditCard} label="Account Number" value={data.bankDetails?.account || 'N/A'} color="text-primary" />
                                    <InfoCard icon={Activity} label="IFSC Code" value={data.bankDetails?.ifsc || 'N/A'} color="text-primary" />
                                </div>
                            </div>
                        )}


                        {/* Column 4: Wallet & Safety */}
                        <div className="space-y-6">
                            <h6 className="text-[11px] font-black text-text-muted uppercase tracking-[0.25em] flex items-center gap-2 px-1 text-left">
                                <Wallet size={12} className="text-primary" />
                                Wallet & Safety
                            </h6>
                            <div className="space-y-3">
                                <InfoCard icon={Wallet} label="Total Balance" value={data.walletBalance} color="text-primary" />
                                {isOwner && <InfoCard icon={Ban} label="Active Strikes" value={`${data.strikeCount} Warnings`} color={data.strikeCount && data.strikeCount > 0 ? "text-red-500" : "text-primary"} />}
                                <InfoCard icon={Calendar} label="Last Modified" value={data.updated || 'N/A'} color="text-text-muted" />
                            </div>
                        </div>

                    </div>



                    {/* Section: Parking Lots List */}
                    {isOwner && data.parkingList && data.parkingList.length > 0 && (
                        <div className="space-y-6 pt-4">
                            <h6 className="text-[11px] font-black text-text-muted uppercase tracking-[0.25em] flex items-center gap-2 px-1 text-left">
                                <MapPin size={12} className="text-primary" />
                                Infrastructure Assets ({data.parkingList.length})
                            </h6>
                            <div className="space-y-1 bg-bg-main/20 rounded-[2rem] border border-border-main/40 overflow-hidden backdrop-blur-sm">
                                {data.parkingList.map((parking, idx) => (
                                    <div
                                        key={idx}
                                        onClick={() => onViewParking?.(parking)}
                                        className="p-4 flex items-center justify-between group hover:bg-primary/[0.04] transition-all duration-300 cursor-pointer border-b border-border-main/20 last:border-0"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-primary/5 rounded-xl flex items-center justify-center text-primary font-black group-hover:scale-110 transition-transform border border-primary/10">
                                                {parking.name?.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-text-main leading-tight mb-1">{parking.name}</p>
                                                <div className="flex items-center gap-2 text-[9px] font-black text-text-muted uppercase tracking-[0.15em]">
                                                    <span className={`px-2 py-0.5 rounded-md ${parking.status?.toLowerCase() === 'active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-500/10 text-slate-500'}`}>
                                                        {parking.status}
                                                    </span>
                                                    <span className="w-1 h-1 rounded-full bg-border-main" />
                                                    <span className="text-text-main/80">{parking.parkingType}</span>
                                                    <span className="w-1 h-1 rounded-full bg-border-main" />
                                                    <div className="flex items-center gap-1">
                                                        <Star size={10} className="text-amber-500 fill-amber-500" />
                                                        <span>{parking.avgRating || '0.0'}</span>
                                                    </div>

                                                </div>
                                            </div>
                                        </div>
                                        <ChevronRight size={16} className="text-text-muted group-hover:text-primary group-hover:translate-x-1 transition-all" />
                                    </div>
                                ))}
                            </div>

                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}

function InfoCard({ icon: Icon, label, value, color }: any) {
    return (
        <div className="flex items-center gap-4 py-3 group transition-all border-b border-border-main/20 last:border-0">
            <div className={cn("p-2.5 bg-primary/5 rounded-xl transition-transform border border-primary/10", color || "text-primary")}>
                <Icon size={16} strokeWidth={2.5} />
            </div>
            <div className="min-w-0 flex-1">
                <p className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em] mb-0.5 leading-none">{label}</p>
                <p className="text-sm font-black text-text-main truncate leading-tight">{value || 'N/A'}</p>
            </div>
        </div>
    );
}


