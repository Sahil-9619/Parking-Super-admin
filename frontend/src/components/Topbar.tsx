import { Search, Bell, User } from 'lucide-react';

export default function Topbar() {
    return (
        <div className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-40">

            {/* Page Title Section */}
            <div className="flex items-center gap-4">
                <div className="bg-slate-100 p-2.5 px-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
                    <div className="w-1.5 h-6 bg-primary rounded-full"></div>
                    <span className="text-sm font-black text-slate-900 tracking-widest uppercase">Dashboard</span>
                </div>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-xl mx-8">
                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Search size={18} className="text-slate-400 group-focus-within:text-primary transition-colors" />
                    </div>
                    <input
                        type="text"
                        className="w-full pl-11 pr-4 py-2.5 bg-slate-100/50 border border-slate-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all outline-none text-sm font-medium placeholder:text-slate-400"
                        placeholder="Search license plate, ticket ID..."
                    />
                </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-6">
                {/* Notifications */}
                <button className="relative p-2.5 bg-slate-100/50 border border-slate-200 rounded-xl text-slate-500 hover:text-primary hover:bg-white hover:border-primary transition-all group">
                    <Bell size={20} />
                    <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 border-2 border-white rounded-full"></span>
                </button>

                {/* Profile */}
                <div className="flex items-center gap-3 pl-6 border-l border-slate-200">
                    <div className="text-right hidden sm:block">
                        <h4 className="text-sm font-bold text-slate-900 leading-none">Admin User</h4>
                        <p className="text-[11px] text-slate-400 font-bold uppercase mt-1">Facility Mgr</p>
                    </div>
                    <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center text-white shadow-lg overflow-hidden border-2 border-white">
                        <User size={20} />
                    </div>
                </div>
            </div>
        </div>
    );
}
