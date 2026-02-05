
import React, { useEffect, useState } from 'react';

import React, { useState } from 'react';

import { BrowserRouter, NavLink, Route, Routes } from 'react-router-dom';
import Dashboard from './pages/Dashboard.jsx';
import Insights from './pages/Insights.jsx';
import History from './pages/History.jsx';
import { PredictionProvider } from './context/PredictionContext.jsx';

import { usePrediction } from './context/PredictionContext.jsx';
import ToastContainer from './components/ToastContainer.jsx';

const ThemeToggle = ({ theme, onToggle }) => (
  <button
    onClick={onToggle}
    className="rounded-full border border-white/20 dark:border-slate-700 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-700 dark:text-slate-200 hover:text-emerald-400 transition"
  >
    {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
  </button>
);

const Login = ({ onLogin, theme, onToggleTheme }) => {


const Login = ({ onLogin }) => {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    if (email.trim() && password.trim()) {
      onLogin();
    }
  };

  return (

    <div className="min-h-screen flex items-center justify-center bg-slate-100 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="absolute top-6 right-6">
        <ThemeToggle theme={theme} onToggle={onToggleTheme} />
      </div>
      <form
        onSubmit={handleSubmit}
        className="glass-panel p-8 rounded-2xl w-full max-w-md space-y-4 page-transition"
      >
        <h1 className="text-2xl font-semibold">Energy Intelligence Login</h1>
        <label className="block text-sm font-medium">Email</label>
        <input
          className="w-full p-3 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-slate-200/50 dark:border-slate-700/50 focus:outline-none focus:ring-2 focus:ring-emerald-400"

    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100">
      <form
        onSubmit={handleSubmit}
        className="bg-slate-900 p-8 rounded-xl shadow-lg w-full max-w-md"
      >
        <h1 className="text-2xl font-semibold mb-4">Energy Intelligence Login</h1>
        <label className="block text-sm font-medium mb-2">Email</label>
        <input
          className="w-full p-2 rounded bg-slate-800 mb-4"

          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
        />

        <label className="block text-sm font-medium">Password</label>
        <input
          className="w-full p-3 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-slate-200/50 dark:border-slate-700/50 focus:outline-none focus:ring-2 focus:ring-emerald-400"

        <label className="block text-sm font-medium mb-2">Password</label>
        <input
          className="w-full p-2 rounded bg-slate-800 mb-6"

          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="••••••••"
        />
        <button
          type="submit"

          className="w-full bg-emerald-400 text-slate-900 py-3 rounded-xl font-semibold transition hover:-translate-y-0.5 hover:shadow-xl"

          className="w-full bg-emerald-500 text-slate-900 py-2 rounded font-semibold"

        >
          Login
        </button>
      </form>
    </div>
  );
};


const Layout = ({ onLogout, theme, onToggleTheme }) => (
  <div className="min-h-screen bg-slate-100 text-slate-900 dark:bg-slate-950 dark:text-slate-100 transition-colors">
    <header className="px-6 py-4 glass-panel flex flex-wrap items-center justify-between gap-4">
      <h1 className="text-xl font-semibold">AI-Driven Energy Intelligence</h1>
      <nav className="flex flex-wrap items-center gap-4 text-sm">
        <NavLink className="hover:text-emerald-400 transition" to="/">Dashboard</NavLink>
        <NavLink className="hover:text-emerald-400 transition" to="/insights">Insights</NavLink>
        <NavLink className="hover:text-emerald-400 transition" to="/history">History</NavLink>
        <ThemeToggle theme={theme} onToggle={onToggleTheme} />
        <button onClick={onLogout} className="text-emerald-400 hover:text-emerald-300 transition">
          Logout
        </button>

const Layout = ({ onLogout }) => (
  <div className="min-h-screen bg-slate-950 text-slate-100">
    <header className="px-6 py-4 bg-slate-900 flex items-center justify-between">
      <h1 className="text-xl font-semibold">AI-Driven Energy Intelligence</h1>
      <nav className="flex items-center gap-4 text-sm">
        <NavLink className="hover:text-emerald-300" to="/">Dashboard</NavLink>
        <NavLink className="hover:text-emerald-300" to="/insights">Insights</NavLink>
        <NavLink className="hover:text-emerald-300" to="/history">History</NavLink>
        <button onClick={onLogout} className="text-emerald-300">Logout</button>

      </nav>
    </header>
    <main className="p-6">
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/insights" element={<Insights />} />
        <Route path="/history" element={<History />} />
      </Routes>
    </main>
  </div>
);


const Toasts = () => {
  const { toasts, dismissToast } = usePrediction();
  return <ToastContainer toasts={toasts} onDismiss={dismissToast} />;
};

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);


  return (
    <PredictionProvider>
      <BrowserRouter>
        {isAuthenticated ? (

          <Layout onLogout={() => setIsAuthenticated(false)} theme={theme} onToggleTheme={toggleTheme} />
        ) : (
          <Login onLogin={() => setIsAuthenticated(true)} theme={theme} onToggleTheme={toggleTheme} />
        )}
      </BrowserRouter>
      <Toasts />

          <Layout onLogout={() => setIsAuthenticated(false)} />
        ) : (
          <Login onLogin={() => setIsAuthenticated(true)} />
        )}
      </BrowserRouter>

    </PredictionProvider>
  );
};

export default App;
