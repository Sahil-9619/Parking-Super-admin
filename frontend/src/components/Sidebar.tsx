import {
    LayoutDashboard,
    Users,
    MapPin,
    Layers,
    ClipboardList,
    Wallet,
    CalendarCheck,
    UserPlus,
    History,
    Clock,
    Star,
    Settings,
    ChevronLeft,
    Menu,
    LogOut,
    type LucideIcon
} from 'lucide-react';
import { motion } from 'framer-motion';
import logo from '../assets/logo.png';

interface SidebarProps {
    isCollapsed: boolean;
    setIsCollapsed: (value: boolean) => void;
    onLogout: () => void;
}

interface MenuItem {
    icon: LucideIcon;
    label: string;
    path: string;
    active?: boolean;
}

interface MenuGroup {
    group: string;
    items: MenuItem[];
}

const menuItems: MenuGroup[] = [
    {
        group: 'OPERATIONS', items: [
            { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard', active: true },
            { icon: Users, label: 'Users', path: '/admin/users' },
            { icon: MapPin, label: 'Parking Area', path: '/admin/area' },
            { icon: Layers, label: 'Parking Zone', path: '/admin/zone' },
            { icon: ClipboardList, label: 'Slot Management', path: '/admin/slots' },
        ]
    },
    {
        group: 'FINANCE & ADMIN', items: [
            { icon: Wallet, label: 'Revenue', path: '/admin/revenue' },
            { icon: CalendarCheck, label: 'Bookings', path: '/admin/bookings' },
            { icon: UserPlus, label: 'Subscribers', path: '/admin/subscribers' },
        ]
    },
    {
        group: 'HISTORY', items: [
            { icon: History, label: 'Subscription history', path: '/admin/history' },
            { icon: Clock, label: 'Recent Bookings', path: '/admin/recent' },
            { icon: Star, label: 'Review', path: '/admin/review' },
            { icon: Settings, label: 'Settings', path: '/admin/settings' },
        ]
    }
];

export default function Sidebar({ isCollapsed, setIsCollapsed, onLogout }: SidebarProps) {
    return (
        <motion.div
            initial={false}
            animate={{ width: isCollapsed ? 80 : 280 }}
            className="h-screen bg-[#f8fafc] border-r border-slate-200 flex flex-col relative z-50 shadow-sm"
        >
            {/* Sidebar Header with Logo */}
            <div
                className="p-4 flex items-center justify-between border-b border-slate-100 mb-4 relative min-h-[72px] bg-primary"
            >
                {!isCollapsed && (
                    <div className="flex items-center gap-3">
                        <img src={logo} alt="Logo" className="h-8 w-auto invert brightness-0" />
                        <span className="text-xl font-black text-white tracking-tight">Park Adda</span>
                    </div>
                )}
                {isCollapsed && (
                    <img src={logo} alt="Logo" className="h-8 w-auto mx-auto invert brightness-0" />
                )}

                {/* Toggle Button - Positioned Top Right of Sidebar */}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className={`absolute ${isCollapsed ? 'right-1' : 'right-4'} top-1/2 -translate-y-1/2 w-8 h-8 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-all z-[60]`}
                >
                    {isCollapsed ? <Menu size={18} className="text-white" /> : <ChevronLeft size={18} className="text-white" />}
                </button>
            </div>

            {/* Navigation Items */}
            <div className="flex-1 overflow-y-auto px-3 py-2 scrollbar-hide flex flex-col">
                <div className="flex-1">
                    {menuItems.map((group, idx) => (
                        <div key={idx} className="mb-6">
                            {!isCollapsed && (
                                <h4 className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
                                    {group.group}
                                </h4>
                            )}
                            <div className="space-y-1">
                                {group.items.map((item, itemIdx) => (
                                    <button
                                        key={itemIdx}
                                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${item.active
                                            ? 'bg-primary/10 text-primary'
                                            : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
                                            }`}
                                    >
                                        <item.icon size={20} className={`${item.active ? 'text-primary' : 'text-slate-400 group-hover:text-slate-600'}`} />
                                        {!isCollapsed && (
                                            <span className="text-sm font-semibold tracking-tight">{item.label}</span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Logout Button */}
                <div className="mt-auto border-t border-slate-100 pt-2 pb-4">
                    <button
                        onClick={onLogout}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-red-500 hover:bg-red-50 group`}
                    >
                        <LogOut size={20} className="text-red-400 group-hover:text-red-600" />
                        {!isCollapsed && (
                            <span className="text-sm font-semibold tracking-tight">Logout</span>
                        )}
                    </button>
                </div>
            </div>

            {/* Footer Branding */}
            {!isCollapsed && (
                <div className="p-6 border-t border-slate-100 bg-white">
                    <div className="bg-slate-50 p-4 rounded-2xl">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 text-center">Version 1.0.4</p>
                        <p className="text-[9px] text-slate-300 font-medium text-center">© 2026 Park Adda Systems</p>
                    </div>
                </div>
            )}
        </motion.div>
    );
}
