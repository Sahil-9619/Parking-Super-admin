import { MapPin, Clock, Info, Globe, Type } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Dialog,
    DialogContent,
    DialogHeader,
} from "@/components/ui/dialog";
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';

interface ParkingEditModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    data: any | null;
    onSave: (data: any) => void;
}

export function ParkingEditModal({ isOpen, onOpenChange, data, onSave }: ParkingEditModalProps) {
    const [formData, setFormData] = useState<any>(null);

    useEffect(() => {
        if (data) {
            setFormData({
                name: data.name || '',
                address: data.address || '',
                parkingType: data.parkingType || 'Public',
                latitude: data.latitude || 0,
                longitude: data.longitude || 0,
                status: data.status || 'active',
                is24hr: data.is24hr ?? false,
                openTime: data.openTime || '00:00',
                closeTime: data.closeTime || '23:59',
                isClosed: data.isClosed ?? false,
            });
        }
    }, [data]);

    if (!data || !formData) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        const submitData = {
            ...formData,
            latitude: parseFloat(formData.latitude),
            longitude: parseFloat(formData.longitude),
        };
        onSave(submitData);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent 
                style={{ backgroundColor: 'rgba(var(--bg-card-rgb), 0.98)' }}
                className="max-w-4xl rounded-[2.5rem] border-border-main backdrop-blur-3xl p-0 overflow-hidden shadow-2xl shadow-black/20 animate-in fade-in zoom-in duration-300 [&>button]:hidden"
            >
                <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-b from-primary/10 to-transparent -z-10" />

                <form onSubmit={handleSubmit} className="p-10 space-y-10 max-h-[90vh] overflow-y-auto custom-scrollbar">
                    <DialogHeader className="flex flex-row items-center justify-between space-y-0 text-left">
                        <div className="flex items-center gap-6">
                            <div className="w-24 h-24 bg-primary/10 text-primary border-4 border-bg-card shadow-2xl rounded-[2rem] flex items-center justify-center text-4xl font-black">
                                {formData.name?.charAt(0)}
                            </div>

                            <div>
                                <Input 
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="text-4xl font-black text-text-main tracking-tighter leading-none mb-3 bg-transparent border-none p-0 h-auto focus-visible:ring-0"
                                    placeholder="Enter Parking Name"
                                />
                                <div className="flex items-center gap-3">
                                    <select 
                                        value={formData.status.toLowerCase()}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                        className={cn(
                                            "px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all cursor-pointer appearance-none bg-bg-main",
                                            formData.status.toLowerCase() === 'active' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                                        )}
                                    >
                                        <option value="active">Active</option>
                                        <option value="paused">Paused</option>
                                        <option value="banned">Banned</option>
                                        <option value="pending">Pending</option>
                                    </select>
                                    <p className="text-[11px] font-bold text-text-muted uppercase tracking-[0.2em] bg-bg-main px-3 py-1.5 rounded-lg border border-border-main/50">
                                        Parking ID: {data.id}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Button 
                                type="button"
                                variant="ghost" 
                                onClick={() => onOpenChange(false)}
                                className="rounded-xl text-[9px] font-black uppercase tracking-widest h-11 px-6 hover:bg-red-500/10 hover:text-red-500 transition-all"
                            >
                                Discard
                            </Button>
                            <Button 
                                type="submit"
                                className="rounded-xl bg-primary text-white text-[9px] font-black uppercase tracking-widest h-11 px-8 shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                            >
                                Save Changes
                            </Button>
                        </div>
                    </DialogHeader>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-10">
                        {/* Column 1: Location & Info */}
                        <div className="space-y-6">
                            <SectionHeader icon={MapPin} title="Location & Basic Details" />
                            <div className="space-y-4">
                                <EditField icon={MapPin} label="Physical Address" value={formData.address} onChange={(v: string) => setFormData({ ...formData, address: v })} />
                                
                                <div className="space-y-1.5 group">
                                    <label className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em] ml-1 group-focus-within:text-primary transition-colors">Parking Type</label>
                                    <div className="relative">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors">
                                            <Type size={14} />
                                        </div>
                                        <select 
                                            value={formData.parkingType}
                                            onChange={(e) => setFormData({ ...formData, parkingType: e.target.value })}
                                            className="pl-11 w-full h-11 bg-bg-main/50 border border-border-main rounded-xl px-4 text-xs font-bold text-text-main focus:outline-none focus:border-primary/30 transition-all appearance-none"
                                        >
                                            <option value="home">Home / Individual</option>
                                            <option value="society">Residential Society</option>
                                            <option value="commercial">Commercial / Mall</option>
                                            <option value="govt">Government Owned</option>
                                            <option value="municipality">Municipal Parking</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <EditField icon={Globe} label="Latitude" type="number" step="any" value={formData.latitude} onChange={(v: string) => setFormData({ ...formData, latitude: v })} />
                                    <EditField icon={Globe} label="Longitude" type="number" step="any" value={formData.longitude} onChange={(v: string) => setFormData({ ...formData, longitude: v })} />
                                </div>
                            </div>
                        </div>

                        {/* Column 2: Operation Hours */}
                        <div className="space-y-6">
                            <SectionHeader icon={Clock} title="Operational Hours" />
                            <div className="space-y-4">
                                
                                <div className="space-y-1.5 group">
                                    <label className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em] ml-1 group-focus-within:text-primary transition-colors">24/7 Operations</label>
                                    <div className="relative">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors">
                                            <Clock size={14} />
                                        </div>
                                        <select 
                                            value={formData.is24hr ? 'yes' : 'no'}
                                            onChange={(e) => setFormData({ ...formData, is24hr: e.target.value === 'yes' })}
                                            className="pl-11 w-full h-11 bg-bg-main/50 border border-border-main rounded-xl px-4 text-xs font-bold text-text-main focus:outline-none focus:border-primary/30 transition-all appearance-none"
                                        >
                                            <option value="yes">Yes</option>
                                            <option value="no">No</option>
                                        </select>
                                    </div>
                                </div>

                                {!formData.is24hr && (
                                    <div className="grid grid-cols-2 gap-4">
                                        <EditField icon={Clock} label="Opening Time" type="time" value={formData.openTime} onChange={(v: string) => setFormData({ ...formData, openTime: v })} />
                                        <EditField icon={Clock} label="Closing Time" type="time" value={formData.closeTime} onChange={(v: string) => setFormData({ ...formData, closeTime: v })} />
                                    </div>
                                )}

                                <div className="space-y-1.5 group mt-4">
                                    <label className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em] ml-1 group-focus-within:text-red-500 transition-colors text-red-500/70">Emergency Control</label>
                                    <div className="relative">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-red-500/70 group-focus-within:text-red-500 transition-colors">
                                            <Info size={14} />
                                        </div>
                                        <select 
                                            value={formData.isClosed ? 'yes' : 'no'}
                                            onChange={(e) => setFormData({ ...formData, isClosed: e.target.value === 'yes' })}
                                            className="pl-11 w-full h-11 bg-red-500/5 border border-red-500/20 rounded-xl px-4 text-xs font-bold text-red-500 focus:outline-none focus:border-red-500/40 transition-all appearance-none"
                                        >
                                            <option value="no">Open for Business</option>
                                            <option value="yes">Temporarily Closed</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function SectionHeader({ icon: Icon, title }: any) {
    return (
        <h6 className="text-[11px] font-black text-text-muted uppercase tracking-[0.25em] flex items-center gap-2 px-1 text-left">
            <Icon size={12} className="text-primary" />
            {title}
        </h6>
    );
}

function EditField({ icon: Icon, label, value, onChange, type = "text", step }: any) {
    return (
        <div className="space-y-1.5 group">
            <label className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em] ml-1 group-focus-within:text-primary transition-colors">{label}</label>
            <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors">
                    <Icon size={14} />
                </div>
                <Input 
                    type={type}
                    value={value}
                    step={step}
                    onChange={(e) => onChange(e.target.value)}
                    className="pl-11 h-11 rounded-xl border-border-main bg-bg-main/50 text-text-main focus-visible:ring-primary/20 focus-visible:border-primary/30 transition-all text-xs font-bold"
                />
            </div>
        </div>
    );
}
