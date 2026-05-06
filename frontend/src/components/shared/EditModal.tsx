import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import type { EntityType } from './ViewModal';
import { User, Mail, ShieldCheck, Building2, Smartphone } from 'lucide-react';

interface EditModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    type: EntityType;
    data: {
        id: string;
        name: string;
        email: string;
        phone: string;
        status: string;
        ownerName?: string;
    } | null;
    onSave: (data: any) => void;
}

export function EditModal({ isOpen, onOpenChange, type, data, onSave }: EditModalProps) {
    if (!data) return null;

    const isOwner = type === 'owner';

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent 
                onOpenAutoFocus={(e) => e.preventDefault()}
                style={{ backgroundColor: 'rgba(var(--bg-card-rgb), 0.8)' }}
                className="max-w-md rounded-[2rem] border-border-main backdrop-blur-3xl p-0 overflow-hidden shadow-2xl shadow-black/10 animate-in fade-in zoom-in duration-300"
            >
                {/* Custom Header Area */}
                <div className="bg-primary/5 p-6 pb-4 border-b border-primary/10">
                    <DialogHeader>
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-primary text-white rounded-xl shadow-lg shadow-primary/20">
                                {isOwner ? <Building2 size={18} /> : <User size={18} />}
                            </div>
                            <div>
                                <DialogTitle className="text-xl font-black text-text-main tracking-tight leading-none">
                                    {isOwner ? 'Edit Partner Profile' : 'Edit User Profile'}
                                </DialogTitle>
                                <DialogDescription className="text-[10px] font-bold text-text-muted uppercase tracking-widest mt-1.5 flex items-center gap-1.5">
                                    <ShieldCheck size={10} className="text-primary" />
                                    Secure Administrative Override
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>
                </div>

                <form className="p-6 space-y-5" onSubmit={(e) => { e.preventDefault(); onSave(data); }}>
                    {/* Compact Input Groups */}
                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.15em] ml-1">
                                {isOwner ? 'Company Legal Name' : 'Customer Full Name'}
                            </label>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors">
                                    {isOwner ? <Building2 size={14} /> : <User size={14} />}
                                </div>
                                <Input 
                                    defaultValue={data.name}
                                    className="pl-11 h-11 rounded-xl border-border-main bg-bg-main/50 text-text-main focus-visible:ring-primary/20 focus-visible:border-primary/30 transition-all text-xs font-bold"
                                />
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.15em] ml-1">
                                    {isOwner ? 'Primary Owner' : 'Direct Phone'}
                                </label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors">
                                        {isOwner ? <User size={14} /> : <Smartphone size={14} />}
                                    </div>
                                    <Input 
                                        defaultValue={isOwner ? data.ownerName : data.phone}
                                        className="pl-11 h-11 rounded-xl border-border-main bg-bg-main/50 text-text-main focus-visible:ring-primary/20 focus-visible:border-primary/30 transition-all text-xs font-bold"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.15em] ml-1">Account Status</label>
                                <div className="relative">
                                    <select 
                                        defaultValue={data.status}
                                        className="w-full h-11 bg-bg-main/50 border border-border-main rounded-xl px-4 text-[11px] font-black text-text-main uppercase tracking-wider focus:outline-none focus:border-primary/30 focus:ring-4 focus:ring-primary/5 transition-all cursor-pointer appearance-none"
                                    >
                                        <option value="Active">Active</option>
                                        <option value="Under Review">Under Review</option>
                                        <option value="Suspended">Suspended</option>
                                        {type === 'user' && <option value="Inactive">Inactive</option>}
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted">
                                        <ShieldCheck size={12} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.15em] ml-1">Authenticated Email</label>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors">
                                    <Mail size={14} />
                                </div>
                                <Input 
                                    type="email" 
                                    defaultValue={data.email}
                                    className="pl-11 h-11 rounded-xl border-border-main bg-bg-main/50 text-text-main focus-visible:ring-primary/20 focus-visible:border-primary/30 transition-all text-xs font-bold"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Compact Action Bar */}
                    <div className="pt-4 flex items-center gap-3">
                        <Button 
                            type="button" 
                            variant="ghost" 
                            onClick={() => onOpenChange(false)}
                            className="flex-1 h-11 rounded-xl text-[10px] font-black uppercase tracking-widest text-text-muted hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-500 transition-all"
                        >
                            Cancel
                        </Button>
                        <Button 
                            type="submit" 
                            className="flex-[2] h-11 bg-primary text-white hover:bg-primary/90 font-black uppercase tracking-widest text-[10px] rounded-xl shadow-lg shadow-primary/20 active:scale-95 transition-all"
                        >
                            Confirm Updates
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
