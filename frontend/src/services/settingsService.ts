import api from './api';

export interface PlatformSettings {
    platformCommissionRate: number;
    cancellationFeeRate: number;
    overstayPenaltyRate: number;
}

export const settingsService = {
    getPlatformSettings: async (): Promise<PlatformSettings> => {
        const response = await api.get('/admin/settings');
        return response.data.data;
    },

    updatePlatformSettings: async (data: PlatformSettings): Promise<PlatformSettings> => {
        const response = await api.put('/admin/settings', data);
        return response.data.data;
    }
};
