import React, { useMemo, useState } from "react";
import LoadingSpinner from "./LoadingSpinner.jsx";

const months = [
  "Jan","Feb","Mar","Apr","May","Jun",
  "Jul","Aug","Sep","Oct","Nov","Dec"
];

const PredictionForm = ({ onPredict, loading }) => {
  const [month, setMonth] = useState(months[new Date().getMonth()]);
  const [year, setYear] = useState(String(new Date().getFullYear()));

  const years = useMemo(
    () => Array.from({ length: 11 }, (_, i) => String(2025 + i)),
    []
  );

  const handleSubmit = (event) => {
    event.preventDefault();
    const shortYear = year.slice(-2);
    onPredict(`${month}-${shortYear}`);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="relative z-50 rounded-2xl border border-slate-200/70 dark:border-white/10 bg-white dark:bg-[#111827] p-5 shadow-sm"
    >
      <h3 className="text-base font-semibold mb-3">Predict Future Month</h3>

      <div className="grid grid-cols-2 gap-3 relative z-50">
        <select
          value={month}
          onChange={(event) => setMonth(event.target.value)}
          className="relative z-50 rounded-xl border border-slate-300/70 dark:border-white/15 
                     bg-white dark:bg-[#0B1220] text-slate-900 dark:text-slate-100 
                     p-3 text-sm focus:outline-none"
        >
          {months.map((m) => (
            <option
              key={m}
              value={m}
              className="bg-white dark:bg-[#0B1220] text-slate-900 dark:text-slate-100"
            >
              {m}
            </option>
          ))}
        </select>

        <select
          value={year}
          onChange={(event) => setYear(event.target.value)}
          className="relative z-50 rounded-xl border border-slate-300/70 dark:border-white/15 
                     bg-white dark:bg-[#0B1220] text-slate-900 dark:text-slate-100 
                     p-3 text-sm focus:outline-none"
        >
          {years.map((y) => (
            <option
              key={y}
              value={y}
              className="bg-white dark:bg-[#0B1220] text-slate-900 dark:text-slate-100"
            >
              {y}
            </option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="mt-4 w-full rounded-xl bg-emerald-500 text-white py-2.5 text-sm font-semibold disabled:opacity-70 flex items-center justify-center gap-2"
      >
        {loading ? <LoadingSpinner size={16} /> : "Predict"}
      </button>
    </form>
  );
};

export default PredictionForm;
