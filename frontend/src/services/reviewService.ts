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
    count: number;
    message: string;
}

export const reviewService = {
    getAllReviews: async () => {
        const response = await api.get<ReviewResponse>('/admin/reviews');
        return response.data;
    },

    deleteReview: async (id: string) => {
        const response = await api.delete<{ success: boolean; message: string }>(`/admin/reviews/${id}`);
        return response.data;
    },
};
