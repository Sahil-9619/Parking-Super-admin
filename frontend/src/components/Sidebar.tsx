import React from 'react';
import {
    LayoutDashboard,
    Users,
    MapPin,
    Layers,
    CalendarCheck,
    UserPlus,
    History,
    Wallet,
    Star,
    Settings,
    ChevronLeft,
    Menu,
    LogOut,
    Building2,
    Tag,
    PackagePlus,
    Car,
    Sparkles,
    Scale,
    ShieldCheck,
    type LucideIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import logo from '../assets/logo.png';
import { useLocation, useNavigate } from 'react-router-dom';

interface SidebarProps {
    isCollapsed: boolean;
    setIsCollapsed: (value: boolean) => void;
    onLogout: () => void;
}

interface MenuItem {
    icon: LucideIcon;
    label: string;
    path: string;
}

interface MenuGroup {
    group: string;
    items: MenuItem[];
}

export const menuItems: MenuGroup[] = [
    {
        group: 'OVERVIEW', items: [
            { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
        ]
    },
    {
        group: 'OWNER MANAGEMENT', items: [
            { icon: Building2, label: 'Owners List', path: '/admin/owners' },
            { icon: ShieldCheck, label: 'KYC Approvals', path: '/admin/kyc-approvals' },
            { icon: MapPin, label: 'Parking Areas', path: '/admin/area' },
            { icon: Layers, label: 'Slots Occupancy', path: '/admin/slots' },
            { icon: Tag, label: 'Pricing & Peaks', path: '/admin/pricing-rules' },
            { icon: PackagePlus, label: 'Custom Addons', path: '/admin/custom-addons' },
            { icon: Wallet, label: 'Partner Payouts', path: '/admin/payouts' },
        ]
    },
    {
        group: 'USER MANAGEMENT', items: [
            { icon: Users, label: 'User List', path: '/admin/users' },
            { icon: Car, label: 'User Vehicles', path: '/admin/vehicles' },
            { icon: CalendarCheck, label: 'Main Bookings', path: '/admin/bookings' },
            { icon: Sparkles, label: 'Service Bookings', path: '/admin/addon-bookings' },
            { icon: UserPlus, label: 'Subscriptions', path: '/admin/subscribers' },
            { icon: Star, label: 'Reviews & Ratings', path: '/admin/review' },
        ]
    },
    {
        group: 'OPERATION DESK', items: [
            { icon: Scale, label: 'Disputes Resolver', path: '/admin/disputes' },
            { icon: History, label: 'Financial Ledger', path: '/admin/wallet-txns' },
            { icon: Settings, label: 'General Settings', path: '/admin/settings' },
        ]
    }
];

const Sidebar = ({ isCollapsed, setIsCollapsed, onLogout }: SidebarProps) => {
    const location = useLocation();
    const navigate = useNavigate();

    return (
        <motion.div
            initial={false}
            animate={{
                width: isCollapsed ? 85 : 210,
                transition: { type: 'spring', stiffness: 300, damping: 30 }
            }}
            className="h-screen bg-sidebar-bg border-r border-border-main flex flex-col relative z-50 shadow-sm gpu transition-colors duration-300"
        >
            {/* Sidebar Header with Logo */}
            <div className="p-4 flex items-center justify-between border-b border-border-main mb-4 relative h-16 bg-primary">
                <div className={`flex items-center gap-3 transition-all duration-300 ${isCollapsed ? 'mx-auto' : ''}`}>
                    <img src={logo} alt="Logo" className="h-8 w-auto invert brightness-0" />
                    {!isCollapsed && (
                        <motion.span
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="text-xl font-black text-white tracking-tight"
                        >
                            Park Adda
                        </motion.span>
                    )}
                </div>

                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className={`hidden md:flex absolute ${isCollapsed ? '-right-4 top-1/2 -translate-y-1/2' : 'right-4 top-1/2 -translate-y-1/2'} w-8 h-8 bg-sidebar-bg shadow-md border border-border-main rounded-full items-center justify-center transition-all z-[60] text-text-muted hover:text-primary`}
                >
                    {isCollapsed ? <Menu size={16} /> : <ChevronLeft size={16} />}
                </button>
            </div>

            {/* Navigation Items */}
            <div className="flex-1 overflow-y-auto px-3 py-2 scrollbar-hide flex flex-col">
                <div className="flex-1">
                    {menuItems.map((group, idx) => (
                        <div key={idx} className="mb-6">
                            <AnimatePresence mode="wait">
                                {!isCollapsed && (
                                    <motion.h4
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="px-4 text-[10px] font-bold text-text-muted uppercase tracking-widest mb-3 whitespace-nowrap"
                                    >
                                        {group.group}
                                    </motion.h4>
                                )}
                            </AnimatePresence>

                            <div className="space-y-1">
                                {group.items.map((item, itemIdx) => {
                                    const isActive = location.pathname === item.path;
                                    return (
                                        <button
                                            key={itemIdx}
                                            onClick={() => navigate(item.path)}
                                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 relative group overflow-hidden ${isActive ? 'text-primary' : 'text-text-muted hover:bg-bg-main hover:text-text-main'
                                                }`}
                                        >
                                            {isActive && (
                                                <motion.div
                                                    layoutId="active-pill"
                                                    className="absolute inset-0 bg-primary/10"
                                                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                                />
                                            )}

                                            <item.icon size={20} className={`relative z-10 ${isActive ? 'text-primary' : 'text-text-muted group-hover:text-text-main'}`} />

                                            {!isCollapsed && (
                                                <motion.span
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    exit={{ opacity: 0, x: -10 }}
                                                    className="text-sm font-semibold tracking-tight relative z-10 whitespace-nowrap"
                                                >
                                                    {item.label}
                                                </motion.span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>


                {/* Logout Button */}
                <div className="mt-auto border-t border-border-main pt-2 pb-4">
                    <button
                        onClick={onLogout}
                        className={`w-full flex items-center gap-3 px-4  rounded-xl transition-all duration-200 text-red-500 hover:bg-red-500/10 group`}
                    >
                        <LogOut size={20} className="mt-2 text-red-400 group-hover:text-red-600" />
                        {!isCollapsed && (
                            <span className="text-sm font-semibold tracking-tight">Logout</span>
                        )}
                    </button>
                </div>
            </div>

            {/* Footer Branding */}
            {!isCollapsed && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className=" border-t border-border-main bg-sidebar-bg"
                >
                    <div className="bg-bg-main p-4 rounded-2xl">
                        <p className="text-[9px] text-text-muted font-medium text-center">© 2026 Park Adda Systems</p>
                    </div>
                </motion.div>
            )}
        </motion.div>
    );
};

export default React.memo(Sidebar);
