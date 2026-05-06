import { Mail, Phone, Calendar, ChevronRight, Activity, Wallet, ShieldCheck, Building2, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";

export type EntityType = 'owner' | 'user';

interface ViewModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    type: EntityType;
    data: {
        id: string;
        name: string;
        email: string;
        phone: string;
        status: string;
        joined: string;
        avatar?: string;
        bookings?: number;
        company?: string;
    } | null;
}

export function ViewModal({ isOpen, onOpenChange, type, data }: ViewModalProps) {
    if (!data) return null;

    const isOwner = type === 'owner';

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent 
                style={{ backgroundColor: 'rgba(var(--bg-card-rgb), 0.8)' }}
                className="max-w-2xl rounded-[2.5rem] border-border-main backdrop-blur-3xl p-0 overflow-hidden shadow-2xl shadow-black/10 animate-in fade-in zoom-in duration-300"
            >
                {/* Header Background Accent */}
                <div className="absolute top-0 left-0 w-full h-32 bg-primary/5 -z-10" />

                <div className="p-8 space-y-8">
                    <DialogHeader>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-5">
                                <div className="w-24 h-24 bg-primary text-white border-4 border-bg-main shadow-xl rounded-[2rem] flex items-center justify-center text-3xl font-black">
                                    {data.avatar || data.name?.charAt(0)}
                                </div>
                                <div>
                                    <DialogTitle className="text-3xl font-black text-text-main tracking-tighter">
                                        {data.name}
                                    </DialogTitle>
                                    <div className="flex items-center gap-2 mt-1.5">
                                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border transition-colors ${
                                            data.status === 'Active' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 
                                            'bg-amber-500/10 text-amber-500 border-amber-500/20'
                                        }`}>
                                            {data.status}
                                        </span>
                                        <p className="text-[10px] font-bold text-text-muted uppercase tracking-[0.1em]">ID: {data.id}</p>
                                    </div>
                                </div>
                            </div>
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => onOpenChange(false)}
                                className="rounded-full text-text-muted hover:bg-bg-main transition-all"
                            >
                                <ChevronRight className="rotate-90" size={20} />
                            </Button>
                        </div>
                        <DialogDescription className="hidden">Profile detailed view</DialogDescription>
                    </DialogHeader>

                    <div className="grid grid-cols-2 gap-8 pt-4">
                        {/* Column 1: Contact */}
                        <div className="space-y-5">
                            <h6 className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] flex items-center gap-2">
                                <Smartphone size={10} className="text-primary" />
                                Secure Contact Channel
                            </h6>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 group">
                                    <div className="p-3 bg-bg-main rounded-2xl text-primary group-hover:scale-110 transition-transform border border-border-main/50">
                                        <Mail size={18} />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[9px] font-bold text-text-muted uppercase tracking-widest">Email Address</p>
                                        <p className="text-sm font-black text-text-main truncate">{data.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 group">
                                    <div className="p-3 bg-bg-main rounded-2xl text-emerald-500 group-hover:scale-110 transition-transform border border-border-main/50">
                                        <Phone size={18} />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[9px] font-bold text-text-muted uppercase tracking-widest">Direct Phone</p>
                                        <p className="text-sm font-black text-text-main truncate">{data.phone}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Column 2: Specific Metrics */}
                        <div className="space-y-5">
                            <h6 className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] flex items-center gap-2">
                                {isOwner ? <Building2 size={10} className="text-amber-500" /> : <Activity size={10} className="text-primary" />}
                                {isOwner ? 'Partnership Insights' : 'Usage Analytics'}
                            </h6>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 group">
                                    <div className="p-3 bg-bg-main rounded-2xl text-amber-500 group-hover:scale-110 transition-transform border border-border-main/50">
                                        <Calendar size={18} />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[9px] font-bold text-text-muted uppercase tracking-widest">Administrative Join Date</p>
                                        <p className="text-sm font-black text-text-main truncate">{data.joined}</p>
                                    </div>
                                </div>
                                {isOwner ? (
                                    <div className="flex items-center gap-3 group">
                                        <div className="p-3 bg-bg-main rounded-2xl text-primary group-hover:scale-110 transition-transform border border-border-main/50">
                                            <Wallet size={18} />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-[9px] font-bold text-text-muted uppercase tracking-widest">Revenue Commission</p>
                                            <p className="text-sm font-black text-text-main truncate">15.0% Fixed Rate</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-3 group">
                                        <div className="p-3 bg-bg-main rounded-2xl text-primary group-hover:scale-110 transition-transform border border-border-main/50">
                                            <Activity size={18} />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-[9px] font-bold text-text-muted uppercase tracking-widest">Platform Engagement</p>
                                            <p className="text-sm font-black text-text-main truncate">{data.bookings} Total Bookings</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Footer Interactive Area */}
                    <div className="pt-8 mt-4 border-t border-border-main flex items-center justify-between">
                        <div className="flex items-center gap-2.5 px-5 py-3 bg-primary/10 text-primary rounded-2xl border border-primary/20">
                            <ShieldCheck size={16} />
                            <span className="text-[10px] font-black uppercase tracking-[0.15em]">
                                {isOwner ? 'Verified Parking Partner' : 'Verified Platform User'}
                            </span>
                        </div>
                        <Button variant="link" className="text-primary font-black uppercase tracking-widest text-xs flex items-center gap-2 hover:gap-3 transition-all group">
                            {isOwner ? 'Full Audit Logs' : 'Security Settings'} 
                            <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
