import { motion } from 'framer-motion';
import { Construction, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export default function NotFound() {
    const navigate = useNavigate();

    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center">
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-32 h-32 bg-primary/5 rounded-[2.5rem] flex items-center justify-center text-primary mb-8 border border-primary/10 shadow-xl shadow-primary/5"
            >
                <Construction size={64} strokeWidth={1.5} />
            </motion.div>
            
            <motion.h2 
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="text-4xl font-black text-text-main tracking-tighter mb-4"
            >
                Under Construction
            </motion.h2>
            
            <motion.p 
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-text-muted font-bold uppercase tracking-[0.2em] text-[11px] max-w-xs mb-8"
            >
                We're currently building this section of the Park Adda Super Admin portal. Check back soon!
            </motion.p>
            
            <motion.div
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
            >
                <Button 
                    onClick={() => navigate('/admin/dashboard')}
                    className="bg-primary text-white border-primary shadow-xl shadow-primary/20 hover:bg-primary/90 px-8 py-6 h-auto rounded-2xl flex items-center gap-3 group transition-all"
                >
                    <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="text-[11px] font-black uppercase tracking-widest">Back to Dashboard</span>
                </Button>
            </motion.div>

            {/* Geometric Accents */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-[0.03]">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 border-[40px] border-primary rounded-full" />
                <div className="absolute bottom-1/4 right-1/4 w-64 h-64 border-[20px] border-primary rotate-45" />
            </div>
        </div>
    );
}
