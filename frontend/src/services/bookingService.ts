import api from './api';

export interface Booking {
    id: string;
    userId: string;
    parkingId: string;
    vehicleType: 'bike' | 'car' | 'commercial';
    startTime: string;
    endTime: string;
    actualEnd: string | null;
    grossAmount: string;
    commission: string;
    ownerShare: string;
    overstayAmount: string;
    totalCharged: string;
    status: 'confirmed' | 'active' | 'completed' | 'cancelled';
    checkinAt: string | null;
    checkoutAt: string | null;
    qrToken: string;
    createdAt: string;
    updatedAt: string;
    user?: {
        id: string;
        name: string;
        phone: string;
        email: string;
    };
    parking?: {
        id: string;
        name: string;
        address: string;
        parkingType: string;
        ownerId: string;
        user?: {
            name: string;
            phone: string;
        };
    };
    addonBookings?: any[];
    disputes?: any[];
}

export interface BookingResponse {
    success: boolean;
    data: Booking[];
    count: number;
    message: string;
}

export interface SingleBookingResponse {
    success: boolean;
    data: Booking;
    message: string;
}

export interface BookingStatsResponse {
    success: boolean;
    data: {
        counts: {
            total: number;
            confirmed: number;
            active: number;
            completed: number;
            cancelled: number;
        };
        revenue: {
            totalGross: number;
            totalCommission: number;
            totalOwnerShare: number;
        };
    };
    message: string;
}

export const bookingService = {
    getAllBookings: async (params?: { status?: string; vehicleType?: string; parkingId?: string; userId?: string }) => {
        const response = await api.get<BookingResponse>('/admin/bookings', { params });
        return response.data;
    },

    getBookingDetails: async (bookingId: string) => {
        const response = await api.get<SingleBookingResponse>(`/admin/bookings/${bookingId}`);
        return response.data;
    },

    cancelBooking: async (bookingId: string) => {
        const response = await api.put<{ success: boolean; message: string; data: any }>(
            `/admin/bookings/${bookingId}/cancel`
        );
        return response.data;
    },

    getBookingStats: async () => {
        const response = await api.get<BookingStatsResponse>('/admin/bookings/stats');
        return response.data;
    },
};
