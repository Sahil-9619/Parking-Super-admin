import { useState, useEffect } from 'react';
import {
    Star,
    Trash2,
    MessageSquare,
    Sliders,
    Search,
    Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ConfirmDelete } from '@/components/shared/ConfirmDelete';
import { DataTable } from '@/components/shared/DataTable';
import { ServerPagination } from '@/components/shared/ServerPagination';
import { reviewService, type Review } from '@/services/reviewService';
import toast from 'react-hot-toast';
import { DetailsModal } from '@/components/shared/DetailsModal';

const ReviewComponent = () => {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [ratingFilter, setRatingFilter] = useState<number | null>(null);
    const [page, setPage] = useState(1);
    const [meta, setMeta] = useState<any>(null);

    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [reviewToDelete, setReviewToDelete] = useState<Review | null>(null);

    const [isViewOpen, setIsViewOpen] = useState(false);
    const [selectedReview, setSelectedReview] = useState<Review | null>(null);

    const fetchReviews = async () => {
        try {
            setLoading(true);
            const params: any = {
                page,
                limit: 10
            };
            if (searchQuery) params.search = searchQuery;
            if (ratingFilter !== null) params.rating = ratingFilter.toString();

            const response = await reviewService.getAllReviews(params);
            setReviews(response.data || []);
            setMeta(response.meta || null);
        } catch (error) {
            console.error('Failed to fetch reviews:', error);
            toast.error('Error fetching reviews data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReviews();
        const handleRefresh = () => fetchReviews();
        window.addEventListener('refresh-data', handleRefresh);
        return () => window.removeEventListener('refresh-data', handleRefresh);
    }, [page, searchQuery, ratingFilter]);

    useEffect(() => {
        setPage(1);
    }, [searchQuery, ratingFilter]);

    const handleDeleteReview = async () => {
        if (!reviewToDelete) return;
        try {
            await reviewService.deleteReview(reviewToDelete.id);
            toast.success('Review moderated and deleted successfully');
            fetchReviews();
            setIsDeleteOpen(false);
            setReviewToDelete(null);
        } catch (error: any) {
            toast.error('Failed to delete review');
        }
    };

    const formatIST = (dateStr: string) => {
        return new Date(dateStr).toLocaleString('en-IN', {
            timeZone: 'Asia/Kolkata',
            hour: '2-digit',
            minute: '2-digit',
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    const handleOpenView = (review: Review) => {
        setSelectedReview(review);
        setIsViewOpen(true);
    };

    if (loading && reviews.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-black text-text-main tracking-tighter">User Reviews</h2>
                    <p className="text-[11px] text-text-muted font-bold uppercase tracking-[0.2em] mt-1">Audit, moderate, and analyze driver ratings and comments</p>
                </div>
            </div>
            {/* Filter controls */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-card p-4 rounded-xl border border-border-main/50 shadow-sm">
                <div className="relative w-full md:w-96 group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors">
                        <Search size={14} />
                    </div>
                    <Input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by comment, driver name, or spot..."
                        className="w-full h-11 bg-bg-main/50 border-border-main/60 rounded-xl pl-11 pr-4 text-xs font-bold text-text-main focus-visible:ring-primary/20 transition-all"
                    />
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 scrollbar-hide">
                    <span className="text-[10px] font-black text-text-muted uppercase tracking-wider whitespace-nowrap flex items-center gap-1.5 mr-2">
                        <Sliders size={12} className="text-primary" /> Filter Score:
                    </span>
                    <button
                        onClick={() => setRatingFilter(null)}
                        className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all whitespace-nowrap ${
                            ratingFilter === null ? "bg-primary text-white border-primary shadow-md shadow-primary/20" : "bg-bg-main text-text-muted border-border-main/50 hover:text-text-main"
                        }`}
                    >
                        All Scores
                    </button>
                    {[5, 4, 3, 2, 1].map((stars) => (
                        <button
                            key={stars}
                            onClick={() => setRatingFilter(stars)}
                            className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all whitespace-nowrap flex items-center gap-1 ${
                                ratingFilter === stars ? "bg-primary text-white border-primary shadow-md shadow-primary/20" : "bg-bg-main text-text-muted border-border-main/50 hover:text-text-main"
                            }`}
                        >
                            {stars} <Star size={10} className={ratingFilter === stars ? "fill-white text-white" : "fill-text-muted/20"} />
                        </button>
                    ))}
                </div>
            </div>

            {/* Grid of Review Cards */}
            {reviews.length > 0 ? (
                <>
                    <DataTable
                        data={reviews}
                    columns={[
                        {
                            header: 'Sr No',
                            textCenter: true,
                            accessor: (_, index) => (
                                <span className="text-[10px] font-black text-text-muted font-mono">
                                    {String((page - 1) * 10 + index + 1).padStart(2, '0')}
                                </span>
                            )
                        },
                        {
                            header: 'Driver / Reviewer',
                            accessor: (review) => (
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary border border-primary/20 flex items-center justify-center text-xs font-black shrink-0">
                                        {review.reviewer?.name?.charAt(0).toUpperCase() || 'D'}
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                        <span className="text-xs font-black text-text-main leading-tight truncate">
                                            {review.reviewer?.name || 'Anonymous Driver'}
                                        </span>
                                        <span className="text-[9px] text-text-muted font-bold truncate">
                                            {review.reviewer?.email || 'N/A'}
                                        </span>
                                    </div>
                                </div>
                            )
                        },
                        {
                            header: 'Rating Score',
                            textCenter: true,
                            accessor: (review) => (
                                <div className="flex flex-col items-center gap-0.5">
                                    <div className="flex items-center gap-0.5">
                                        {Array.from({ length: 5 }).map((_, idx) => (
                                            <Star
                                                key={idx}
                                                size={10}
                                                className={`${
                                                    idx < review.rating ? "text-amber-400 fill-amber-400" : "text-text-muted/20"
                                                }`}
                                            />
                                        ))}
                                    </div>
                                    <span className="text-[8px] font-black text-text-muted font-mono leading-none">
                                        {review.rating}.0 / 5.0
                                    </span>
                                </div>
                            )
                        },
                        {
                            header: 'Target Facility',
                            accessor: (review) => (
                                <div className="flex flex-col gap-0.5">
                                    <span className="text-xs font-black text-text-main leading-tight">
                                        {review.targetName}
                                    </span>
                                    <span className="inline-flex max-w-fit px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-widest bg-primary/10 text-primary border border-primary/15 scale-95 origin-left mt-0.5">
                                        {review.targetType}
                                    </span>
                                </div>
                            )
                        },
                        {
                            header: 'Customer Feedback',
                            accessor: (review) => (
                                <p className="text-[11px] font-semibold text-text-muted leading-relaxed italic max-w-sm line-clamp-2">
                                    "{review.comment || 'No comment provided.'}"
                                </p>
                            )
                        },
                        {
                            header: 'Date Submitted',
                            textCenter: true,
                            accessor: (review) => (
                                <span className="text-[10px] font-bold text-text-muted whitespace-nowrap">
                                    {formatIST(review.createdAt)}
                                </span>
                            )
                        },
                        {
                            header: 'Actions',
                            textRight: true,
                            accessor: (review) => (
                                <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                                    <Button
                                        size="sm"
                                        onClick={() => handleOpenView(review)}
                                        className="bg-bg-main/50 text-text-main border-border-main shadow-sm hover:bg-bg-main hover:text-primary text-[9px] font-black uppercase tracking-widest px-2.5 py-1.5 h-auto rounded-lg flex items-center gap-1.5"
                                    >
                                        <Eye size={11} /> View
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => { setReviewToDelete(review); setIsDeleteOpen(true); }}
                                        className="rounded-xl h-8 w-8 text-text-muted hover:text-red-500 hover:bg-red-500/10 transition-colors"
                                    >
                                        <Trash2 size={14} />
                                    </Button>
                                </div>
                            )
                        }
                    ]}
                />
                {meta && (
                    <ServerPagination
                        currentPage={page}
                        totalPages={meta.totalPages}
                        totalItems={meta.total}
                        itemsPerPage={10}
                        onPageChange={setPage}
                    />
                )}
                </>
            ) : (
                <div className="p-16 bg-card border border-dashed border-border-main/60 rounded-[2.5rem] flex flex-col items-center justify-center text-center max-w-xl mx-auto shadow-sm">
                    <MessageSquare size={48} className="text-text-muted/40 mb-4" />
                    <h4 className="text-md font-black text-text-main uppercase tracking-widest">No matching reviews</h4>
                    <p className="text-xs font-bold text-text-muted mt-2">Adjust your score filter or search query to locate reviews.</p>
                </div>
            )}

            {/* Moderation confirmation */}
            <ConfirmDelete
                isOpen={isDeleteOpen}
                onOpenChange={setIsDeleteOpen}
                onConfirm={handleDeleteReview}
                title="Moderate User Review"
                description={
                    <span>
                        Are you sure you want to permanently delete this review submitted by <span className="font-black text-red-500">{reviewToDelete?.reviewer?.name}</span>? 
                        This action will immediately remove the feedback comment card from public pages, 
                        and recalculate the average score metrics for this parking hub.
                    </span>
                }
            />

            <DetailsModal 
                isOpen={isViewOpen} 
                onClose={() => setIsViewOpen(false)} 
                title="Review" 
                data={selectedReview} 
            />
        </div>
    );
};

export default ReviewComponent;
