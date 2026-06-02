import api from './api';

export interface DashboardOwner {
    id: string;
    name: string;
    email: string;
    status: string;
    createdAt: string;
    ownerProfile?: { verificationStatus?: string };
    _count?: { parkings: number };
}

export interface DashboardDriver {
    id: string;
    name: string;
    status: string;
    createdAt: string;
}

export interface DashboardBooking {
    id: string;
    status: string;
    grossAmount: string | number;
    startTime: string;
    createdAt: string;
    parking?: { name: string };
    user?: { name: string };
}

export interface DashboardStats {
    totalOwners: number;
    totalDrivers: number;
    totalBookings: number;
    activeParkings: number;
    pendingParkings: number;
    pendingKycOwners: number;
    openDisputes: number;
    pendingPayouts: number;
    totalRevenue: number;
    totalGrossBooked: number;
    recentOwners: DashboardOwner[];
    recentDrivers: DashboardDriver[];
    recentBookings: DashboardBooking[];
}

export const dashboardService = {
    getStats: async (): Promise<{ status: string; data: DashboardStats }> => {
        try {
            const response = await api.get('/admin/dashboard/stats');
            return response.data;
        } catch (error: any) {
            throw error.response?.data || { message: 'Failed to fetch dashboard stats' };
        }
    },
};
