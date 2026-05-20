import { LogOut, ShieldCheck } from 'lucide-react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface LogoutModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
}

export function LogoutModal({ 
    isOpen, 
    onOpenChange, 
    onConfirm 
}: LogoutModalProps) {
    return (
        <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
            <AlertDialogContent 
                style={{ backgroundColor: 'rgba(var(--bg-card-rgb), 0.8)' }}
                className="max-w-[400px] rounded-2xl sm:rounded-[2rem] border-border-main backdrop-blur-3xl p-5 sm:p-6 shadow-2xl shadow-black/10 animate-in fade-in zoom-in duration-300"
            >
                <AlertDialogHeader className="space-y-4">
                    <div className="flex items-start sm:items-center gap-4 text-left">
                        <div className="shrink-0 p-3 bg-primary/10 text-primary rounded-2xl border border-primary/20">
                            <LogOut size={22} />
                        </div>
                        <div className="min-w-0">
                            <AlertDialogTitle className="text-lg sm:text-xl font-black text-text-main tracking-tight leading-tight">
                                Confirm Logout
                            </AlertDialogTitle>
                            <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mt-2 flex items-center gap-1.5">
                                <ShieldCheck size={10} className="text-primary" />
                                Secure Session Termination
                            </p>
                        </div>
                    </div>
                    <AlertDialogDescription className="text-[11px] font-bold leading-relaxed text-text-muted">
                        Are you sure you want to end your current administrative session? You will need to re-authenticate to access the Super Admin dashboard.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="mt-6 gap-3 grid grid-cols-1 sm:grid-cols-2 sm:flex-row">
                    <AlertDialogCancel className="mt-0 w-full h-11 rounded-xl font-black uppercase tracking-widest text-[10px] border-border-main bg-bg-main/50 text-text-muted hover:bg-bg-main hover:text-text-main transition-all">
                        Stay Active
                    </AlertDialogCancel>
                    <AlertDialogAction 
                        onClick={onConfirm}
                        className="w-full h-11 rounded-xl font-black uppercase tracking-widest text-[10px] bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20 active:scale-95 transition-all"
                    >
                        Sign Out
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
