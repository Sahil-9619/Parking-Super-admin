// @ts-nocheck
import { MapPin, Clock, Star, ShieldCheck, Activity, Smartphone, Info, Image as ImageIcon, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { cn } from '@/lib/utils';

interface ParkingViewModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    data: any | null;
}

export function ParkingViewModal({ isOpen, onOpenChange, data }: ParkingViewModalProps) {
    if (!data) return null;

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
                            <div className="w-24 h-24 bg-bg-card shadow-2xl rounded-[2rem] flex items-center justify-center text-4xl font-black border-4 border-primary/20 text-primary">
                                {data.name?.charAt(0)}
                            </div>

                            <div>
                                <DialogTitle className="text-4xl font-black text-text-main tracking-tighter leading-none mb-2">
                                    {data.name}
                                </DialogTitle>
                                <div className="flex items-center gap-3">
                                    <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                                        data.status?.toLowerCase() === 'active' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 shadow-sm shadow-emerald-500/5' : 
                                        'bg-amber-500/10 text-amber-500 border-amber-500/20 shadow-sm shadow-amber-500/5'
                                    }`}>
                                        {data.status}
                                    </span>
                                    <p className="text-[11px] font-bold text-text-muted uppercase tracking-[0.2em] bg-bg-main px-3 py-1.5 rounded-lg border border-border-main/50">
                                        Type: {data.parkingType}
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
                            Close Details
                        </Button>

                    </DialogHeader>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        {/* Left Column: Essential Info */}
                        <div className="space-y-8">
                            <section className="space-y-4">
                                <h6 className="text-[11px] font-black text-text-muted uppercase tracking-[0.25em] flex items-center gap-2 px-1 text-left">
                                    <MapPin size={12} className="text-primary" />
                                    Geographical Location
                                </h6>
                                <div className="p-6 bg-bg-main/20 rounded-[2rem] border border-border-main/40 shadow-sm space-y-5 text-left backdrop-blur-sm">
                                    <div className="space-y-1.5">
                                        <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Physical Address</p>
                                        <p className="text-sm font-black text-text-main leading-relaxed">{data.address}</p>
                                    </div>
                                    <div className="flex items-center gap-10 border-t border-border-main/20 pt-5">
                                        <div>
                                            <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Latitude</p>
                                            <p className="text-xs font-black text-text-main mt-1">{data.latitude}</p>
                                        </div>
                                        <div className="w-px h-8 bg-border-main/20" />
                                        <div>
                                            <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Longitude</p>
                                            <p className="text-xs font-black text-text-main mt-1">{data.longitude}</p>
                                        </div>
                                    </div>
                                </div>

                            </section>

                            <section className="space-y-4">
                                <h6 className="text-[11px] font-black text-text-muted uppercase tracking-[0.25em] flex items-center gap-2 px-1 text-left">
                                    <Clock size={12} className="text-primary" />
                                    Operational Hours
                                </h6>
                                <div className="grid grid-cols-1 gap-1 bg-bg-main/20 rounded-[1.5rem] border border-border-main/40 overflow-hidden backdrop-blur-sm">
                                    <div className="p-4 flex items-center gap-4 text-left border-b border-border-main/20 last:border-0 hover:bg-primary/[0.04] transition-colors">
                                        <div className="p-2.5 bg-primary/10 text-primary rounded-xl border border-primary/10">
                                            <Clock size={14} />
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em]">Operational Status</p>
                                            <p className="text-sm font-black text-text-main flex items-center gap-2">
                                                {data.is24hr ? 'Open 24/7' : 'Standard Schedule'}
                                                {data.isClosed && <span className="px-2 py-0.5 bg-red-500/10 text-red-500 rounded text-[8px] font-black uppercase">Temporarily Closed</span>}
                                            </p>
                                        </div>
                                    </div>
                                    {!data.is24hr && (
                                        <div className="p-4 flex items-center gap-4 text-left border-b border-border-main/20 last:border-0 hover:bg-primary/[0.04] transition-colors">
                                            <div className="p-2.5 bg-primary/10 text-primary rounded-xl border border-primary/10">
                                                <Calendar size={14} />
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em]">Business Schedule</p>
                                                <p className="text-sm font-black text-text-main">{data.openTime} - {data.closeTime}</p>
                                            </div>
                                        </div>
                                    )}
                                    {data.isClosed && data.reopenAt && (
                                        <div className="p-4 flex items-center gap-4 text-left border-b border-border-main/20 last:border-0 hover:bg-red-500/[0.04] transition-colors">
                                            <div className="p-2.5 bg-red-500/10 text-red-500 rounded-xl border border-red-500/10">
                                                <Clock size={14} />
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-black text-red-500 uppercase tracking-[0.2em]">Expected Reopening</p>
                                                <p className="text-sm font-black text-text-main">{new Date(data.reopenAt).toLocaleString()}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>


                            </section>
                        </div>

                        {/* Right Column: Photos & Analytics */}
                        <div className="space-y-8">
                            <section className="space-y-4">
                                <h6 className="text-[11px] font-black text-text-muted uppercase tracking-[0.25em] flex items-center gap-2 px-1 text-left">
                                    <ImageIcon size={12} className="text-primary" />
                                    Visual Assets ({data.photos?.length || 0})
                                </h6>
                                {data.photos && data.photos.length > 0 ? (
                                    <div className="grid grid-cols-2 gap-3">
                                        {data.photos.map((photo: string, i: number) => (
                                            <div key={i} className="aspect-video rounded-2xl bg-bg-main border border-border-main/60 overflow-hidden group relative">
                                                <img src={photo} alt={`Parking ${i}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-12 bg-bg-main border border-dashed border-border-main/60 rounded-[2rem] flex flex-col items-center justify-center text-center">
                                        <ImageIcon size={32} className="text-text-muted/40 mb-3" />
                                        <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">No Gallery Assets Found</p>
                                    </div>
                                )}
                            </section>

                            <section className="space-y-4">
                                <h6 className="text-[11px] font-black text-text-muted uppercase tracking-[0.25em] flex items-center gap-2 px-1 text-left">
                                    <ShieldCheck size={12} className="text-primary" />
                                    Performance Metrics
                                </h6>
                                <div className="grid grid-cols-1 gap-1 bg-bg-main/20 rounded-[1.5rem] border border-border-main/40 overflow-hidden backdrop-blur-sm">
                                    <div className="p-4 flex items-center gap-4 text-left border-b border-border-main/20 last:border-0 hover:bg-primary/[0.04] transition-colors">
                                        <div className="p-2.5 bg-amber-500/10 text-amber-500 rounded-xl border border-amber-500/10">
                                            <Star size={14} className="fill-amber-500" />
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em]">Public Rating</p>
                                            <p className="text-sm font-black text-text-main">{data.avgRating || '0.0'}</p>
                                        </div>
                                    </div>
                                    <div className="p-4 flex items-center gap-4 text-left border-b border-border-main/20 last:border-0 hover:bg-primary/[0.04] transition-colors">
                                        <div className="p-2.5 bg-primary/10 text-primary rounded-xl border border-primary/10">
                                            <Activity size={14} />
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em]">Live Occupancy</p>
                                            <p className="text-sm font-black text-text-main">{data.isFull ? 'At Capacity' : 'Available'}</p>
                                        </div>
                                    </div>
                                </div>

                            </section>
                        </div>
                    </div>


                    {/* Section: Feature Tags & System Metadata */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-4">
                        {data.addonsEnabled && data.addonsEnabled.length > 0 && (
                            <div className="space-y-4">
                                <h6 className="text-[11px] font-black text-text-muted uppercase tracking-[0.25em] flex items-center gap-2 px-1 text-left">
                                    <Info size={12} className="text-primary" />
                                    Enabled Ecosystem Add-ons
                                </h6>
                                <div className="flex flex-wrap gap-2 text-left">
                                    {data.addonsEnabled.map((addon: string, i: number) => (
                                        <span key={i} className="px-4 py-2 bg-primary/5 text-primary border border-primary/10 rounded-xl text-[10px] font-black uppercase tracking-widest">
                                            {addon}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="space-y-4">
                            <h6 className="text-[11px] font-black text-text-muted uppercase tracking-[0.25em] flex items-center gap-2 px-1 text-left">
                                <ShieldCheck size={12} className="text-primary" />
                                Technical Metadata
                            </h6>
                            <div className="p-5 bg-bg-main/20 rounded-[1.5rem] border border-border-main/40 space-y-3 text-left backdrop-blur-sm">
                                <div className="flex items-center justify-between">
                                    <p className="text-[9px] font-black text-text-muted uppercase tracking-widest">Resource ID</p>
                                    <p className="text-[10px] font-bold text-text-main font-mono">{data.id}</p>
                                </div>
                                <div className="flex items-center justify-between">
                                    <p className="text-[9px] font-black text-text-muted uppercase tracking-widest">Owner Ref</p>
                                    <p className="text-[10px] font-bold text-text-main font-mono">{data.ownerId}</p>
                                </div>
                                <div className="w-full h-px bg-border-main/20 my-1" />
                                <div className="flex items-center justify-between">
                                    <p className="text-[9px] font-black text-text-muted uppercase tracking-widest">Created At</p>
                                    <p className="text-[10px] font-bold text-text-main">{new Date(data.createdAt).toLocaleDateString()}</p>
                                </div>
                                <div className="flex items-center justify-between">
                                    <p className="text-[9px] font-black text-text-muted uppercase tracking-widest">Last Synced</p>
                                    <p className="text-[10px] font-bold text-text-main">{new Date(data.updatedAt).toLocaleString()}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </DialogContent>
        </Dialog>
    );
}
