import { useState, useEffect } from 'react';
import { Outlet, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/authService";
import { LogoutModal } from "../components/shared/LogoutModal";


export default function AdminLayout() {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const [isLogoutOpen, setIsLogoutOpen] = useState(false);

    const handleLogout = () => {
        authService.logout();
        navigate("/");
    };

    // Automatically close the mobile sidebar drawer when switching pages/routes
    useEffect(() => {
        setIsMobileOpen(false);
    }, [location.pathname]);

    return (
        <div className="flex h-screen bg-bg-main overflow-hidden font-['Outfit'] antialiased">
            {/* Desktop Sidebar */}
            <div className="hidden md:flex shrink-0">
                <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed}
                    onLogout={() => setIsLogoutOpen(true)} />
            </div>

            {/* Mobile Sidebar Drawer Overlay */}
            <AnimatePresence>
                {isMobileOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.5 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            onClick={() => setIsMobileOpen(false)}
                            className="fixed inset-0 bg-black z-50 md:hidden"
                        />
                        {/* Drawer Panel */}
                        <motion.div
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed left-0 top-0 bottom-0 w-auto z-50 md:hidden h-screen bg-sidebar-bg flex shrink-0"
                        >
                            <Sidebar 
                                isCollapsed={false} 
                                setIsCollapsed={() => {}} 
                                onLogout={() => { setIsLogoutOpen(true); setIsMobileOpen(false); }} 
                            />
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
            
            <LogoutModal 
                isOpen={isLogoutOpen}
                onOpenChange={setIsLogoutOpen}
                onConfirm={handleLogout}
            />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                {/* Topbar */}
                <Topbar onToggleMobileMenu={() => setIsMobileOpen(true)} />

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