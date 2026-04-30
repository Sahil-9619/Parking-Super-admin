import { useState } from 'react';
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/authService";


export default function AdminLayout() {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const navigate = useNavigate();

    const handleLogout = () => {
        authService.logout();
        navigate("/");
    };

    return (
        <div className="flex h-screen bg-[#f1f5f9] overflow-hidden font-['Outfit']">
            {/* Sidebar */}
            <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed}
                onLogout={handleLogout} />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Topbar */}
                <Topbar />

                {/* Dashboard / Child Pages Content */}
                <main className="flex-1 overflow-y-auto p-8 bg-[#f1f5f9] scrollbar-hide">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}