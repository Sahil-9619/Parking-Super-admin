import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import toast from 'react-hot-toast';
import React from 'react';
import { AlertTriangle } from 'lucide-react';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const showStatusToast = (status: string, message: string) => {
    const s = status.toLowerCase();
    
    if (s === 'active' || s === 'approved' || s === 'resolved' || s === 'settled' || s === 'completed') {
        toast.success(message, {
            style: { 
                border: '1px solid rgba(16, 185, 129, 0.2)', 
                padding: '16px', 
                color: '#10b981', 
                background: 'rgba(16, 185, 129, 0.1)',
                fontWeight: '900',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                fontSize: '12px'
            },
            iconTheme: { primary: '#10b981', secondary: 'transparent' },
        });
    } else if (s === 'pending' || s === 'paused') {
        toast(message, {
            icon: React.createElement(AlertTriangle, { className: "w-5 h-5 text-amber-500" }),
            style: { 
                border: '1px solid rgba(245, 158, 11, 0.2)', 
                padding: '16px', 
                color: '#f59e0b', 
                background: 'rgba(245, 158, 11, 0.1)',
                fontWeight: '900',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                fontSize: '12px'
            },
        });
    } else {
        toast.error(message, {
            style: { 
                border: '1px solid rgba(239, 68, 68, 0.2)', 
                padding: '16px', 
                color: '#ef4444', 
                background: 'rgba(239, 68, 68, 0.1)',
                fontWeight: '900',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                fontSize: '12px'
            },
            iconTheme: { primary: '#ef4444', secondary: 'transparent' },
        });
    }
};
