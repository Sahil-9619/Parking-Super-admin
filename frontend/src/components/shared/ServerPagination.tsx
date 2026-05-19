import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";

interface ServerPaginationProps {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    onPageChange: (page: number) => void;
}

export function ServerPagination({
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    onPageChange
}: ServerPaginationProps) {
    if (totalItems === 0 || totalPages <= 1) return null;

    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    return (
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 px-4 py-4 bg-bg-card/30 backdrop-blur-md rounded-sm border border-border-main/50 mt-6 shadow-sm">
            <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">
                Showing <span className="text-primary">{startItem}</span> to <span className="text-primary">{endItem}</span> of <span className="text-primary">{totalItems}</span> records
            </p>
            <Pagination className="w-auto mx-0">
                <PaginationContent>
                    <PaginationItem>
                        <PaginationPrevious 
                            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                            className={`cursor-pointer hover:bg-primary/5 hover:text-primary transition-all rounded-xl text-[10px] font-black uppercase tracking-widest ${currentPage === 1 ? 'opacity-50 pointer-events-none' : ''}`}
                        />
                    </PaginationItem>
                    
                    {[...Array(totalPages)].map((_, i) => {
                        const pageNumber = i + 1;
                        // Display logic: show first, last, current, and adjacent pages
                        if (
                            pageNumber === 1 || 
                            pageNumber === totalPages || 
                            (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                        ) {
                            return (
                                <PaginationItem key={i}>
                                    <PaginationLink 
                                        onClick={() => onPageChange(pageNumber)}
                                        isActive={currentPage === pageNumber}
                                        className={`cursor-pointer rounded-xl text-[10px] font-black w-9 h-9 transition-all ${
                                            currentPage === pageNumber 
                                            ? 'bg-primary text-white shadow-lg shadow-primary/20 hover:bg-primary/90' 
                                            : 'hover:bg-primary/5 hover:text-primary'
                                        }`}
                                    >
                                        {pageNumber}
                                    </PaginationLink>
                                </PaginationItem>
                            );
                        }
                        
                        // Show ellipsis
                        if (
                            pageNumber === currentPage - 2 || 
                            pageNumber === currentPage + 2
                        ) {
                            return <PaginationItem key={i}><span className="text-text-muted mx-2">...</span></PaginationItem>;
                        }

                        return null;
                    })}

                    <PaginationItem>
                        <PaginationNext 
                            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                            className={`cursor-pointer hover:bg-primary/5 hover:text-primary transition-all rounded-xl text-[10px] font-black uppercase tracking-widest ${currentPage === totalPages ? 'opacity-50 pointer-events-none' : ''}`}
                        />
                    </PaginationItem>
                </PaginationContent>
            </Pagination>
        </div>
    );
}
