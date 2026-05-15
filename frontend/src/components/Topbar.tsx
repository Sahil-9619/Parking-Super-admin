import ThemeToggle from './ThemeToggle';
import { useLocation } from 'react-router-dom';
import { menuItems } from './Sidebar';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Topbar() {
    const location = useLocation();

    // Dynamically fetch the label from the Sidebar's menu configuration
    const getActivePageLabel = (pathname: string) => {
        for (const group of menuItems) {
            const activeItem = group.items.find(item => item.path === pathname);
            if (activeItem) return activeItem.label;
        }
        return 'Park Adda Admin';
    };

    const handleRefresh = () => {
        // Dispatch a custom event that pages can listen to for refreshing data
        window.dispatchEvent(new CustomEvent('refresh-data'));
    };

    return (
        <div className="h-16 bg-bg-card border-b border-border-main flex items-center justify-between px-4 sm:px-8 sticky top-0 z-40 transition-colors duration-300">

            {/* Page Title Section - Hidden on mobile */}
            <div className="flex items-center gap-4 min-w-[200px]">
                <div className="bg-bg-main p-2.5 px-5 rounded-xl border border-border-main shadow-sm flex items-center gap-3">
                    <div className="w-1.5 h-6 bg-primary rounded-full"></div>
                    <span className="text-[10px] font-black text-text-main tracking-widest uppercase truncate">
                        {getActivePageLabel(location.pathname)}
                    </span>
                </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-2 sm:gap-4">
                <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={handleRefresh}
                    className="rounded-xl h-10 w-10 text-text-muted hover:text-primary hover:bg-primary/10 transition-all group"
                >
                    <RefreshCw size={18} className="group-active:rotate-180 transition-transform duration-500" />
                </Button>
                <ThemeToggle />
            </div>
        </div>
    );
}

