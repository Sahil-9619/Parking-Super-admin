import api from './api';

export interface Owner {
    id: string;
    name: string;
    email: string;
    phone: string;
    status: 'active' | 'suspended' | 'banned' | 'pending';
    address?: string;
    createdAt: string;
    updatedAt: string;
    userType?: string;
    walletBalance?: number;

    ownerProfile?: {
        ownerType?: string;
        gstNumber?: string;
        verificationStatus?: string;
        strikeCount?: number;
    };
    parkings?: {
        id: string;
        name: string;
        status?: string;
        avgRating?: number;
    }[];
    _count?: {
        parkings?: number;
    };
}

export interface OnboardOwnerPayload {
    name: string;
    email: string;
    phone: string;
    password?: string;
    ownerType: string;
    gstNumber?: string;
}

export const ownerService = {
    // Get all owners
    getAllOwners: async () => {
        try {
            const response = await api.get('/admin/owners');
            return response.data;
        } catch (error: any) {
            throw error.response?.data || { message: 'Failed to fetch owners' };
        }
    },

    // Get owner by ID
    getOwnerById: async (id: string) => {
        try {
            const response = await api.get(`/admin/owners/${id}`);
            return response.data;
        } catch (error: any) {
            throw error.response?.data || { message: 'Failed to fetch owner' };
        }
    },


    // Onboard owner
    onboardOwner: async (data: OnboardOwnerPayload) => {
        try {
            const response = await api.post('/admin/owners/onboard', data);
            return response.data;
        } catch (error: any) {
            throw error.response?.data || { message: 'Failed to onboard owner' };
        }
    },

    // Disable owner
    disableOwner: async (id: string) => {
        try {
            const response = await api.put(`/admin/owners/${id}/disable`);
            return response.data;
        } catch (error: any) {
            throw error.response?.data || { message: 'Failed to disable owner' };
        }
    },

    // Enable owner
    enableOwner: async (id: string) => {
        try {
            const response = await api.put(`/admin/owners/${id}/enable`);
            return response.data;
        } catch (error: any) {
            throw error.response?.data || { message: 'Failed to enable owner' };
        }
    },

    // Approve KYC
    approveKyc: async (id: string, status: 'approved' | 'rejected') => {
        try {
            const response = await api.put(`/admin/owners/kyc/${id}/approve`, { status });
            return response.data;
        } catch (error: any) {
            throw error.response?.data || { message: 'Failed to update KYC status' };
        }
    },

    // Update owner profile
    updateOwner: async (id: string, data: any) => {
        try {
            const response = await api.put(`/admin/owners/${id}`, data);
            return response.data;
        } catch (error: any) {
            throw error.response?.data || { message: 'Failed to update owner profile' };
        }
    },

    // Delete owner account
    deleteOwner: async (id: string) => {
        try {
            const response = await api.delete(`/admin/owners/${id}`);
            return response.data;
        } catch (error: any) {
            throw error.response?.data || { message: 'Failed to delete owner account' };
        }
    }
};
