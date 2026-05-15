import api from './api';

export interface User {
    id: string;
    name: string;
    email: string;
    phone: string;
    status: 'active' | 'suspended' | 'banned';
    userType: string;
    walletBalance?: number;
    createdAt: string;
    updatedAt: string;
}

export const userService = {
    // Get all users (drivers)
    getAllDrivers: async () => {
        try {
            const response = await api.get('/admin/users', {
                params: { userType: 'driver' }
            });
            return response.data;
        } catch (error: any) {
            throw error.response?.data || { message: 'Failed to fetch drivers' };
        }
    },

    // Update user status
    updateUserStatus: async (id: string, status: string) => {
        try {
            const response = await api.put(`/admin/users/${id}/status`, { status });
            return response.data;
        } catch (error: any) {
            throw error.response?.data || { message: 'Failed to update user status' };
        }
    },

    // Update user profile
    updateUser: async (id: string, data: any) => {
        try {
            const response = await api.put(`/admin/users/${id}`, data);
            return response.data;
        } catch (error: any) {
            throw error.response?.data || { message: 'Failed to update user profile' };
        }
    },

    // Delete user account
    deleteUser: async (id: string) => {
        try {
            const response = await api.delete(`/admin/users/${id}`);
            return response.data;
        } catch (error: any) {
            throw error.response?.data || { message: 'Failed to delete user account' };
        }
    }
};

