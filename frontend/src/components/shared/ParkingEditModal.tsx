import { MapPin, Clock, Info, Globe, Type, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Dialog,
    DialogContent,
    DialogHeader,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "./dropdown-menu";
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
                parkingType: data.parkingType || 'commercial',
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
                className="max-w-4xl rounded-xl sm:rounded-2xl border-border-main backdrop-blur-3xl p-0 shadow-2xl shadow-black/20 animate-in fade-in zoom-in duration-300 [&>button]:hidden"
            >
                <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-b from-primary/10 to-transparent -z-10" />

                <form onSubmit={handleSubmit} className="p-5 sm:p-10 space-y-7 sm:space-y-10 max-h-[calc(100dvh-1rem)] overflow-y-auto custom-scrollbar">
                    <DialogHeader className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 space-y-0 text-left">
                        <div className="flex items-center gap-4 sm:gap-6 min-w-0">
                            <div className="w-16 h-16 sm:w-24 sm:h-24 shrink-0 bg-primary/10 text-primary border-4 border-bg-card shadow-2xl rounded-2xl sm:rounded-[2rem] flex items-center justify-center text-2xl sm:text-4xl font-black">
                                {formData.name?.charAt(0)}
                            </div>

                            <div className="min-w-0 flex-1">
                                <Input 
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="text-2xl sm:text-4xl font-black text-text-main tracking-tighter leading-tight sm:leading-none mb-3 bg-transparent border-none p-0 h-auto focus-visible:ring-0"
                                    placeholder="Enter Parking Name"
                                />
                                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                variant="outline"
                                                className={cn(
                                                    "h-7 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all justify-between gap-2",
                                                    formData.status.toLowerCase() === 'active' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20 hover:text-emerald-500' : 'bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-amber-500/20 hover:text-amber-500'
                                                )}
                                            >
                                                {formData.status}
                                                <ChevronDown size={12} className="opacity-50" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="start" className="bg-bg-card border border-border-main rounded-xl shadow-xl p-1">
                                            {['active', 'paused', 'banned'].map((s) => (
                                                <DropdownMenuItem
                                                    key={s}
                                                    onClick={() => setFormData({ ...formData, status: s })}
                                                    className={`px-3 py-2 rounded-lg text-xs font-black uppercase tracking-widest cursor-pointer transition-colors ${formData.status.toLowerCase() === s ? 'bg-primary/10 text-primary' : 'text-text-main hover:bg-bg-main'}`}
                                                >
                                                    {s}
                                                </DropdownMenuItem>
                                            ))}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                    <p className="max-w-full truncate text-[10px] sm:text-[11px] font-bold text-text-muted uppercase tracking-[0.14em] sm:tracking-[0.2em] bg-bg-main px-3 py-1.5 rounded-lg border border-border-main/50">
                                        Parking ID: {data.id}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3 w-full lg:w-auto">
                            <Button 
                                type="button"
                                variant="ghost" 
                                onClick={() => onOpenChange(false)}
                                className="rounded-xl text-[9px] font-black uppercase tracking-widest h-11 px-4 sm:px-6 hover:bg-red-500/10 hover:text-red-500 transition-all"
                            >
                                Discard
                            </Button>
                            <Button 
                                type="submit"
                                className="rounded-xl bg-primary text-white text-[9px] font-black uppercase tracking-widest h-11 px-4 sm:px-8 shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                            >
                                Save Changes
                            </Button>
                        </div>
                    </DialogHeader>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-7 sm:gap-10">
                        {/* Column 1: Location & Info */}
                        <div className="space-y-6">
                            <SectionHeader icon={MapPin} title="Location & Basic Details" />
                            <div className="space-y-4">
                                <EditField icon={MapPin} label="Physical Address" value={formData.address} onChange={(v: string) => setFormData({ ...formData, address: v })} />
                                
                                <div className="space-y-1.5 group">
                                    <label className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em] ml-1 group-focus-within:text-primary transition-colors">Parking Type</label>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                variant="outline"
                                                className="w-full h-11 bg-bg-main/50 border border-border-main rounded-xl px-4 text-xs font-bold text-text-main hover:bg-bg-card hover:text-text-main transition-all justify-between group-focus-within:border-primary/30"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <Type size={14} className="text-text-muted group-focus-within:text-primary transition-colors" />
                                                    <span className="truncate">
                                                        {
                                                            [
                                                                { label: "Home / Individual", value: "home" },
                                                                { label: "Residential Society", value: "society" },
                                                                { label: "Commercial / Mall", value: "commercial" },
                                                                { label: "Government Owned", value: "govt" },
                                                                { label: "Municipal Parking", value: "municipality" },
                                                            ].find(opt => opt.value === formData.parkingType)?.label || "Select Type"
                                                        }
                                                    </span>
                                                </div>
                                                <ChevronDown size={14} className="text-text-muted opacity-50" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width] min-w-[200px] bg-bg-card border border-border-main rounded-xl shadow-xl p-1">
                                            {[
                                                { label: "Home / Individual", value: "home" },
                                                { label: "Residential Society", value: "society" },
                                                { label: "Commercial / Mall", value: "commercial" },
                                                { label: "Government Owned", value: "govt" },
                                                { label: "Municipal Parking", value: "municipality" },
                                            ].map((opt) => (
                                                <DropdownMenuItem
                                                    key={opt.value}
                                                    onClick={() => setFormData({ ...formData, parkingType: opt.value })}
                                                    className={`px-3 py-2 rounded-lg text-xs font-bold tracking-wide cursor-pointer transition-colors ${formData.parkingType === opt.value ? 'bg-primary/10 text-primary' : 'text-text-main hover:bg-bg-main'}`}
                                                >
                                                    {opt.label}
                                                </DropdownMenuItem>
                                            ))}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                variant="outline"
                                                className="w-full h-11 bg-bg-main/50 border border-border-main rounded-xl px-4 text-xs font-bold text-text-main hover:bg-bg-card hover:text-text-main transition-all justify-between group-focus-within:border-primary/30"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <Clock size={14} className="text-text-muted group-focus-within:text-primary transition-colors" />
                                                    <span className="truncate">{formData.is24hr ? 'Yes' : 'No'}</span>
                                                </div>
                                                <ChevronDown size={14} className="text-text-muted opacity-50" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width] min-w-[200px] bg-bg-card border border-border-main rounded-xl shadow-xl p-1">
                                            <DropdownMenuItem
                                                onClick={() => setFormData({ ...formData, is24hr: true })}
                                                className={`px-3 py-2 rounded-lg text-xs font-bold tracking-wide cursor-pointer transition-colors ${formData.is24hr ? 'bg-primary/10 text-primary' : 'text-text-main hover:bg-bg-main'}`}
                                            >
                                                Yes
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() => setFormData({ ...formData, is24hr: false })}
                                                className={`px-3 py-2 rounded-lg text-xs font-bold tracking-wide cursor-pointer transition-colors ${!formData.is24hr ? 'bg-primary/10 text-primary' : 'text-text-main hover:bg-bg-main'}`}
                                            >
                                                No
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>

                                {!formData.is24hr && (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <EditField icon={Clock} label="Opening Time" type="time" value={formData.openTime} onChange={(v: string) => setFormData({ ...formData, openTime: v })} />
                                        <EditField icon={Clock} label="Closing Time" type="time" value={formData.closeTime} onChange={(v: string) => setFormData({ ...formData, closeTime: v })} />
                                    </div>
                                )}

                                <div className="space-y-1.5 group mt-4">
                                    <label className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em] ml-1 group-focus-within:text-red-500 transition-colors text-red-500/70">Emergency Control</label>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                variant="outline"
                                                className="w-full h-11 bg-red-500/5 border border-red-500/20 rounded-xl px-4 text-xs font-bold text-red-500 hover:bg-red-500/10 hover:text-red-500 transition-all justify-between group-focus-within:border-red-500/40"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <Info size={14} className="text-red-500/70 group-focus-within:text-red-500 transition-colors" />
                                                    <span className="truncate">{formData.isClosed ? 'Temporarily Closed' : 'Open for Business'}</span>
                                                </div>
                                                <ChevronDown size={14} className="text-red-500/70 opacity-50" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width] min-w-[200px] bg-bg-card border border-border-main rounded-xl shadow-xl p-1">
                                            <DropdownMenuItem
                                                onClick={() => setFormData({ ...formData, isClosed: false })}
                                                className={`px-3 py-2 rounded-lg text-xs font-bold tracking-wide cursor-pointer transition-colors ${!formData.isClosed ? 'bg-red-500/10 text-red-500' : 'text-text-main hover:bg-bg-main'}`}
                                            >
                                                Open for Business
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() => setFormData({ ...formData, isClosed: true })}
                                                className={`px-3 py-2 rounded-lg text-xs font-bold tracking-wide cursor-pointer transition-colors ${formData.isClosed ? 'bg-red-500/10 text-red-500' : 'text-text-main hover:bg-bg-main'}`}
                                            >
                                                Temporarily Closed
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
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
