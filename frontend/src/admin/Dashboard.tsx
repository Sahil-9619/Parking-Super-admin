import {
    TrendingUp,
    Users,
    CalendarCheck,
    MapPin,
    ChevronRight,
    Zap,
    Star,
    Wind,
    Shield,
    Accessibility
} from 'lucide-react';
import { motion } from 'framer-motion';

const stats = [
    {
        label: "TODAY'S REVENUE",
        value: "$6,420.50",
        trend: "+8.2%",
        icon: TrendingUp,
        color: "#35C293",
        size: "large"
    },
    {
        label: "TOTAL USERS",
        value: "412",
        icon: Users,
        color: "#235197",
        size: "small"
    },
    {
        label: "TOTAL BOOKINGS",
        value: "3,500",
        icon: CalendarCheck,
        color: "#d946ef",
        size: "small"
    },
    {
        label: "TOTAL PARKING AREAS",
        value: "2",
        icon: MapPin,
        color: "#235197",
        size: "compact"
    },
    {
        label: "TOTAL SUBSCRIBERS",
        value: "2",
        icon: Star,
        color: "#f59e0b",
        size: "compact"
    },
];

const reservations = [
    { id: '#RES-8921', name: 'Maria Garcia', spot: 'Zone A • 14', duration: '10:00 AM - 02:00 PM', hours: '4 hours', status: 'Active', color: 'bg-[#35C293]' },
    { id: '#RES-8922', name: 'James Wilson', spot: 'Zone B • 05', duration: '11:30 AM - 05:30 PM', hours: '6 hours', status: 'Active', color: 'bg-[#35C293]' },
    { id: '#RES-8923', name: 'Sarah Connor', spot: 'VIP • 01', duration: '01:00 PM - 03:00 PM', hours: '2 hours', status: 'Upcoming', color: 'bg-[#f59e0b]' },
    { id: '#RES-8924', name: 'Alex Chen', spot: 'Zone C • 22', duration: '02:15 PM - 10:00 PM', hours: '7 hours 45 mins', status: 'Upcoming', color: 'bg-[#f59e0b]' },
    { id: '#RES-8920', name: 'Priya Patel', spot: 'Zone A • 08', duration: '08:00 AM - 10:00 AM', hours: '2 hours', status: 'Completed', color: 'bg-slate-400' },
];

const facilities = [
    { name: 'EV Charging', desc: '8 Stations Total', status: '3 Available', state: 'Operational', icon: Zap, color: 'text-[#35C293]', bg: 'bg-[#35C293]/10' },
    { name: 'VIP Parking', desc: '12 Premium Spots', status: 'Full', state: '0 Available', icon: Star, color: 'text-[#f59e0b]', bg: 'bg-[#f59e0b]/10' },
    { name: 'Car Wash', desc: 'Level B1', status: 'Open', state: 'Closes at 8 PM', icon: Wind, color: 'text-[#235197]', bg: 'bg-[#235197]/10' },
    { name: '24/7 Security', desc: 'Main Gates & Patrol', status: 'Active', state: '4 Guards', icon: Shield, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { name: 'Accessible Parking', desc: '6 Reserved Spots', status: '2 Available', state: 'Ground Floor', icon: Accessibility, color: 'text-emerald-600', bg: 'bg-emerald-50' },
];

export default function Dashboard() {
    return (
        <div className="space-y-8 pb-12">

            {/* Top Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-12 gap-6">

                {/* Large Stat Card */}
                <motion.div
                    whileHover={{ y: -5 }}
                    className="xl:col-span-5 bg-white p-8 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 flex items-center justify-between group overflow-hidden relative"
                >
                    <div className="relative z-10">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Today's Revenue</h4>
                        <div className="flex items-baseline gap-4">
                            <span className="text-4xl font-black text-slate-900">$6,420.50</span>
                            <span className="text-sm font-bold text-secondary flex items-center gap-1">+8.2%</span>
                        </div>
                    </div>
                    <div className="relative z-10 w-24 h-24">
                        <TrendingUp size={64} className="text-secondary opacity-20 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
                </motion.div>

                {/* Small Stat Cards */}
                <div className="xl:col-span-4 grid grid-cols-2 gap-6">
                    {stats.slice(1, 3).map((stat, i) => (
                        <motion.div
                            key={i}
                            whileHover={{ y: -5 }}
                            className="bg-white p-6 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 group relative overflow-hidden"
                        >
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">{stat.label}</h4>
                            <div className="flex items-center justify-between">
                                <span className="text-3xl font-black text-slate-900">{stat.value}</span>
                                <div className="p-3 rounded-2xl" style={{ backgroundColor: `${stat.color}15`, color: stat.color }}>
                                    <stat.icon size={24} />
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Compact Stat Cards */}
                <div className="xl:col-span-3 grid grid-rows-2 gap-6">
                    {stats.slice(3).map((stat, i) => (
                        <motion.div
                            key={i}
                            whileHover={{ x: 5 }}
                            className="bg-white p-5 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 flex items-center justify-between px-8 group"
                        >
                            <div>
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</h4>
                                <span className="text-2xl font-black text-slate-900">{stat.value}</span>
                            </div>
                            <div className="p-3 rounded-2xl" style={{ backgroundColor: `${stat.color}15`, color: stat.color }}>
                                <stat.icon size={20} />
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Tables & Lists Section */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">

                {/* Recent Reservations Table */}
                <div className="xl:col-span-8 bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/40 border border-slate-100 overflow-hidden flex flex-col">
                    <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                        <div>
                            <h3 className="text-xl font-black text-slate-900 tracking-tight">Recent Reservations</h3>
                            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mt-1">Live updates from all zones</p>
                        </div>
                        <button className="text-xs font-black text-primary hover:bg-primary/5 px-5 py-2.5 rounded-xl transition-all border border-slate-200 flex items-center gap-2 group">
                            View All <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50/50">
                                    <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Customer</th>
                                    <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Parking Spot</th>
                                    <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Duration</th>
                                    <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {reservations.map((res, i) => (
                                    <tr key={i} className="hover:bg-slate-50/40 transition-colors group">
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-11 h-11 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 group-hover:scale-105 transition-transform">
                                                    <Users size={20} />
                                                </div>
                                                <div>
                                                    <h5 className="text-sm font-bold text-slate-900">{res.name}</h5>
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{res.id}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className="px-4 py-1.5 bg-slate-100 text-slate-700 text-[11px] font-bold rounded-full border border-slate-200">
                                                {res.spot}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div>
                                                <p className="text-sm font-bold text-slate-700">{res.duration}</p>
                                                <p className="text-[10px] font-medium text-slate-400">{res.hours}</p>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className={`px-4 py-1.5 ${res.color} text-white text-[10px] font-black uppercase tracking-widest rounded-lg shadow-lg shadow-opacity-20`}>
                                                {res.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Facilities Overview List */}
                <div className="xl:col-span-4 bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/40 border border-slate-100 overflow-hidden flex flex-col">
                    <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                        <h3 className="text-xl font-black text-slate-900 tracking-tight">Facilities Overview</h3>
                        <button className="text-[10px] font-black text-slate-400 hover:text-primary transition-colors tracking-widest uppercase">Manage</button>
                    </div>
                    <div className="flex-1 p-6 space-y-4">
                        {facilities.map((fac, i) => (
                            <motion.div
                                key={i}
                                whileHover={{ scale: 1.02 }}
                                className="flex items-center justify-between p-4 rounded-2xl bg-slate-50/50 border border-slate-100 group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 ${fac.bg} ${fac.color} rounded-2xl flex items-center justify-center transition-transform group-hover:rotate-12`}>
                                        <fac.icon size={22} />
                                    </div>
                                    <div>
                                        <h5 className="text-sm font-bold text-slate-900">{fac.name}</h5>
                                        <p className="text-[10px] font-medium text-slate-400 mt-0.5">{fac.desc}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className={`text-xs font-black uppercase tracking-widest ${fac.state === 'Full' ? 'text-red-500' : fac.color}`}>
                                        {fac.status}
                                    </span>
                                    <p className="text-[9px] font-bold text-slate-300 uppercase tracking-wider mt-0.5">{fac.state}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                    <div className="p-8 pt-0">
                        <button className="w-full py-4 bg-slate-900 text-white font-black rounded-2xl shadow-xl shadow-slate-200 hover:bg-black transition-all text-xs uppercase tracking-widest">
                            View Detailed Analytics
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
