import React from "react";
import { motion } from "framer-motion";
import { LogOut, Moon, Sun } from "lucide-react";
import { NavLink } from "react-router-dom";

const linkClass = ({ isActive }) =>
  `relative px-1 py-2 text-sm transition ${
    isActive
      ? "text-emerald-500"
      : "text-slate-500 dark:text-slate-300 hover:text-emerald-500"
  }`;

const Navbar = ({ theme, onToggleTheme, onLogout }) => (
  <header className="sticky top-0 z-40 border-b border-slate-200/60 dark:border-white/10 bg-white/80 dark:bg-[#0B0F1A]/85 backdrop-blur">
    
    <div className="w-full px-6 py-4 flex items-center justify-between gap-4">
      
      {/* Left Side Logo + Title */}
      <div className="flex items-center gap-3">
        <img
          src="/logo.png"
          alt="HITAM Logo"
          className="w-12 h-12 Rectangle-full border border-slate-500/100 dark:border-white/20 object-cover"
        />

        <h1 className="text-lg font-semibold">
          AI-Driven Energy Intelligence
        </h1>
      </div>

      {/* Right Side Nav */}
      <nav className="flex items-center gap-5">
        {["/", "/insights", "/history"].map((path) => {
          const label =
            path === "/"
              ? "Dashboard"
              : path.slice(1).replace(/^./, (c) => c.toUpperCase());

          return (
            <NavLink key={path} to={path} className={linkClass}>
              {({ isActive }) => (
                <span className="relative">
                  {label}
                  {isActive && (
                    <motion.span
                      layoutId="active-tab"
                      className="absolute left-0 -bottom-2 h-0.5 w-full bg-emerald-500"
                      transition={{ duration: 0.2 }}
                    />
                  )}
                </span>
              )}
            </NavLink>
          );
        })}

        {/* Theme Button */}
        <button
          onClick={onToggleTheme}
          className="p-2 rounded-lg border border-slate-300/60 dark:border-white/15 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        >
          {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        {/* Logout */}
        <button
          onClick={onLogout}
          className="flex items-center gap-2 text-sm text-emerald-500 hover:text-emerald-400 transition"
        >
          <LogOut size={16} /> Logout
        </button>
      </nav>
    </div>
  </header>
);

export default Navbar;
