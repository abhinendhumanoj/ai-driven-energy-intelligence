import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Dashboard from "./pages/Dashboard.jsx";
import Insights from "./pages/Insights.jsx";
import History from "./pages/History.jsx";
import Navbar from "./components/Navbar.jsx";
import ToastProvider from "./components/ToastProvider.jsx";

import { PredictionProvider } from "./context/PredictionContext.jsx";
import Login from "./pages/Login.jsx";

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(
    localStorage.getItem("isAuthenticated") === "true"
  );

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "dark";
  });

  useEffect(() => {
    const root = document.documentElement;

    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const handleLogin = () => {
    setIsAuthenticated(true);
    localStorage.setItem("isAuthenticated", "true");
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.setItem("isAuthenticated", "false");
  };

  return (
    <PredictionProvider>
      <BrowserRouter>
        <ToastProvider />

        {isAuthenticated && (
          <Navbar theme={theme} onToggleTheme={toggleTheme} onLogout={handleLogout} />
        )}

        <Routes>
          <Route
            path="/login"
            element={
              isAuthenticated ? (
                <Navigate to="/dashboard" />
              ) : (
                <Login onLogin={handleLogin} theme={theme} onToggleTheme={toggleTheme} />
              )
            }
          />

          <Route
            path="/dashboard"
            element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />}
          />

          <Route
            path="/insights"
            element={isAuthenticated ? <Insights /> : <Navigate to="/login" />}
          />

          <Route
            path="/history"
            element={isAuthenticated ? <History /> : <Navigate to="/login" />}
          />

          <Route
            path="/"
            element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />}
          />

          <Route
            path="*"
            element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />}
          />
        </Routes>
      </BrowserRouter>
    </PredictionProvider>
  );
};

export default App;
