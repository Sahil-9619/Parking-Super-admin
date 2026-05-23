import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import {
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableHead,
    TableCell
} from '@/components/ui/table';
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import { cn } from '@/lib/utils';

export interface Column<T> {
    header: string;
    accessor: (item: T, index: number) => React.ReactNode;
    className?: string;
    textRight?: boolean;
    textCenter?: boolean;
}



interface DataTableProps<T> {
    data: T[];
    columns: Column<T>[];
    onRowClick?: (item: T) => void;
    emptyStateIcon?: LucideIcon;
    emptyStateTitle?: string;
    emptyStateDescription?: string;
    itemsPerPage?: number;
}

export function DataTable<T>({
    data,
    columns,
    onRowClick,
    emptyStateIcon: EmptyIcon,
    emptyStateTitle = "No results found",
    emptyStateDescription = "Try adjusting your search or filters.",
    itemsPerPage
}: DataTableProps<T>) {
    const [currentPage, setCurrentPage] = useState(1);

    // Reset page when data changes (e.g., on filter)
    useMemo(() => {
        setCurrentPage(1);
    }, [data.length]);

    const totalPages = itemsPerPage ? Math.ceil(data.length / itemsPerPage) : 1;
    const paginatedData = itemsPerPage 
        ? data.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
        : data;

    return (
        <div className="space-y-4">
            <div className="overflow-hidden rounded-xl border border-border-main/50 bg-bg-card/30 backdrop-blur-md shadow-2xl shadow-primary/5">
                <Table className="table-fixed w-full">
                    <TableHeader className="bg-bg-card/60 backdrop-blur-lg">
                        <TableRow className="hover:bg-transparent border-b border-border-main/40">
                            {columns.map((col, i) => (
                                <TableHead
                                    key={i}
                                    className={cn(
                                        "px-6 py-5 text-[11px] font-black text-text-main uppercase tracking-[0.2em] h-auto border-none",
                                        col.textRight && "text-right",
                                        col.textCenter && "text-center",
                                        col.className
                                    )}

                                >
                                    {col.header}
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody className="divide-y divide-border-main/20">
                        <AnimatePresence mode="popLayout">
                            {paginatedData.map((item, rowIdx) => (
                                <motion.tr
                                    key={rowIdx}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.98 }}
                                    transition={{ 
                                        delay: rowIdx * 0.04, 
                                        duration: 0.4,
                                        ease: [0.23, 1, 0.32, 1] 
                                    }}
                                    whileHover={{ 
                                        backgroundColor: 'rgba(var(--primary-rgb), 0.03)',
                                    }}
                                    onClick={() => onRowClick?.(item)}
                                    className={cn(
                                        "transition-all group border-none relative",
                                        onRowClick && "cursor-pointer"
                                    )}
                                >
                                    {columns.map((col, colIdx) => (
                                        <TableCell
                                            key={colIdx}
                                            className={cn(
                                                "px-6 py-6 border-none relative z-10 break-words",
                                                col.textRight && "text-right",
                                                col.textCenter && "text-center",
                                                col.className
                                            )}

                                        >
                                            <motion.div
                                                whileHover={{ scale: 1.01 }}
                                                className="transition-transform duration-300"
                                            >
                                                {col.accessor(item, (currentPage - 1) * (itemsPerPage || 0) + rowIdx)}

                                            </motion.div>
                                        </TableCell>
                                    ))}
                                </motion.tr>

                            ))}
                        </AnimatePresence>
                    </TableBody>
                </Table>

                {data.length === 0 && (
                    <div className="py-24 flex flex-col items-center justify-center text-center bg-white/40 backdrop-blur-sm">
                        {EmptyIcon && (
                            <div className="w-24 h-24 bg-bg-main/50 rounded-3xl flex items-center justify-center text-text-muted/60 mb-6 border border-dashed border-border-main/50 shadow-inner">
                                <EmptyIcon size={40} />
                            </div>
                        )}
                        <h4 className="text-xl font-black text-text-main tracking-tight">{emptyStateTitle}</h4>
                        <p className="text-sm text-text-muted mt-2 max-w-sm font-medium">{emptyStateDescription}</p>
                    </div>
                )}
            </div>

            {/* Pagination Controls */}
            {itemsPerPage && data.length > 0 && (
                <div className="flex items-center justify-between px-2 py-4 border-t border-border-main/50">
                    <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">
                        Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, data.length)} of {data.length} records
                    </p>
                    {totalPages > 1 && (
                        <Pagination className="w-auto mx-0">
                            <PaginationContent>
                                <PaginationItem>
                                    <PaginationPrevious 
                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                        className={`cursor-pointer hover:bg-primary/5 hover:text-primary transition-all rounded-xl text-[10px] font-black uppercase tracking-widest ${currentPage === 1 ? 'opacity-50 pointer-events-none' : ''}`}
                                    />
                                </PaginationItem>
                                
                                {[...Array(totalPages)].map((_, i) => (
                                    <PaginationItem key={i}>
                                        <PaginationLink 
                                            onClick={() => setCurrentPage(i + 1)}
                                            isActive={currentPage === i + 1}
                                            className={`cursor-pointer rounded-xl text-[10px] font-black w-9 h-9 transition-all ${
                                                currentPage === i + 1 
                                                ? 'bg-primary text-white shadow-lg shadow-primary/20 hover:bg-primary/90' 
                                                : 'hover:bg-primary/5 hover:text-primary'
                                            }`}
                                        >
                                            {i + 1}
                                        </PaginationLink>
                                    </PaginationItem>
                                ))}

                                <PaginationItem>
                                    <PaginationNext 
                                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                        className={`cursor-pointer hover:bg-primary/5 hover:text-primary transition-all rounded-xl text-[10px] font-black uppercase tracking-widest ${currentPage === totalPages ? 'opacity-50 pointer-events-none' : ''}`}
                                    />
                                </PaginationItem>
                            </PaginationContent>
                        </Pagination>
                    )}
                </div>
            )}
        </div>
    );
}
