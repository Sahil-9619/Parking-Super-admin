import { useState, type ChangeEvent, type FormEvent } from 'react';
import { Mail, Lock, Eye, EyeOff, CheckCircle2, Star, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Login() {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value);
  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsLoading(false);
  };

  return (
    <div className="fixed inset-0 w-full h-full bg-white font-['Outfit'] overflow-hidden flex flex-col lg:flex-row">

      {/* Universal Background Gradient - Darker Top to White Bottom */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden bg-gradient-to-b from-[#01314d] via-[#026aa7] to-white">
        <div className="absolute top-[-5%] right-[-5%] w-96 h-96 bg-[#00aeef]/20 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-white/40 rounded-full blur-[120px]"></div>
      </div>

      {/* Left Side - Desktop Branding */}
      <div className="hidden lg:flex lg:w-[50%] relative overflow-hidden flex-col p-12 h-full z-10 justify-center">

        {/* Top Left Branding */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-10 left-10 flex items-center gap-2.5"
        >
          <div className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/20 shadow-xl">
            <ShieldCheck size={22} className="text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold tracking-tight text-white leading-none uppercase">Park Adda</span>
            <span className="text-[9px] font-bold text-white/40 uppercase tracking-[0.2em] mt-0.5">Super Admin</span>
          </div>
        </motion.div>

        <div className="max-w-md mt-10">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-5xl font-black text-white leading-[1.1] mb-5 tracking-tight"
          >
            Manage Your <br />
            <span className="text-[#00aeef]">Parking</span> Business Easily
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-base text-white/60 leading-relaxed max-w-sm mb-10 font-medium"
          >
            Powerful dashboard for admin control, revenue tracking, and automated access management.
          </motion.p>

          <div className="flex gap-4">
            {[
              { icon: ShieldCheck, title: "Secure", desc: "Protected Login" },
              { icon: Zap, title: "Fast", desc: "Quick Access" }
            ].map((card, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + (i * 0.1) }}
                className="flex-1 bg-white/50 backdrop-blur-xl p-5 rounded-3xl border border-white/10 group hover:bg-white/10 transition-all cursor-default"
              >
                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-white/20 transition-colors">
                  <card.icon size={20} className="text-cyan-700" />
                </div>
                <h3 className="text-base font-bold text-[#00aeef] mb-0.5">{card.title}</h3>
                <p className="text-[11px] text-gray-500 font-medium leading-snug">{card.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="absolute bottom-10 left-10 text-cyan-800 text-md font-bold tracking-widest">
          Manage your software efficiently.
        </div>
      </div>

      {/* Right Side - Form Container */}
      <div className="relative z-10 w-full lg:w-[50%] flex flex-col items-center justify-center p-6 h-full overflow-hidden">

        {/* Mobile Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:hidden flex flex-col items-center mb-10"
        >
          <div className="w-12 h-12 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center shadow-2xl mb-3 border border-white/20">
            <ShieldCheck size={28} className="text-white" />
          </div>
          <h1 className="text-xl font-black text-white tracking-tight uppercase">Park Adda</h1>
          <p className="text-white/50 text-[9px] font-bold uppercase tracking-[0.2em] mt-0.5">Super Admin</p>
        </motion.div>

        {/* The Card - White on Mobile, Transparent on Desktop */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-[400px] bg-white lg:bg-transparent p-8 lg:p-0 rounded-[2.5rem] lg:rounded-none shadow-2xl lg:shadow-none border border-slate-100 lg:border-none relative z-20"
        >
          <div className="mb-8 text-center lg:text-left">
            <h2 className="text-3xl font-black text-slate-900 lg:text-white mb-2 tracking-tight">Welcome back</h2>
            <p className="text-slate-500 lg:text-white/60 font-medium text-sm">Please enter your credentials.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 lg:text-white/80 mb-2 uppercase tracking-widest" htmlFor="email">
                Email Address
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-300 lg:text-white/60 group-focus-within:text-[#00aeef] transition-colors">
                  <Mail size={16} />
                </div>
                <input
                  id="email"
                  type="email"
                  className="block w-full pl-10 pr-4 py-3 bg-slate-50/50 lg:bg-white/5 border border-slate-100 lg:border-white/10 rounded-2xl focus:bg-white lg:focus:bg-white/10 focus:ring-4 focus:ring-[#00aeef]/10 focus:border-[#00aeef] transition-all outline-none text-slate-900 lg:text-white font-medium placeholder:text-slate-200 lg:placeholder:text-white/60 text-sm"
                  placeholder="Enter email address"
                  value={email}
                  onChange={handleEmailChange}
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-[10px] font-bold text-slate-400 lg:text-white/80 uppercase tracking-widest" htmlFor="password">
                  Password
                </label>
                <button type="button" className="text-[10px] font-bold text-[#00aeef] hover:underline transition-all">
                  Forgot?
                </button>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-300 lg:text-white/60 group-focus-within:text-[#00aeef] transition-colors">
                  <Lock size={16} />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  className="block w-full pl-10 pr-10 py-3 bg-slate-50/50 lg:bg-white/5 border border-slate-100 lg:border-white/10 rounded-2xl focus:bg-white lg:focus:bg-white/10 focus:ring-4 focus:ring-[#00aeef]/10 focus:border-[#00aeef] transition-all outline-none text-slate-900 lg:text-white font-medium placeholder:text-slate-300 lg:placeholder:text-white/60 text-sm"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={handlePasswordChange}
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-300 lg:text-white/80 hover:text-[#00aeef] transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-[#00aeef] text-white font-black rounded-2xl hover:bg-[#0096ce] transition-all shadow-xl shadow-[#00aeef]/20 flex items-center justify-center gap-2 group relative overflow-hidden uppercase tracking-widest text-xs mt-2"
            >
              <AnimatePresence mode="wait">
                {isLoading ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="w-4 h-4 border-[3px] border-white/30 border-t-white rounded-full animate-spin"
                  />
                ) : (
                  <motion.div
                    key="content"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2"
                  >
                    <span>Log In to Dashboard</span>
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </form>
        </motion.div>

        <div className="absolute bottom-10 text-slate-400 lg:text-black text-[10px] font-bold tracking-widest lg:block hidden uppercase">
          © 2026 Park Adda Systems Inc.
        </div>
      </div>
    </div>
  );
}
