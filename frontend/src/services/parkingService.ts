import api from './api';

export interface ParkingSlot {
    id: string;
    parkingId: string;
    vehicleType: string;
    totalSlots: number;
    availableSlots: number;
}

export interface ParkingArea {
    id: string;
    ownerId: string;
    name: string;
    parkingType: string;
    address: string;
    latitude: number;
    longitude: number;
    photos: string[];
    openTime: string;
    closeTime: string;
    is24hr: boolean;
    status: 'pending' | 'active' | 'paused' | 'banned';
    avgRating: number;
    addonsEnabled: string[];
    isFull: boolean;
    isClosed: boolean;
    reopenAt: string | null;
    ownershipType: 'owned' | 'rental';
    propertyPaper: string | null;
    leaseAgreement: string | null;
    parkingAreaPics: string[];
    kycStatus: 'pending' | 'approved' | 'rejected';
    createdAt: string;
    updatedAt: string;
    user?: {
        name: string;
        email: string;
        phone: string;
    };
    slots: ParkingSlot[];
}

export interface PaginationMeta {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface ParkingAreaResponse {
    status: string;
    results: number;
    data: ParkingArea[];
    meta: PaginationMeta;
}

export const parkingService = {
    getAllParkings: async (params?: { page?: number; limit?: number; search?: string; status?: string; parkingType?: string; kycStatus?: string }) => {
        const response = await api.get<ParkingAreaResponse>('/admin/parkings', { params });
        return response.data;
    },

    updateParkingStatus: async (parkingId: string, status: string) => {
        const response = await api.put<{ status: string; message: string; data: ParkingArea }>(
            `/admin/parkings/${parkingId}/status`,
            { status }
        );
        return response.data;
    },

    updateParkingKycStatus: async (parkingId: string, status: 'approved' | 'rejected') => {
        const response = await api.put<{ status: string; message: string; data: ParkingArea }>(
            `/admin/parkings/${parkingId}/kyc`,
            { status }
        );
        return response.data;
    },

    updateParking: async (parkingId: string, data: Partial<ParkingArea>) => {
        const response = await api.put<{ status: string; message: string; data: ParkingArea }>(
            `/admin/parkings/${parkingId}`,
            data
        );
        return response.data;
    },

    deleteParking: async (parkingId: string) => {
        const response = await api.delete<{ status: string; message: string }>(
            `/admin/parkings/${parkingId}`
        );
        return response.data;
    }
};
