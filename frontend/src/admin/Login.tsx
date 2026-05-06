import { useState, type ChangeEvent, type FormEvent } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { useNavigate } from "react-router-dom";
import toast from 'react-hot-toast';
import logo from "../assets/logo.png";
import { authService } from '../services/authService';
import ThemeToggle from '../components/ThemeToggle';

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
      await authService.login({ email, password });
      toast.success('Login successful! Redirecting...', {
        icon: '🚀',
        style: {
          borderRadius: '16px',
          background: 'var(--text-main)',
          color: 'var(--bg-card)',
          fontWeight: 'bold',
        },
      });

      setTimeout(() => {
        navigate("/admin/dashboard");
      }, 800);

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
      transition: { staggerChildren: 0.1, delayChildren: 0.1 }
    }
  };

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring' as const,
        stiffness: 260,
        damping: 20
      }
    }
  };

  const wordVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: 0.5 + i * 0.1,
        type: 'spring' as const,
        stiffness: 200,
        damping: 15
      }
    })
  };

  return (
    <div className="fixed inset-0 w-full h-full font-['Outfit'] overflow-hidden flex flex-col lg:flex-row bg-bg-main antialiased transition-colors duration-300">

      {/* Theme Toggler Positioned Absolute */}
      <div className="absolute top-8 right-8 z-50">
        <ThemeToggle />
      </div>

      {/* Dynamic Animated Background with Parallax */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden bg-gradient-to-b from-secondary/10 via-bg-main to-secondary/10">
        <motion.div
          animate={{
            scale: [1, 1.03, 1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-secondary/10 rounded-full blur-[90px] transform-gpu"
        />
        <motion.div
          animate={{
            scale: [1, 1.02, 1],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute bottom-[-10%] left-[-10%] w-[450px] h-[450px] bg-primary/10 rounded-full blur-[80px] transform-gpu"
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
          <motion.img
            whileHover={{ rotate: 360 }}
            transition={{ duration: 1, ease: "anticipate" }}
            src={logo} alt="ParkAdda Logo" className="h-12 w-auto object-contain cursor-pointer transition-all duration-300 dark:invert dark:brightness-200"
          />
          <div className="flex flex-col">
            <span className="text-3xl font-black tracking-tight leading-none">
              <span className="text-primary">Park</span>
              <span className="text-secondary">Adda</span>
            </span>
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-[0.4em] mt-1.5">Admin Portal</span>
          </div>
        </motion.div>


        <div className="flex-1 flex flex-col justify-center max-w-2xl">
          <div className="mb-8">
            {["Manage", "Your", "Parking", "Business", "Easily"].map((word, i) => (
              <motion.span
                key={i}
                custom={i}
                variants={wordVariants}
                initial="hidden"
                animate="visible"
                className={`inline-block text-6xl lg:text-5xl font-black tracking-tighter mr-4 ${word === "Parking" ? "text-secondary" : word === "Business" ? "text-primary" : "text-text-main"
                  }`}
              >
                {word}
                {i === 1 || i === 3 ? <br /> : null}
              </motion.span>
            ))}
          </div>

          <motion.p
            variants={itemVariants}
            className="text-md text-text-muted leading-relaxed max-w-md mb-12 font-medium"
          >
            A powerful centralized dashboard designed for seamless control over your parking infrastructure, revenue, and security.
          </motion.p>

          <motion.div variants={itemVariants} className="flex gap-4">
            {[
              { title: "Secure", desc: "Enterprise Level", color: "var(--secondary)", icon: "●" },
              { title: "Fast", desc: "Real-time Sync", color: "var(--primary)", icon: "◆" }
            ].map((card, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -8, scale: 1.05 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                className="flex items-center gap-4 bg-bg-card/60 backdrop-blur-2xl p-4 pr-10 rounded-[2rem] border border-border-main transition-all cursor-default shadow-2xl shadow-primary/5 group gpu"
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-bold transition-transform duration-700 group-hover:rotate-[360deg]`} style={{ backgroundColor: `${card.color}20`, color: card.color }}>
                  {card.icon}
                </div>
                <div>
                  <h3 className="text-sm font-black text-text-main leading-none mb-1.5">{card.title}</h3>
                  <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider leading-none">{card.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        <motion.div variants={itemVariants} className="pt-12">
          <p className="text-secondary font-black text-sm tracking-[0.4em] uppercase">
            Find. Park. Go.
          </p>
        </motion.div>
      </motion.div>

      {/* Right Side - Form Container */}
      <div className="relative z-10 w-full lg:w-[45%] flex flex-col items-center justify-center p-6 h-full">

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:hidden flex flex-col items-center mb-10"
        >
          <motion.img
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            src={logo} alt="ParkAdda Logo" className="h-20 w-auto object-contain mb-6 dark:invert dark:brightness-200"
          />
          <h1 className="text-4xl font-black tracking-tighter">
            <span className="text-primary">Park</span>
            <span className="text-secondary">Adda</span>
          </h1>
          <p className="text-text-muted text-xs font-bold uppercase tracking-[0.4em] mt-3">Admin Portal</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-[440px] bg-bg-card/80 lg:bg-transparent backdrop-blur-md lg:backdrop-blur-none p-10 lg:p-0 rounded-[3.5rem] lg:rounded-none shadow-2xl lg:shadow-none border border-border-main lg:border-none relative z-20 gpu"
        >
          <div className="mb-12 text-center lg:text-left">
            <motion.h2
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 100 }}
              className="text-4xl mb-4 tracking-tighter"
            >
              <span className="text-primary">Welcome</span>{" "}
              <span className="text-secondary">Admin</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-text-muted font-medium text-lg"
            >
              Secure gateway to your workspace.
            </motion.p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
              <label className="block text-[11px] font-black text-text-main mb-4 uppercase tracking-[0.2em]">
                Email
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none text-text-muted group-focus-within:text-secondary transition-all duration-500 group-focus-within:scale-110">
                  <Mail size={20} />
                </div>
                <input
                  type="email"
                  className="block w-full pl-16 pr-6 py-5 bg-bg-main border-2 border-transparent rounded-[1.5rem] focus:bg-bg-card focus:border-secondary transition-all duration-500 outline-none text-text-main placeholder:text-text-muted text-md shadow-sm group-focus-within:shadow-xl group-focus-within:shadow-secondary/5"
                  placeholder="Enter email address"
                  value={email}
                  onChange={handleEmailChange}
                  required
                />
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
              <div className="flex items-center justify-between mb-4 px-1">
                <label className="block text-[11px] font-black text-text-main uppercase tracking-[0.2em]">
                  Password
                </label>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none text-text-muted group-focus-within:text-secondary transition-all duration-500 group-focus-within:scale-110">
                  <Lock size={20} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="block w-full pl-16 pr-16 py-5 bg-bg-main border-2 border-transparent rounded-[1.5rem] focus:bg-bg-card focus:border-secondary transition-all duration-500 outline-none text-text-main placeholder:text-text-muted text-md shadow-sm group-focus-within:shadow-xl group-focus-within:shadow-secondary/5"
                  placeholder="Enter Password"
                  value={password}
                  onChange={handlePasswordChange}
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-6 flex items-center text-text-muted hover:text-secondary transition-all duration-300 hover:scale-110"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                </button>
              </div>
            </motion.div>

            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
              className="w-full py-6 bg-primary text-white font-black rounded-[2rem] transition-all duration-500 shadow-2xl shadow-primary/30 flex items-center justify-center gap-4 group relative overflow-hidden uppercase tracking-[0.3em] text-[11px] mt-4"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite] pointer-events-none"></div>

              <AnimatePresence mode="wait">
                {isLoading ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-center gap-3"
                  >
                    <Loader2 size={20} className="animate-spin" />
                    <span>Processing...</span>
                  </motion.div>
                ) : (
                  <motion.div
                    key="content"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-center gap-3"
                  >
                    <span>Login to Dashboard</span>
                    <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform duration-500" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </form>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="absolute bottom-12 text-text-muted text-[10px] font-black tracking-[0.5em] uppercase"
        >
          © 2026 Park Adda Systems
        </motion.div>
      </div>

      <style>{`
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}
