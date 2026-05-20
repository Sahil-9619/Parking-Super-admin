// @ts-nocheck
import { useState } from 'react';
import {
    Users,
    CalendarCheck,
    CreditCard,
    Building2,
    UserPlus,
    ChevronRight,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { DataTable } from '@/components/shared/DataTable';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

import { useEffect } from 'react';
import { dashboardService } from '@/services/dashboardService';
import type { DashboardStats } from '@/services/dashboardService';



// --- Types & Data ---

// --- Data Types handled by dashboardService ---


// --- Sub-components ---

const DynamicShapes = ({ color }: { color: string }) => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none group-hover:opacity-100 transition-opacity duration-500">
        <motion.div
            animate={{
                rotate: [45, 50, 45],
                scale: [1, 1.05, 1],
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-1/4 -left-1/4 w-[150%] h-[150%] opacity-[0.12]"
            style={{
                background: `repeating-linear-gradient(45deg, ${color}, ${color} 1px, transparent 1px, transparent 35px)`,
            }}
        />
        <motion.div
            animate={{
                x: [-10, 10, -10],
                y: [-5, 5, -5],
                rotate: [0, 5, 0],
            }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-0 right-0 w-full h-full opacity-[0.18]"
            style={{
                background: `linear-gradient(135deg, ${color}, transparent 60%)`,
                clipPath: 'polygon(100% 0, 0 0, 100% 100%)'
            }}
        />
        <motion.div
            animate={{
                x: [10, -10, 10],
                y: [5, -5, 5],
                rotate: [0, -5, 0],
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute bottom-0 left-0 w-full h-full opacity-[0.15]"
            style={{
                background: `linear-gradient(315deg, ${color}, transparent 70%)`,
                clipPath: 'polygon(0 100%, 0 0, 100% 100%)'
            }}
        />
        <div className="absolute inset-0 grid grid-cols-6 grid-rows-4 gap-1 p-2 opacity-[0.25]">
            {[...Array(24)].map((_, i) => (
                <motion.div
                    key={i}
                    animate={{
                        opacity: [0.2, 0.8, 0.2],
                        scale: [1, 1.2, 1]
                    }}
                    transition={{
                        duration: 3 + Math.random() * 4,
                        repeat: Infinity,
                        delay: Math.random() * 5
                    }}
                    className="w-1 h-1 rounded-full bg-current"
                    style={{ color }}
                />
            ))}
        </div>
    </div>
);

const StatCard = ({ label, value, icon: Icon, color }: any) => (
    <div
        className="bg-bg-card p-5 rounded-[1.5rem] shadow-lg shadow-primary/5 border border-border-main group relative overflow-hidden cursor-pointer flex flex-col justify-between h-[150px]"
    >
        <DynamicShapes color={color} />
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center">
            <div className="p-3 rounded-xl transition-all duration-700 group-hover:rotate-[360deg] shadow-lg shadow-current/10 mb-3" style={{ backgroundColor: `${color}25`, color: color }}>
                <Icon size={20} strokeWidth={2.5} />
            </div>
            <div className="space-y-0.5">
                <h4 className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-1">{label}</h4>
                <div className="flex items-baseline justify-center gap-2">
                    <span className="text-3xl font-black text-text-main tracking-tighter">{value}</span>
                </div>
            </div>
        </div>
    </div>
);

export default function Dashboard() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const response = await dashboardService.getStats();
            setStats(response.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();

        const handleRefresh = () => fetchStats();
        window.addEventListener('refresh-data', handleRefresh);
        return () => window.removeEventListener('refresh-data', handleRefresh);
    }, []);


    if (loading) {
        return <div className="p-10 text-center font-black uppercase tracking-widest text-text-muted">Initializing Neural Interface...</div>;
    }



    return (
        <div className="space-y-3 pb-12 transition-colors duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="Platform Revenue" value="$0.00" icon={CreditCard} color="var(--primary)" />
                <StatCard label="Total Owners" value={stats?.totalOwners || 0} icon={Building2} color="#059669" />
                <StatCard label="Total Users" value={stats?.totalDrivers || 0} icon={Users} color="#f59e0b" />
                <StatCard label="Total Bookings" value="0" icon={CalendarCheck} color="#d946ef" />

            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
                <div className="xl:col-span-8 flex flex-col">
                    <div className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h3 className="text-xl font-black text-text-main tracking-tight">Recent Owners</h3>
                            <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest mt-0.5">Latest Facility Partners</p>
                        </div>
                        <Link to="/admin/owners">
                            <Button
                                variant="outline"
                                className="text-xs font-black text-primary border-border-main rounded-xl px-5 py-2.5 h-auto hover:bg-primary/5 group w-full md:w-auto"
                            >
                                View All <ChevronRight size={14} className="ml-2 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </Link>
                    </div>

                    <div className="flex-1">
                        <DataTable
                            data={stats?.recentOwners || []}

                            columns={[
                                {
                                    header: "Owner Profile",
                                    accessor: (owner, _index) => (
                                         <div className="flex items-center gap-4 text-left">
                                              <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center text-xs font-black group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 border border-primary/20">
                                                 {owner.name?.charAt(0)}
                                             </div>
                                             <div>
                                                 <h5 className="text-sm font-black text-text-main leading-tight">{owner.name}</h5>
                                                 <p className="text-[10px] font-bold text-text-muted uppercase tracking-[0.1em] mt-0.5">Registered: {new Date(owner.createdAt).toLocaleDateString()}</p>
                                             </div>

                                         </div>
                                     )
                                },
                                {
                                    header: "Infrastructure",
                                    accessor: (owner, _index) => (
                                        <div className="flex flex-col gap-1.5">
                                            <span className="text-xs font-bold text-text-main uppercase tracking-tighter">{owner._count?.parkings || 0} Assets</span>
                                            <div className="w-32 h-1.5 bg-border-main rounded-full overflow-hidden">
                                                <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min((owner._count?.parkings || 0) * 10, 100)}%` }} className="h-full bg-primary" />
                                            </div>
                                        </div>
                                    )

                                },
                                {
                                    header: "Contact Email",
                                    accessor: (owner, _index) => (
                                         <div>
                                             <p className="text-[10px] font-bold text-text-main lowercase truncate max-w-[150px]">{owner.email}</p>
                                         </div>
                                     )
                                },

                                {
                                    header: "Status",
                                    accessor: (owner, _index) => (
                                         <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border ${owner.status === 'Active' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'}`}>
                                             {owner.status}
                                         </span>
                                     )
                                }
                            ]}
                        />
                    </div>
                </div>

                <div className="xl:col-span-4 flex flex-col">
                    <div className="py-4 flex items-center justify-between">
                        <div>
                            <h3 className="text-xl font-black text-text-main tracking-tight">Recent Users</h3>
                            <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest mt-0.5">Newest Platform Customers</p>
                        </div>


                        <Link to="/admin/users">
                            <Button
                                variant="outline"
                                className="text-xs font-black text-primary border-border-main rounded-xl px-5 py-2.5 h-auto hover:bg-primary/5 group"
                            >
                                View All <ChevronRight size={14} className="ml-2 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </Link>
                    </div>
                    <div className="flex-1 mt-2">
                        <DataTable
                            data={stats?.recentDrivers || []}
                            columns={[
                                {
                                    header: "User",
                                    accessor: (user, _index) => (

                                         <div className="flex items-center gap-3 text-left">
                                             <div className="w-10 h-10 bg-primary/5 text-primary border border-primary/10 rounded-xl flex items-center justify-center text-[11px] font-black">
                                                 {user.name?.charAt(0)}
                                             </div>
                                             <div>
                                                 <h5 className="text-[12px] font-bold text-text-main leading-tight">{user.name}</h5>
                                                 <span className="text-[8px] font-black text-primary uppercase">{new Date(user.createdAt).toLocaleDateString()}</span>
                                             </div>
                                         </div>
                                     )
                                },
                                {
                                    header: "Status",
                                    accessor: (user, _index) => (
                                         <span className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border ${user.status === 'active' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/10' : 'bg-red-500/10 text-red-500 border-red-500/10'}`}>
                                             {user.status}
                                         </span>
                                     ),
                                    textRight: true
                                }
                            ]}
                        />

                    </div>
                </div>
            </div>

            {/* Quick Action Hub - Slim & High-Density */}
            <div className="pt-2">
                <div className="bg-bg-card p-4 rounded-2xl border border-border-main shadow-md shadow-primary/5 relative overflow-hidden group">
                    {/* Subtle Geometric Background Pattern */}
                    <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
                        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(var(--primary) 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                    </div>

                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-1 h-6 bg-primary rounded-full" />
                            <div>
                                <h3 className="text-sm font-black text-text-main tracking-tight uppercase">Quick Actions</h3>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2 w-full md:w-auto">
                            <Button
                                className="flex-1 md:flex-none bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 px-4 py-2.5 h-auto rounded-xl flex items-center justify-center gap-2 group transition-all"
                            >
                                <UserPlus size={14} className="group-hover:scale-110 transition-transform" />
                                <span className="text-[9px] font-black uppercase tracking-widest">Create New User</span>
                            </Button>

                            <Button
                                className="flex-1 md:flex-none bg-primary text-white border-primary shadow-lg shadow-primary/20 hover:bg-primary/90 px-4 py-2.5 h-auto rounded-xl flex items-center justify-center gap-2 group transition-all"
                            >
                                <Building2 size={14} className="group-hover:scale-110 transition-transform" />
                                <span className="text-[9px] font-black uppercase tracking-widest">Register Owner</span>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
