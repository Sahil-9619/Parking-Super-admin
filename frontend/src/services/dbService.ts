import api from './api';

export interface AddonBooking {
  id: string;
  bookingId: string;
  customAddonId: string | null;
  addonName: string;
  serviceLevel: string | null;
  amount: string;
  commission: string;
  ownerShare: string;
  status: 'pending' | 'in_progress' | 'completed';
  createdAt: string;
  updatedAt: string;
  booking?: {
    id: string;
    parkingId: string;
    vehicleType: string;
    startTime: string;
    endTime: string;
    user?: {
      name: string;
      phone: string;
      email: string;
    };
    parking?: {
      name: string;
    };
  };
  customAddon?: {
    id: string;
    name: string;
    price: string;
  } | null;
}

export interface CustomAddon {
  id: string;
  parkingId: string;
  name: string;
  description: string | null;
  price: string;
  image: string | null;
  isActive: boolean;
  createdAt: string;
  parking?: {
    name: string;
    address: string;
  };
}

export interface ParkingSlot {
  id: string;
  parkingId: string;
  vehicleType: 'bike' | 'car' | 'commercial';
  totalSlots: number;
  availableSlots: number;
  parking?: {
    name: string;
    address: string;
  };
}

export interface PricingRule {
  id: string;
  parkingId: string;
  vehicleType: 'bike' | 'car' | 'commercial';
  weekdayPrice: string;
  weekendPrice: string;
  peakRules: any;
  parking?: {
    name: string;
    address: string;
  };
}

export interface Vehicle {
  id: string;
  userId: string;
  vehicleType: 'bike' | 'car' | 'commercial';
  regNumber: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  user?: {
    name: string;
    email: string;
    phone: string;
  };
}

export interface Payout {
  id: string;
  ownerId: string;
  weekStart: string;
  weekEnd: string;
  grossAmount: string;
  commission: string;
  netAmount: string;
  disputeHold: string;
  finalPayout: string;
  status: 'pending' | 'processing' | 'transferred' | 'failed';
  utrNumber: string | null;
  processedAt: string | null;
  createdAt: string;
  user?: {
    name: string;
    email: string;
    phone: string;
  };
}

export interface Dispute {
  id: string;
  bookingId: string;
  raisedById: string;
  raisedByType: 'driver' | 'owner' | 'admin';
  reason: string;
  description: string;
  status: 'open' | 'reviewing' | 'resolved';
  resolution: 'full_refund' | 'partial_refund' | 'no_refund' | 'owner_penalty' | null;
  refundAmount: string | null;
  adminNote: string | null;
  createdAt: string;
  resolvedAt: string | null;
  booking?: {
    id: string;
    parkingId: string;
    vehicleType: string;
    startTime: string;
    endTime: string;
    grossAmount: string;
    parking?: {
      name: string;
    };
    user?: {
      name: string;
      phone: string;
    };
  };
  raisedBy?: {
    name: string;
    userType: string;
  };
}

export const dbService = {
  getAddonBookings: async (params?: { page?: number; limit?: number; search?: string; status?: string }) => {
    const response = await api.get<{ success: boolean; data: AddonBooking[]; meta: any }>('/admin/db/addon-bookings', { params });
    return response.data;
  },

  getCustomAddons: async (params?: { page?: number; limit?: number; search?: string }) => {
    const response = await api.get<{ success: boolean; data: CustomAddon[]; meta: any }>('/admin/db/custom-addons', { params });
    return response.data;
  },

  getParkingSlots: async (params?: { page?: number; limit?: number; search?: string }) => {
    const page = params?.page || 1;
    const limit = params?.limit || 10;
    const search = params?.search || '';

    const response = await api.get<{ data: any[] }>('/admin/parkings', {
      params: { page: 1, limit: 1000, search },
    });

    const slots = (response.data.data || []).flatMap((parking) =>
      (parking.slots || []).map((slot: any) => ({
        ...slot,
        parking: {
          name: parking.name,
          address: parking.address,
        },
      }))
    );

    const start = (page - 1) * limit;
    const data = slots.slice(start, start + limit);

    return {
      success: true,
      data,
      meta: {
        total: slots.length,
        page,
        limit,
        totalPages: Math.ceil(slots.length / limit),
      },
    };
  },

  getPricingRules: async (params?: { page?: number; limit?: number; search?: string }) => {
    const response = await api.get<{ success: boolean; data: PricingRule[]; meta: any }>('/admin/db/pricing-rules', { params });
    return response.data;
  },

  getVehicles: async (params?: { page?: number; limit?: number; search?: string }) => {
    const response = await api.get<{ success: boolean; data: Vehicle[]; meta: any }>('/admin/db/vehicles', { params });
    return response.data;
  },

  getPayouts: async (params?: { page?: number; limit?: number; search?: string }) => {
    const response = await api.get<{ success: boolean; data: Payout[]; meta: any }>('/admin/db/payouts', { params });
    return response.data;
  },

  // Disputes endpoints
  getDisputes: async (params?: { page?: number; limit?: number }) => {
    const response = await api.get<{ success: boolean; data: Dispute[]; meta: any }>('/admin/disputes', { params });
    return response.data;
  },

  resolveDispute: async (id: string, payload: { resolution: string; refundAmount: number; adminNote: string }) => {
    const response = await api.put<{ success: boolean; message: string; data: any }>(`/admin/disputes/${id}/resolve`, payload);
    return response.data;
  },

  // Ledger audit logs (queries walletTxn)
  getTransactionLedger: async (params?: { page?: number; limit?: number; search?: string; userId?: string; type?: string; referenceType?: string }) => {
    const response = await api.get<{ success: boolean; data: any[]; meta: any; message: string }>('/admin/logs/transactions', { params });
    return response.data;
  },

  deleteTransaction: async (id: string) => {
    const response = await api.delete<{ success: boolean; message: string; data: any }>(`/admin/logs/transactions/${id}`);
    return response.data;
  },
};
