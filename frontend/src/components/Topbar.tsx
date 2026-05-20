import ThemeToggle from './ThemeToggle';
import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { menuItems } from './Sidebar';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Topbar() {
    const location = useLocation();
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Dynamically fetch the label from the Sidebar's menu configuration
    const getActivePageLabel = (pathname: string) => {
        for (const group of menuItems) {
            const activeItem = group.items.find(item => item.path === pathname);
            if (activeItem) return activeItem.label;
        }
        return 'Park Adda Admin';
    };

    const handleRefresh = () => {
        setIsRefreshing(true);
        window.dispatchEvent(new CustomEvent('refresh-data'));
        window.setTimeout(() => setIsRefreshing(false), 900);
    };

    return (
        <div className="h-16 bg-bg-card border-b border-border-main flex items-center justify-between px-4 sm:px-8 sticky top-0 z-40 transition-colors duration-300">
            {isRefreshing && (
                <div className="absolute left-0 bottom-0 h-0.5 w-full overflow-hidden bg-primary/10">
                    <div className="h-full w-1/2 animate-[refresh-slide_0.9s_ease-in-out_infinite] bg-primary shadow-lg shadow-primary/40" />
                </div>
            )}

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
                    disabled={isRefreshing}
                    className="rounded-xl h-10 w-10 text-text-muted hover:text-primary hover:bg-primary/10 transition-all group disabled:opacity-100"
                >
                    <RefreshCw
                        size={18}
                        className={`transition-transform duration-500 ${isRefreshing ? 'animate-spin text-primary' : 'group-active:rotate-180'}`}
                    />
                </Button>
                <ThemeToggle />
            </div>
        </div>
    );
}

