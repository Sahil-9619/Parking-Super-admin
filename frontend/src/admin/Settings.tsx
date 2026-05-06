import { useState } from 'react';
import {
    User,
    Shield,
    Bell,
    Monitor,
    ShieldCheck,
    Smartphone,
    Lock,
    Save,
    CreditCard,
    ChevronRight,
    Cloud,
    Zap,
    Fingerprint,
    ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';

const Settings = () => {
    const [activeTab, setActiveTab] = useState('profile');

    const tabs = [
        { id: 'profile', icon: User, label: 'Super Admin Profile' },
        { id: 'security', icon: Shield, label: 'Security & Access' },
        { id: 'system', icon: Monitor, label: 'System Config' },
        { id: 'notifications', icon: Bell, label: 'Alert Center' },
        { id: 'billing', icon: CreditCard, label: 'Financial' },
    ];

    const SettingGroup = ({ title, children }: { title: string, children: React.ReactNode }) => (
        <div className="space-y-4">
            <div className="flex items-center gap-3">
                <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.4em] whitespace-nowrap">
                    {title}
                </h4>
                <div className="h-px w-full bg-border-main/30" />
            </div>
            <div className="divide-y divide-border-main/20 px-1">
                {children}
            </div>
        </div>
    );

    const SettingRow = ({ icon: Icon, title, desc, action }: any) => (
        <div className="flex items-center justify-between py-3.5 group transition-all duration-200">
            <div className="flex items-center gap-4">
                <div className="p-2.5 rounded-xl bg-bg-main dark:bg-white/5 border border-border-main/50 text-text-muted group-hover:text-primary group-hover:border-primary/30 transition-all duration-300">
                    <Icon size={14} />
                </div>
                <div>
                    <h5 className="text-[13px] font-black text-text-main tracking-tight leading-none">{title}</h5>
                    <p className="text-[9px] font-bold text-text-muted uppercase tracking-[0.1em] mt-1.5 opacity-60">{desc}</p>
                </div>
            </div>
            <div className="flex items-center gap-4">
                {action}
                <ChevronRight size={12} className="text-text-muted opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-1" />
            </div>
        </div>
    );

    const renderContent = () => {
        switch (activeTab) {
            case 'profile':
                return (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10">
                        <div className="grid grid-cols-2 gap-x-16 gap-y-10">
                            <SettingGroup title="Identity Node">
                                <SettingRow
                                    icon={User}
                                    title="Display Identity"
                                    desc="Public administrative name"
                                    action={<Input defaultValue="Super Admin" className="h-9 w-40 rounded-xl border-border-main bg-bg-main/50 text-[11px] font-bold px-3 focus:border-primary/50" />}
                                />
                                <SettingRow
                                    icon={Fingerprint}
                                    title="System Rank"
                                    desc="Master root level privilege"
                                    action={<span className="text-[10px] font-black text-primary uppercase tracking-[0.1em] px-2.5 py-0.5 bg-primary/5 rounded-full border border-primary/10">Root Admin</span>}
                                />
                                <SettingRow
                                    icon={Smartphone}
                                    title="Secure Mobile"
                                    desc="Verification terminal"
                                    action={<Input defaultValue="+91 98765 43210" className="h-9 w-40 rounded-xl border-border-main bg-bg-main/50 text-[11px] font-bold px-3 focus:border-primary/50" />}
                                />
                            </SettingGroup>

                            <SettingGroup title="Core Hardware">
                                <SettingRow
                                    icon={Zap}
                                    title="Turbo Scaling"
                                    desc="Acceleration v4"
                                    action={<div className="h-4.5 w-9 bg-primary rounded-full relative flex items-center px-0.5"><div className="w-3.5 h-3.5 bg-white rounded-full ml-auto shadow-sm" /></div>}
                                />
                                <SettingRow
                                    icon={Cloud}
                                    title="Sync Frequency"
                                    desc="Redundancy level"
                                    action={<span className="text-[10px] font-black text-text-main uppercase tracking-widest">Ultra-Sync</span>}
                                />
                            </SettingGroup>
                        </div>
                    </motion.div>
                );
            case 'security':
                return (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10 max-w-2xl">
                        <SettingGroup title="Security Protocols">
                            <SettingRow
                                icon={Lock}
                                title="Master Credential"
                                desc="Rotate administrative password"
                                action={<Button variant="outline" className="h-8 rounded-xl border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white font-black uppercase tracking-widest text-[9px] px-6">Update Key</Button>}
                            />
                            <SettingRow
                                icon={ShieldCheck}
                                title="Advanced MFA"
                                desc="Enforce biometric security"
                                action={<div className="h-4.5 w-9 bg-primary rounded-full relative flex items-center px-0.5"><div className="w-3.5 h-3.5 bg-white rounded-full ml-auto shadow-sm" /></div>}
                            />
                        </SettingGroup>
                    </motion.div>
                );
            default:
                return (
                    <div className="py-20 flex flex-col items-center justify-center opacity-20">
                        <Zap size={32} className="text-primary mb-4 animate-pulse" />
                        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-text-muted">Node Finalizing</p>
                    </div>
                );
        }
    };

    return (
        <div className="w-full animate-in fade-in duration-700 mt-5">
            <div className="flex gap-12 px-6 items-start">
                {/* Minimalist Sidebar Shifted Up */}
                <div className="w-60 shrink-0 space-y-4">
                    {/* Thinned Identity Node */}
                    <div className="px-4 py-3.5 bg-primary/5 rounded-2xl border border-primary/10 flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary text-white shadow-lg shadow-primary/20 rounded-xl flex items-center justify-center text-base font-black border-[2px] border-bg-main">
                            SA
                        </div>
                        <div>
                            <p className="text-md font-black text-text-main tracking-tight leading-none">Super Admin</p>
                        </div>
                    </div>

                    <div className="space-y-1">
                        {tabs.map((tab) => {
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 group relative ${isActive
                                        ? 'bg-primary/5 text-primary'
                                        : 'text-text-muted hover:bg-bg-main hover:text-text-main'
                                        }`}
                                >
                                    {isActive && (
                                        <motion.div layoutId="nav-line" className="absolute left-0 w-0.5 h-3.5 bg-primary rounded-full" />
                                    )}
                                    <tab.icon size={15} className={isActive ? 'text-primary' : 'group-hover:text-primary transition-colors'} />
                                    <span className={`text-[10.5px] font-black tracking-tight uppercase ${isActive ? 'text-primary' : ''}`}>{tab.label}</span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Compact Action Hub */}
                    <div className="pt-2 space-y-1.5">
                        <Button className="w-full h-9 bg-primary text-white shadow-lg shadow-primary/10 font-black uppercase tracking-widest text-[8px] rounded-lg active:scale-95 transition-all flex items-center gap-2">
                            <Save size={12} />
                            Save
                        </Button>
                        <Button variant="ghost" className="w-full h-8 text-text-muted font-black uppercase tracking-widest text-[8px] flex items-center gap-2 hover:bg-bg-main">
                            <ExternalLink size={12} />
                            Audit
                        </Button>
                    </div>
                </div>

                {/* Integrated Content Area */}
                <div className="flex-1 min-h-[600px]">                    <AnimatePresence mode="wait">
                    {renderContent()}
                </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default Settings;
