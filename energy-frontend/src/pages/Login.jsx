import React, { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, Moon, Sun } from "lucide-react";

const Login = ({ onLogin, theme, onToggleTheme }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();

    if (email.trim() && password.trim()) {
      onLogin();
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center px-4 bg-[#F9FAFB] dark:bg-[#0B0F1A] text-[#111827] dark:text-[#E5E7EB] transition-colors">
      <button
        onClick={onToggleTheme}
        className="absolute top-6 right-6 p-2 rounded-xl border border-slate-200/70 dark:border-white/10 bg-white dark:bg-[#111827]"
      >
        {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
      </button>

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,#22c55e25,transparent_40%),radial-gradient(circle_at_bottom_left,#3b82f625,transparent_40%)]" />

      <motion.form
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        onSubmit={handleSubmit}
        className="relative w-full max-w-md rounded-2xl border border-slate-200/70 dark:border-white/10 bg-white/85 dark:bg-[#111827]/90 backdrop-blur p-8 shadow-sm"
      >
        <div className="flex justify-center mb-4">
          <img
            src="/logo.png"
            alt="HITAM Logo"
            className="w-20 h-20 object-contain"
          />
        </div>

        <h1 className="text-2xl font-semibold mb-2">Welcome Back</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
          Login to access your dashboard.
        </p>

        <label className="text-sm font-medium">Email</label>
        <div className="mt-2 mb-5 relative">
          <Mail
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-300/70 dark:border-white/10 bg-transparent focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <label className="text-sm font-medium">Password</label>
        <div className="mt-2 mb-5 relative">
          <Lock
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-300/70 dark:border-white/10 bg-transparent focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center justify-between text-xs mb-5">
          <label className="inline-flex items-center gap-2 text-slate-500 dark:text-slate-400">
            <input type="checkbox" />
            Remember me
          </label>
          <button
            type="button"
            className="text-emerald-500 hover:text-emerald-400"
          >
            Forgot password?
          </button>
        </div>

        <motion.button
          whileTap={{ scale: 0.98 }}
          type="submit"
          className="w-full rounded-xl bg-emerald-500 text-white py-2.5 font-semibold hover:bg-emerald-600 transition"
        >
          Login
        </motion.button>
      </motion.form>
    </div>
  );
};

export default Login;
