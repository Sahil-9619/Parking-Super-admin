import { Mail, Phone, ShieldCheck, Building2, Smartphone, Wallet, User as UserIcon, Activity, CreditCard } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Dialog,
    DialogContent,
    DialogHeader,
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
                onOpenAutoFocus={(e) => e.preventDefault()}
                style={{ backgroundColor: 'rgba(var(--bg-card-rgb), 0.98)' }}
                className="max-w-4xl rounded-xl sm:rounded-2xl border-border-main backdrop-blur-3xl p-0 shadow-2xl shadow-black/20 animate-in fade-in zoom-in duration-300 [&>button]:hidden"
            >
                <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-b from-primary/10 to-transparent -z-10" />

                <form onSubmit={handleSubmit} className="p-5 sm:p-10 space-y-7 sm:space-y-10 max-h-[calc(100dvh-1rem)] overflow-y-auto custom-scrollbar">
                    <DialogHeader className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 space-y-0 text-left">
                        <div className="flex items-center gap-4 sm:gap-6 min-w-0">
                            <div className="w-16 h-16 sm:w-24 sm:h-24 shrink-0 bg-primary/10 text-primary border-4 border-bg-card shadow-2xl rounded-2xl sm:rounded-[2rem] flex items-center justify-center text-2xl sm:text-4xl font-black">
                                {data.avatar || formData.name?.charAt(0)}
                            </div>

                            <div className="min-w-0 flex-1">
                                <Input
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="text-2xl sm:text-3xl font-black text-text-main tracking-tighter leading-tight sm:leading-none mb-3 bg-bg-main/50 border border-border-main rounded-xl px-4 py-2 h-auto focus-visible:ring-primary/20 focus-visible:border-primary/30 transition-all"
                                    placeholder="Enter Name"
                                />
                                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                                    <div className="flex items-center gap-1 bg-bg-main p-1 rounded-xl border border-border-main/50">
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, status: 'active' })}
                                            className={cn(
                                                "px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                                                formData.status.toLowerCase() === 'active' ? "bg-emerald-500/20 text-emerald-500 border border-emerald-500/20" : "text-text-muted hover:bg-bg-card border border-transparent"
                                            )}
                                        >
                                            Active
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, status: 'banned' })}
                                            className={cn(
                                                "px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                                                formData.status.toLowerCase() === 'banned' ? "bg-red-500/20 text-red-500 border border-red-500/20" : "text-text-muted hover:bg-bg-card border border-transparent"
                                            )}
                                        >
                                            Banned
                                        </button>
                                    </div>
                                    <p className="max-w-full truncate text-[10px] sm:text-[11px] font-bold text-text-muted uppercase tracking-[0.14em] sm:tracking-[0.2em] bg-bg-main px-3 py-1.5 rounded-lg border border-border-main/50">
                                        Partner ID: {data.id}
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

                    <div className={cn("grid gap-7 sm:gap-10", isOwner ? "grid-cols-1 sm:grid-cols-2 xl:grid-cols-4" : "grid-cols-1 md:grid-cols-2")}>
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

                        {/* Column 3: Financial Accounts (Owners Only) */}
                        {isOwner && (
                            <div className="space-y-6">
                                <SectionHeader icon={CreditCard} title="Financial Accounts" />
                                <div className="space-y-4">
                                    <EditField icon={UserIcon} label="Account Holder" value={formData.bankHolder} onChange={(v: string) => setFormData({ ...formData, bankHolder: v })} />
                                    <EditField icon={CreditCard} label="Account Number" value={formData.bankAccount} onChange={(v: string) => setFormData({ ...formData, bankAccount: v })} />
                                    <EditField icon={Activity} label="IFSC Code" value={formData.bankIfsc} onChange={(v: string) => setFormData({ ...formData, bankIfsc: v })} />
                                </div>
                            </div>
                        )}

                        {/* Column 4: Wallet & Safety */}
                        <div className="space-y-6">
                            <SectionHeader icon={Wallet} title="Wallet & Safety" />
                            <div className="space-y-4">
                                <EditField icon={Wallet} label="Total Balance" value={formData.walletBalance} onChange={(v: string) => setFormData({ ...formData, walletBalance: v })} />
                                {isOwner && (
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
                                )}
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



