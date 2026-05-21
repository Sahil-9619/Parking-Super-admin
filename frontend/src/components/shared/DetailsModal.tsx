import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { FileText } from 'lucide-react';

interface DetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  data: any;
}

const renderValue = (val: any): React.ReactNode => {
  if (val === null || val === undefined) return <span className="text-text-muted italic">N/A</span>;
  if (typeof val === 'boolean') {
    return (
      <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest ${val ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
        {val ? 'Yes' : 'No'}
      </span>
    );
  }
  if (typeof val === 'object') {
    if (Array.isArray(val)) {
      if (val.length === 0) return <span className="text-text-muted italic">Empty Array</span>;
      return (
        <div className="space-y-2 mt-1">
          {val.map((item, idx) => (
            <div key={idx} className="p-2 bg-bg-main/30 rounded-lg border border-border-main/50">
              {renderValue(item)}
            </div>
          ))}
        </div>
      );
    }
    // Render Object
    return (
      <div className="space-y-1.5 mt-1 border-l-2 border-border-main/50 pl-3">
        {Object.entries(val).map(([k, v]) => (
          <div key={k} className="flex flex-col">
            <span className="text-[10px] font-bold text-text-muted capitalize">{k.replace(/([A-Z])/g, ' $1').trim()}</span>
            <div className="text-xs font-medium text-text-main">{renderValue(v)}</div>
          </div>
        ))}
      </div>
    );
  }
  
  // String or Number
  let strVal = String(val);
  // Check if it's an ISO date string loosely
  if (strVal.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)) {
    strVal = new Date(strVal).toLocaleString();
  }

  return <span className="text-xs font-medium text-text-main break-words">{strVal}</span>;
};

export const DetailsModal: React.FC<DetailsModalProps> = ({ isOpen, onClose, title, data }) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        style={{ backgroundColor: 'rgba(var(--bg-card-rgb), 0.98)' }}
        className="max-w-2xl max-h-[85vh] rounded-2xl border border-border-main backdrop-blur-3xl p-0 shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in duration-300"
      >
        <DialogHeader className="p-6 pb-4 border-b border-border-main/30 shrink-0">
          <DialogTitle className="text-xl font-black text-text-main tracking-tight flex items-center gap-2">
            <FileText size={20} className="text-primary" />
            {title} Details
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 p-6 pt-2 overflow-y-auto">
          {data ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              {Object.entries(data).map(([key, value]) => {
                // Skip rendering internal IDs or huge arrays directly at top level if desired, but here we render all.
                return (
                  <div key={key} className="flex flex-col space-y-1 bg-bg-main/10 p-3 rounded-xl border border-border-main/20">
                    <span className="text-[10px] font-black text-primary uppercase tracking-widest">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                    <div>{renderValue(value)}</div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-10 text-text-muted font-bold">No details available</div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
