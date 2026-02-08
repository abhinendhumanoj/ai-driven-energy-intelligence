import React, { useEffect, useState } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Mail, Moon, Sun } from 'lucide-react';
import Dashboard from './pages/Dashboard.jsx';
import Insights from './pages/Insights.jsx';
import History from './pages/History.jsx';
import { PredictionProvider } from './context/PredictionContext.jsx';
import Navbar from './components/Navbar.jsx';
import ToastProvider from './components/ToastProvider.jsx';

const Login = ({ onLogin, theme, onToggleTheme }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    if (email.trim() && password.trim()) {
      onLogin();
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center px-4">
      <button onClick={onToggleTheme} className="absolute top-6 right-6 p-2 rounded-lg border border-slate-300/70 dark:border-white/10 bg-white/60 dark:bg-slate-900/60">{theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}</button>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,#22c55e25,transparent_40%),radial-gradient(circle_at_bottom_left,#3b82f625,transparent_40%)]" />
      <motion.form
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit}
        className="relative w-full max-w-md rounded-2xl border border-slate-200/70 dark:border-white/10 bg-white/85 dark:bg-[#111827]/90 backdrop-blur p-8 shadow-sm"
      >
        <h1 className="text-2xl font-semibold mb-6">Welcome back</h1>
        <label className="text-sm">Email</label>
        <div className="mt-1 mb-4 relative">
          <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-300/70 dark:border-white/10 bg-transparent"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
          />
        </div>
        <label className="text-sm">Password</label>
        <div className="mt-1 mb-2 relative">
          <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-300/70 dark:border-white/10 bg-transparent"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="••••••••"
          />
        </div>
        <div className="flex items-center justify-between mb-5 text-xs">
          <label className="inline-flex items-center gap-2 text-slate-500 dark:text-slate-400"><input type="checkbox" /> Remember me</label>
          <button type="button" className="text-emerald-500 hover:text-emerald-400">Forgot password?</button>
        </div>
        <motion.button whileTap={{ scale: 0.98 }} type="submit" className="w-full rounded-xl bg-emerald-500 text-white py-2.5 font-semibold">
          Login
        </motion.button>
      </motion.form>
    </div>
  );
};

const Layout = ({ onLogout, theme, onToggleTheme }) => (
  <div className="min-h-screen bg-[#F9FAFB] dark:bg-[#0B0F1A] text-[#111827] dark:text-[#E5E7EB] transition-colors">
    <Navbar theme={theme} onToggleTheme={onToggleTheme} onLogout={onLogout} />
    <main className="max-w-7xl mx-auto px-6 py-6">
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/insights" element={<Insights />} />
        <Route path="/history" element={<History />} />
      </Routes>
    </main>
  </div>
);

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  return (
    <PredictionProvider>
      <BrowserRouter>
        {isAuthenticated ? (
          <Layout
            onLogout={() => setIsAuthenticated(false)}
            theme={theme}
            onToggleTheme={() => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))}
          />
        ) : (
          <Login onLogin={() => setIsAuthenticated(true)} theme={theme} onToggleTheme={() => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))} />
        )}
      </BrowserRouter>
      <ToastProvider />
    </PredictionProvider>
  );
};

export default App;
