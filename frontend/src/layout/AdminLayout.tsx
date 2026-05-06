import { useState } from 'react';
import { Outlet, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/authService";
import { LogoutModal } from "../components/shared/LogoutModal";


export default function AdminLayout() {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const [isLogoutOpen, setIsLogoutOpen] = useState(false);

    const handleLogout = () => {
        authService.logout();
        navigate("/");
    };

    return (
        <div className="flex h-screen bg-bg-main overflow-hidden font-['Outfit'] antialiased">
            {/* Sidebar */}
            <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed}
                onLogout={() => setIsLogoutOpen(true)} />
            
            <LogoutModal 
                isOpen={isLogoutOpen}
                onOpenChange={setIsLogoutOpen}
                onConfirm={handleLogout}
            />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                {/* Topbar */}
                <Topbar />

                {/* Dashboard / Child Pages Content */}
                <main className="flex-1 overflow-y-auto p-5 bg-bg-main scrollbar-hide relative">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={location.pathname}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}

                            transition={{ duration: 1, ease: [0.23, 1, 0.32, 1] }}
                            className="w-full"
                        >
                            <Outlet />
                        </motion.div>
                    </AnimatePresence>
                </main>
            </div>
        </div>
    );
}