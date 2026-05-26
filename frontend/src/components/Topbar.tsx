import ThemeToggle from './ThemeToggle';
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { menuItems } from './Sidebar';
import { RefreshCw, Maximize, Minimize, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TopbarProps {
    onToggleMobileMenu?: () => void;
}

export default function Topbar({ onToggleMobileMenu }: TopbarProps) {
    const location = useLocation();
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch((err) => {
                console.error(`Error attempting to enable fullscreen mode: ${err.message}`);
            });
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    };

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

            {/* Left Actions / Mobile Burger Menu */}
            <div className="flex items-center gap-3">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onToggleMobileMenu}
                    className="md:hidden rounded-xl h-10 w-10 text-text-muted hover:text-primary hover:bg-primary/10 transition-all shrink-0"
                >
                    <Menu size={20} />
                </Button>

                {/* Page Title Section */}
                <div className="hidden sm:flex items-center gap-4">
                    <div className="bg-bg-main p-2.5 px-5 rounded-xl border border-border-main shadow-sm flex items-center gap-3">
                        <div className="w-1.5 h-6 bg-primary rounded-full"></div>
                        <span className="text-[10px] font-black text-text-main tracking-widest uppercase truncate">
                            {getActivePageLabel(location.pathname)}
                        </span>
                    </div>
                </div>
                {/* On extra small screens (below sm), just show a simplified version */}
                <div className="sm:hidden flex items-center gap-2">
                    <span className="text-xs font-black text-text-main uppercase tracking-wider truncate max-w-[120px]">
                        {getActivePageLabel(location.pathname)}
                    </span>
                </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-2 sm:gap-4">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleFullscreen}
                    className="rounded-xl h-10 w-10 text-text-muted hover:text-primary hover:bg-primary/10 transition-all"
                >
                    {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
                </Button>
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

