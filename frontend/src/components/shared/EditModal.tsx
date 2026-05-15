import { Mail, Phone, Calendar, ShieldCheck, Building2, Smartphone, Ban, Wallet, User as UserIcon, Activity, CreditCard } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { cn } from '@/lib/utils';
import type { EntityType } from './ViewModal';
import { useState, useEffect } from 'react';

interface EditModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    type: EntityType;
    data: any | null;
    onSave: (data: any) => void;
}

export function EditModal({ isOpen, onOpenChange, type, data, onSave }: EditModalProps) {
    const [formData, setFormData] = useState<any>(null);

    useEffect(() => {
        if (data) {
            setFormData({
                name: data.name || '',
                email: data.email || '',
                phone: data.phone || '',
                status: data.status || 'active',
                role: data.role || '',
                company: data.company || '',
                gstNumber: data.gstNumber || '',
                verificationStatus: data.verificationStatus || 'pending',
                walletBalance: data.walletBalance || '0',
                strikeCount: data.strikeCount || 0,
                bankHolder: data.bankDetails?.holder || '',
                bankAccount: data.bankDetails?.account || '',
                bankIfsc: data.bankDetails?.ifsc || '',
            });
        }
    }, [data]);

    if (!data || !formData) return null;

    const isOwner = type === 'owner';

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (isOwner) {
            const submitData = {
                ...formData,
                bankDetails: {
                    holder: formData.bankHolder,
                    account: formData.bankAccount,
                    ifsc: formData.bankIfsc
                }
            };
            onSave(submitData);
        } else {
            // For users, strip owner-specific fields
            const { 
                company, gstNumber, verificationStatus, strikeCount, 
                bankHolder, bankAccount, bankIfsc,
                ...userData 
            } = formData;
            onSave(userData);
        }
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
                                {data.avatar || formData.name?.charAt(0)}
                            </div>

                            <div>
                                <Input 
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="text-4xl font-black text-text-main tracking-tighter leading-none mb-3 bg-transparent border-none p-0 h-auto focus-visible:ring-0"
                                    placeholder="Enter Name"
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
                                        <option value="suspended">Suspended</option>
                                        <option value="banned">Banned</option>
                                        <option value="pending">Pending</option>
                                    </select>
                                    <p className="text-[11px] font-bold text-text-muted uppercase tracking-[0.2em] bg-bg-main px-3 py-1.5 rounded-lg border border-border-main/50">
                                        Partner ID: {data.id}
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

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
                        {/* Column 1: Communication */}
                        <div className="space-y-6">
                            <SectionHeader icon={Smartphone} title="Communication" />
                            <div className="space-y-4">
                                <EditField icon={Mail} label="Professional Email" value={formData.email} onChange={(v: string) => setFormData({ ...formData, email: v })} />
                                <EditField icon={Phone} label="Direct Contact" value={formData.phone} onChange={(v: string) => setFormData({ ...formData, phone: v })} />
                                <EditField icon={UserIcon} label="Assigned Role" value={formData.role} onChange={(v: string) => setFormData({ ...formData, role: v })} />
                            </div>
                        </div>

                        {/* Column 2: Business Profile (Owners Only) */}
                        {isOwner && (
                            <div className="space-y-6">
                                <SectionHeader icon={Building2} title="Business Profile" />
                                <div className="space-y-4">
                                    <EditField icon={ShieldCheck} label="Account Category" value={formData.company} onChange={(v: string) => setFormData({ ...formData, company: v })} />
                                    <EditField icon={Activity} label="GST Identification" value={formData.gstNumber} onChange={(v: string) => setFormData({ ...formData, gstNumber: v })} />
                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em] ml-1">KYC Compliance</label>
                                        <select 
                                            value={formData.verificationStatus.toLowerCase()}
                                            onChange={(e) => setFormData({ ...formData, verificationStatus: e.target.value })}
                                            className="w-full h-11 bg-bg-main/50 border border-border-main rounded-xl px-4 text-xs font-bold text-text-main focus:outline-none focus:border-primary/30 transition-all"
                                        >
                                            <option value="pending">Pending</option>
                                            <option value="approved">Approved</option>
                                            <option value="rejected">Rejected</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Column 3: Financial Accounts */}
                        <div className="space-y-6">
                            <SectionHeader icon={CreditCard} title="Financial Accounts" />
                            <div className="space-y-4">
                                <EditField icon={UserIcon} label="Account Holder" value={formData.bankHolder} onChange={(v: string) => setFormData({ ...formData, bankHolder: v })} />
                                <EditField icon={CreditCard} label="Account Number" value={formData.bankAccount} onChange={(v: string) => setFormData({ ...formData, bankAccount: v })} />
                                <EditField icon={Activity} label="IFSC Code" value={formData.bankIfsc} onChange={(v: string) => setFormData({ ...formData, bankIfsc: v })} />
                            </div>
                        </div>

                        {/* Column 4: Wallet & Safety */}
                        <div className="space-y-6">
                            <SectionHeader icon={Wallet} title="Wallet & Safety" />
                            <div className="space-y-4">
                                <EditField icon={Wallet} label="Total Balance" value={formData.walletBalance} onChange={(v: string) => setFormData({ ...formData, walletBalance: v })} />
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em] ml-1">Active Strikes</label>
                                    <div className="flex items-center gap-3">
                                        <Input 
                                            type="number"
                                            value={formData.strikeCount}
                                            onChange={(e) => setFormData({ ...formData, strikeCount: parseInt(e.target.value) })}
                                            className="h-11 rounded-xl border-border-main bg-bg-main/50 text-xs font-bold"
                                        />
                                        <span className="text-[10px] font-black text-text-muted uppercase">Warnings</span>
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

function EditField({ icon: Icon, label, value, onChange, type = "text" }: any) {
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
                    onChange={(e) => onChange(e.target.value)}
                    className="pl-11 h-11 rounded-xl border-border-main bg-bg-main/50 text-text-main focus-visible:ring-primary/20 focus-visible:border-primary/30 transition-all text-xs font-bold"
                />
            </div>
        </div>
    );
}



