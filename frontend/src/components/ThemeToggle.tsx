import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../hooks/useTheme';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={toggleTheme}
      className="relative p-2.5 bg-bg-card border border-border-main rounded-xl text-text-main shadow-lg hover:border-primary transition-colors group overflow-hidden"
      aria-label="Toggle Theme"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={theme}
          initial={{ y: 20, opacity: 0, rotate: -45 }}
          animate={{ y: 0, opacity: 1, rotate: 0 }}
          exit={{ y: -20, opacity: 0, rotate: 45 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-center justify-center gap-2"
        >
          {theme === 'light' ? (
            <div className="flex items-center gap-2">
              <Sun size={18} className="text-amber-500" />
              <span className="text-[10px] font-black uppercase tracking-widest hidden sm:block">Light</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Moon size={18} className="text-primary" />
              <span className="text-[10px] font-black uppercase tracking-widest hidden sm:block">Dark</span>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Magic Shine Effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"
      />
    </motion.button>
  );
}
