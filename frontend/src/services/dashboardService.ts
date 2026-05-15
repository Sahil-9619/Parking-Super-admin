import api from './api';

export interface DashboardStats {
    totalOwners: number;
    totalDrivers: number;
    recentOwners: any[];
    recentDrivers: any[];
}

export const dashboardService = {
    getStats: async () => {
        try {
            const response = await api.get('/admin/dashboard/stats');
            return response.data;
        } catch (error: any) {
            throw error.response?.data || { message: 'Failed to fetch dashboard stats' };
        }
    }
};
