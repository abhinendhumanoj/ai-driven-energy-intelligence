import React, { useState } from 'react';
import { BrowserRouter, NavLink, Route, Routes } from 'react-router-dom';
import Dashboard from './pages/Dashboard.jsx';
import Insights from './pages/Insights.jsx';
import History from './pages/History.jsx';
import { PredictionProvider } from './context/PredictionContext.jsx';

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
          className="w-full bg-emerald-500 text-slate-900 py-2 rounded font-semibold"
        >
          Login
        </button>
      </form>
    </div>
  );
};

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

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <PredictionProvider>
      <BrowserRouter>
        {isAuthenticated ? (
          <Layout onLogout={() => setIsAuthenticated(false)} />
        ) : (
          <Login onLogin={() => setIsAuthenticated(true)} />
        )}
      </BrowserRouter>
    </PredictionProvider>
  );
};

export default App;
