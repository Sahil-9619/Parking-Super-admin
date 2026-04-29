'use client';

import React, { useState, ChangeEvent, FormEvent } from 'react';
import { Mail, Lock, Eye, EyeOff, CheckCircle2, Star, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function Page() {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    console.log('Login attempt with:', { email, password });
    // Add login logic here
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  const formVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.6, ease: "easeOut", delay: 0.4 }
    }
  };

  return (
    <div className="flex h-screen font-sans bg-white overflow-hidden">
      {/* Left Side - Information & Branding */}
      <motion.div
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="hidden lg:flex lg:w-1/2 bg-[#026aa7] text-white p-4 flex-col justify-between relative overflow-hidden"
      >
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="relative"
        >


          <motion.div variants={itemVariants} className="flex items-center gap-3 mb-1">
            <div className=" p-2 rounded-lg">
              Logo
            </div>
            <span className="text-3xl font-bold tracking-tight">Park Adda</span>
          </motion.div>

          <motion.h1 variants={itemVariants} className="text-4xl font-bold leading-tight mt-12 m-6 ">
            Elevate your Parking Management
          </motion.h1>
          <motion.p variants={itemVariants} className="text-lg text-white/80 mb-1 max-w-md m-6">
            The all-in-one command center for real-time analytics, slot monitoring, and automated revenue tracking.
          </motion.p>

          <motion.div variants={itemVariants} className="space-y-4  m-6 ml-10">
            {[
              "Monitor live slot occupancy",
              "Automate entry and exit gates",
              "Track revenue and actionable insights"
            ].map((text, i) => (
              <motion.div
                key={i}
                variants={itemVariants}
                className="flex items-center gap-3"
              >
                <CheckCircle2 className="text-[#00aeef]" size={22} />
                <span className="text-md font-medium">{text}</span>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Testimonial Card */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
          className="relative z-10 bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20"
        >
          <div className="flex gap-1 mb-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star key={i} size={16} fill="white" className="text-white" />
            ))}
          </div>
          <p className="text-white text-md italic mb-2 leading-relaxed">
            "Managing multiple parking zones used to be a nightmare. Since switching to SmartPark Pro, our revenue increased by 20% due to optimized slot allocation."
          </p>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center overflow-hidden">
              <img
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah"
                alt="Sarah Jenkins"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <p className="font-bold">Sarah Jenkins</p>
              <p className="text-white/60 text-sm">Director, Central District Parking</p>
            </div>
          </div>
        </motion.div>

        {/* Background Decoration */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 10, 0]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-20 -right-20 w-96 h-96 bg-white/5 rounded-full blur-3xl"
        ></motion.div>
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            y: [0, 20, 0]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 -left-10 w-40 h-40 bg-white/5 rounded-full blur-2xl"
        ></motion.div>
      </motion.div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 bg-slate-50 overflow-hidden">
        <motion.div
          variants={formVariants}
          initial="hidden"
          animate="visible"
          className="w-full max-w-md"
        ><motion.div variants={itemVariants}>
            <Link href="/" className="flex items-center gap-2 text-cyan-600 hover:text-cyan-500 transition-colors mb-12">
              <ArrowLeft size={20} />
              <span className="text-sm font-medium">Back to Home</span>
            </Link>
          </motion.div>
          <div className="mb-10">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Welcome Back</h2>
            <p className="text-slate-500">Log in to your parking account.</p>
          </div>

          <form onSubmit={handleSubmit}
            className="space-y-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2" htmlFor="email">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <Mail size={18} />
                </div>
                <input
                  id="email"
                  type="email"
                  className="block w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#00aeef] focus:border-transparent transition-all outline-none text-slate-900"
                  placeholder="sarah.j@centralparking.gov"
                  value={email}
                  onChange={handleEmailChange}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <Lock size={18} />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  className="block w-full pl-11 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#00aeef] focus:border-transparent transition-all outline-none text-slate-900"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={handlePasswordChange}
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <p className="mt-2 text-xs text-slate-400">Must be at least 8 characters long</p>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer group">
                <div className="relative flex items-center">
                  <input type="checkbox" className="peer sr-only" />
                  <div className="w-5 h-5 bg-slate-100 border border-slate-200 rounded peer-checked:bg-[#00aeef] peer-checked:border-[#00aeef] transition-all"></div>
                  <CheckCircle2 className="absolute text-white scale-0 peer-checked:scale-75 transition-transform left-[-1px] top-[-1px]" size={22} strokeWidth={3} />
                </div>
                <span className="text-sm text-slate-500 group-hover:text-slate-700 transition-colors">
                  I agree to the <Link href="#" className="text-[#00aeef] hover:underline">Terms of Service</Link> and <Link href="#" className="text-[#00aeef] hover:underline">Privacy Policy</Link>.
                </span>
              </label>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="w-full py-4 bg-[#00aeef] text-white font-bold rounded-xl hover:bg-[#0096ce] transition-all shadow-lg shadow-[#00aeef]/20"
            >
              Log In
            </motion.button>

            <div className="relative py-4 flex items-center">
              <div className="flex-grow border-t border-slate-200"></div>
              <span className="flex-shrink mx-4 text-slate-400 text-xs font-medium uppercase tracking-wider">Super Admin Access</span>
              <div className="flex-grow border-t border-slate-200"></div>
            </div>

            <div className="text-center text-sm text-slate-500">
              Need help? <Link href="#" className="text-[#00aeef] font-semibold hover:underline">Contact Support</Link>
            </div>
          </form>
        </motion.div>
      </div>
    </div >
  );
}
