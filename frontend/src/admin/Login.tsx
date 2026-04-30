import { useState, type ChangeEvent, type FormEvent } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { useNavigate } from "react-router-dom";
import toast from 'react-hot-toast';
import logo from "../assets/logo.png";
import { COLORS } from '../constants/colors';
import { authService } from '../services/authService';
import { FaBeer } from 'react-icons/fa'; // 'fa' corresponds to Font Awesome

export default function Login() {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const navigate = useNavigate();
  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value);
  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Prepared for real backend connection
      await authService.login({ email, password });
      toast.success('Login successful! Redirecting...', {
        icon: '🚀',
        style: {
          borderRadius: '16px',
          background: COLORS.slate[900],
          color: COLORS.white,
          fontWeight: 'bold',
        },
      });

      // Delay slightly for UX
      setTimeout(() => {
        navigate("/admin/dashboard");
      }, 1000);

    } catch (error: any) {
      toast.error(error.message || 'Login failed. Please check your credentials.', {
        style: {
          borderRadius: '16px',
          background: '#fee2e2',
          color: '#991b1b',
          fontWeight: 'bold',
          border: '1px solid #fecaca',
        },
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Animation variants
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  };

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: "easeOut" } }
  };

  return (
    <div className="fixed inset-0 w-full h-full font-['Outfit'] overflow-hidden flex flex-col lg:flex-row bg-white">

      {/* Dynamic Animated Background */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden bg-gradient-to-b from-secondary/20 via-white to-secondary/20">
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 5, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[-10%] right-[-10%] w-[1000px] h-[1000px] bg-secondary/10 rounded-full blur-[180px]"
        />
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, -5, 0],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-[-10%] left-[-10%] w-[800px] h-[800px] bg-primary/10 rounded-full blur-[150px]"
        />
      </div>

      {/* Left Side - Branding */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="hidden lg:flex lg:w-[55%] relative overflow-hidden flex-col p-10 pl-20 h-full z-10"
      >
        <motion.div variants={itemVariants} className="flex items-center gap-5 mb-10">
          <img src={logo} alt="ParkAdda Logo" className="h-12 w-auto object-contain" />
          <div className="flex flex-col">
            <span className="text-3xl font-black tracking-tight leading-none">
              <span className="text-primary" style={{ color: COLORS.primary }}>Park</span>
              <span className="text-secondary" style={{ color: COLORS.secondary }}>Adda</span>
            </span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.4em] mt-1.5" style={{ color: COLORS.slate[400] }}>Admin Portal</span>
          </div>

        </motion.div>


        <div className="flex-1 flex flex-col justify-center max-w-2xl">
          <motion.h1
            variants={itemVariants}
            className="text-6xl lg:text-5xl font-black text-slate-900 leading-[1.05] mb-8 tracking-tighter"
            style={{ color: COLORS.slate[900] }}
          >
            Manage Your <br />
            <span className="text-secondary" style={{ color: COLORS.secondary }}>Parking</span> <br />
            <span className="text-primary" style={{ color: COLORS.primary }}>Business</span> Easily
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="text-md text-slate-500 leading-relaxed max-w-md mb-12 font-medium"
            style={{ color: COLORS.slate[500] }}
          >
            A powerful centralized dashboard designed for seamless control over your parking infrastructure, revenue, and security.
          </motion.p>

          {/* Re-added Feature Cards */}
          <motion.div variants={itemVariants} className="flex gap-4">
            {[
              { title: "Secure", desc: "Enterprise Level", color: COLORS.secondary, icon: "●" },
              { title: "Fast", desc: "Real-time Sync", color: COLORS.primary, icon: "◆" }
            ].map((card, i) => (
              <div
                key={i}
                className="flex items-center gap-4 bg-white/50 backdrop-blur-xl p-4 pr-10 rounded-[2rem] border border-white transition-all cursor-default shadow-xl shadow-slate-200/20 group hover:translate-y-[-4px]"
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-bold`} style={{ backgroundColor: `${card.color}15`, color: card.color }}>
                  {card.icon}
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 leading-none mb-1.5" style={{ color: COLORS.slate[900] }}>{card.title}</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider leading-none" style={{ color: COLORS.slate[400] }}>{card.desc}</p>
                </div>
              </div>
            ))}
          </motion.div>
        </div>

        <motion.div variants={itemVariants} className="pt-12">
          <p className="text-secondary font-black text-sm tracking-[0.4em] uppercase" style={{ color: COLORS.secondary }}>
            Find. Park. Go.
          </p>
        </motion.div>
      </motion.div>

      {/* Right Side - Form Container */}
      <div className="relative z-10 w-full lg:w-[45%] flex flex-col items-center justify-center p-6 h-full">

        {/* Mobile Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:hidden flex flex-col items-center mb-10"
        >
          <img src={logo} alt="ParkAdda Logo" className="h-20 w-auto object-contain mb-6" />
          <h1 className="text-4xl font-black tracking-tighter">
            <span className="text-primary" style={{ color: COLORS.primary }}>Park</span>
            <span className="text-secondary" style={{ color: COLORS.secondary }}>Adda</span>
          </h1>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.4em] mt-3" style={{ color: COLORS.slate[400] }}>Admin Portal</p>
        </motion.div>

        {/* Form Container - Minimalist on PC */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-full max-w-[440px] bg-white lg:bg-transparent p-10 lg:p-0 rounded-[3.5rem] lg:rounded-none shadow-2xl lg:shadow-none border border-white lg:border-none relative z-20"
        >
          <div className="mb-12 text-center lg:text-left">
            <motion.h2
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="text-4xl mb-4 tracking-tighter"
            >
              <span className="text-primary" style={{ color: COLORS.primary }}>Welcome</span>{" "}
              <span className="text-secondary" style={{ color: COLORS.secondary }}>Admin</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-slate-400 font-medium text-lg" style={{ color: COLORS.slate[400] }}
            >
              Secure gateway to your workspace.
            </motion.p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
              <label className="block text-[11px] font-black text-slate-800 mb-4 uppercase tracking-[0.2em]" style={{ color: COLORS.slate[800] }}>
                Email
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none text-slate-400 group-focus-within:text-secondary transition-all">
                  <Mail size={20} />
                </div>
                <input
                  type="email"
                  className="block w-full pl-16 pr-6 py-5 bg-slate-100/50 lg:bg-white/40 border border-transparent rounded-[1.5rem] focus:bg-white focus:ring-8 focus:ring-secondary/5 focus:border-secondary transition-all outline-none text-slate-900  placeholder:text-slate-300 text-md shadow-sm"
                  placeholder="Enter email address"
                  value={email}
                  onChange={handleEmailChange}
                  required
                />
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}>
              <div className="flex items-center justify-between mb-4 px-1">
                <label className="block text-[11px] font-black text-slate-800 uppercase tracking-[0.2em]" style={{ color: COLORS.slate[800] }}>
                  Password
                </label>
                {/* <button type="button" className="text-[11px] font-black text-secondary hover:underline tracking-widest uppercase transition-all" style={{ color: COLORS.secondary }}>
                  Recovery
                </button> */}
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none text-slate-400 group-focus-within:text-secondary transition-all">
                  <Lock size={20} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="block w-full pl-16 pr-16 py-5 bg-slate-100/50 lg:bg-white/40 border border-transparent rounded-[1.5rem] focus:bg-white focus:ring-8 focus:ring-secondary/5 focus:border-secondary transition-all outline-none text-slate-900 placeholder:text-slate-300 text-md shadow-sm"
                  placeholder="Enter Password"
                  value={password}
                  onChange={handlePasswordChange}
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-6 flex items-center text-slate-400 hover:text-secondary transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                </button>
              </div>
            </motion.div>

            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
              className="w-full py-6 bg-primary text-white font-black rounded-[2rem] transition-all shadow-2xl shadow-primary/30 flex items-center justify-center gap-4 group relative overflow-hidden uppercase tracking-[0.3em] text-[11px] mt-4"
              style={{ backgroundColor: COLORS.primary }}
            >
              <AnimatePresence mode="wait">
                {isLoading ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-3"
                  >
                    <Loader2 size={20} className="animate-spin" />
                    <span>Processing...</span>
                  </motion.div>
                ) : (
                  <motion.div
                    key="content"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-3"
                  >
                    <span>Login to Dashboard</span>
                    <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </form>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="absolute bottom-12 text-slate-400 text-[10px] font-black tracking-[0.5em] uppercase"
        >
          © 2026 Park Adda Systems
        </motion.div>
      </div>
    </div>
  );
}
