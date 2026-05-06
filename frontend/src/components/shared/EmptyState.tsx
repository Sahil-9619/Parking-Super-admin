import type { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
    icon: LucideIcon;
    title: string;
    description: string;
}

export function EmptyState({ icon: Icon, title, description }: EmptyStateProps) {
    return (
        <div className="py-20 flex flex-col items-center justify-center text-center bg-white rounded-[2.5rem] border border-gray-100 shadow-sm">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-4 border border-dashed border-gray-200">
                <Icon size={32} />
            </div>
            <h4 className="text-lg font-black text-gray-900 tracking-tight">{title}</h4>
            <p className="text-sm text-gray-400 mt-1 max-w-xs">{description}</p>
        </div>
    );
}
