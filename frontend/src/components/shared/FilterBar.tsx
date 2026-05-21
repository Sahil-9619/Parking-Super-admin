import { Search, ChevronDown, Check, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "./dropdown-menu";
import { Button } from "../ui/button";

interface FilterOption {
    label: string;
    value: string;
}

interface FilterBarProps {
    searchQuery: string;
    onSearchChange: (value: string) => void;
    searchPlaceholder?: string;
    filterValue: string;
    onFilterChange: (value: string) => void;
    filterOptions: FilterOption[];
    filterPlaceholder?: string;
    secondFilterValue?: string;
    onSecondFilterChange?: (value: string) => void;
    secondFilterOptions?: FilterOption[];
    secondFilterPlaceholder?: string;
}

export function FilterBar({
    searchQuery,
    onSearchChange,
    searchPlaceholder = "Search...",
    filterValue,
    onFilterChange,
    filterOptions,
    filterPlaceholder = "All Status",
    secondFilterValue,
    onSecondFilterChange,
    secondFilterOptions,
    secondFilterPlaceholder = "All Types"
}: FilterBarProps) {
    const selectedLabel = filterOptions.find(opt => opt.value === filterValue)?.label || filterPlaceholder;
    const secondSelectedLabel = secondFilterOptions?.find(opt => opt.value === secondFilterValue)?.label || secondFilterPlaceholder;

    const hasActiveFilters = Boolean(searchQuery || filterValue || secondFilterValue);

    const handleClearFilters = () => {
        onSearchChange('');
        onFilterChange('');
        if (onSecondFilterChange) {
            onSecondFilterChange('');
        }
    };

    return (
        <div className="bg-bg-card p-3 rounded-2xl border border-border-main flex flex-col md:flex-row gap-3 items-center shadow-sm ring-1 ring-gray-900/5 transition-colors duration-300 w-full">
            {/* Search Input */}
            <div className="relative flex-1 group w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted transition-colors group-focus-within:text-primary z-10" size={16} />
                <Input
                    placeholder={searchPlaceholder}
                    className="pl-10 py-5 rounded-xl border-border-main bg-bg-main focus-visible:ring-primary/10 text-sm font-medium placeholder:text-text-muted text-text-main"
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                />
            </div>

            {/* shadcn Dropdown Filter */}
            <div className="w-full md:w-auto">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="outline"
                            className="w-full md:w-auto bg-bg-main border border-border-main rounded-xl px-4 py-2.5 h-auto text-sm font-black text-text-main hover:bg-bg-card hover:text-text-main transition-all justify-between min-w-full md:min-w-[180px] group"
                        >
                            <span className="truncate">{selectedLabel}</span>
                            <ChevronDown size={14} className="text-text-main opacity-50 group-hover:opacity-100 transition-opacity ml-2" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        align="end"
                        className="w-[180px] bg-bg-card border border-border-main rounded-xl shadow-xl p-1 animate-in fade-in-0 zoom-in-95"
                    >
                        <DropdownMenuItem
                            onClick={() => onFilterChange("")}
                            className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-widest cursor-pointer transition-colors ${!filterValue ? 'bg-primary/10 text-primary' : 'text-text-muted hover:bg-bg-main hover:text-text-main'}`}
                        >
                            {filterPlaceholder}
                            {!filterValue && <Check size={12} />}
                        </DropdownMenuItem>
                        {filterOptions.map((option) => (
                            <DropdownMenuItem
                                key={option.value}
                                onClick={() => onFilterChange(option.value)}
                                className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-widest cursor-pointer transition-colors mt-1 ${filterValue === option.value ? 'bg-primary/10 text-primary' : 'text-text-muted hover:bg-bg-main hover:text-text-main'}`}
                            >
                                {option.label}
                                {filterValue === option.value && <Check size={12} />}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {secondFilterOptions && onSecondFilterChange && (
                <div className="w-full md:w-auto">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="outline"
                                className="w-full md:w-auto bg-bg-main border border-border-main rounded-xl px-4 py-2.5 h-auto text-sm font-black text-text-main hover:bg-bg-card hover:text-text-main transition-all justify-between min-w-full md:min-w-[180px] group"
                            >
                                <span className="truncate">{secondSelectedLabel}</span>
                                <ChevronDown size={14} className="text-text-main opacity-50 group-hover:opacity-100 transition-opacity ml-2" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            align="end"
                            className="w-[180px] bg-bg-card border border-border-main rounded-xl shadow-xl p-1 animate-in fade-in-0 zoom-in-95"
                        >
                            <DropdownMenuItem
                                onClick={() => onSecondFilterChange("")}
                                className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-widest cursor-pointer transition-colors ${!secondFilterValue ? 'bg-primary/10 text-primary' : 'text-text-muted hover:bg-bg-main hover:text-text-main'}`}
                            >
                                {secondFilterPlaceholder}
                                {!secondFilterValue && <Check size={12} />}
                            </DropdownMenuItem>
                            {secondFilterOptions.map((option) => (
                                <DropdownMenuItem
                                    key={option.value}
                                    onClick={() => onSecondFilterChange(option.value)}
                                    className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-widest cursor-pointer transition-colors mt-1 ${secondFilterValue === option.value ? 'bg-primary/10 text-primary' : 'text-text-muted hover:bg-bg-main hover:text-text-main'}`}
                                >
                                    {option.label}
                                    {secondFilterValue === option.value && <Check size={12} />}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            )}

            {/* Clear Filters Button */}
            <div className="w-full md:w-auto">
                <Button
                    variant="ghost"
                    onClick={handleClearFilters}
                    disabled={!hasActiveFilters}
                    className={`w-full md:w-auto rounded-xl px-4 py-2.5 h-auto text-xs font-black uppercase tracking-widest transition-all gap-2 ${
                        hasActiveFilters 
                            ? 'text-red-500 hover:bg-red-500/10 hover:text-red-500' 
                            : 'text-text-muted opacity-50 cursor-not-allowed'
                    }`}
                >
                    <X size={14} />
                    Clear
                </Button>
            </div>
        </div>
    );
}
