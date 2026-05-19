import api from './api';

export interface Review {
    id: string;
    bookingId: string;
    reviewerId: string;
    targetId: string;
    targetType: 'parking' | 'addon';
    rating: number;
    comment: string | null;
    createdAt: string;
    targetName: string;
    reviewer?: {
        id: string;
        name: string;
        email: string;
        phone: string;
    };
    booking?: {
        id: string;
        startTime: string;
        endTime: string;
    };
}

export interface ReviewResponse {
    success: boolean;
    data: Review[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
    message: string;
}

export const reviewService = {
    getAllReviews: async (params?: { page?: number; limit?: number; search?: string; rating?: string }) => {
        const response = await api.get<ReviewResponse>('/admin/reviews', { params });
        return response.data;
    },

    deleteReview: async (id: string) => {
        const response = await api.delete<{ success: boolean; message: string }>(`/admin/reviews/${id}`);
        return response.data;
    },
};
