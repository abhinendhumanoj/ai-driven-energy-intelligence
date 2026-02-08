
import React, { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { usePrediction } from '../context/PredictionContext.jsx';
import ExportButton from '../components/ExportButton.jsx';
import PageWrapper from '../components/PageWrapper.jsx';
import { downloadCsv } from '../utils/dataHelpers.js';

const PAGE_SIZE = 10;

const History = () => {
  const { history, refreshHistory, historyLoading } = usePrediction();
  const [search, setSearch] = useState('');
  const [yearFilter, setYearFilter] = useState('All');
  const [monthFilter, setMonthFilter] = useState('All');
  const [page, setPage] = useState(1);

import React, { useEffect, useMemo, useState } from "react";
import { usePrediction } from "../context/PredictionContext.jsx";

const History = () => {
  const { history, refreshHistory, historyLoading, error } = usePrediction();
  const [query, setQuery] = useState("");


  useEffect(() => {
    refreshHistory();
  }, [refreshHistory]);


  const years = useMemo(() => ['All', ...new Set(history.map((row) => `20${String(row.Month).split('-')[1] || ''}`))], [history]);

  const filtered = useMemo(() => {
    return history.filter((row) => {
      const month = String(row.Month || '');
      const matchesSearch = month.toLowerCase().includes(search.toLowerCase());
      const matchesYear = yearFilter === 'All' || `20${month.split('-')[1]}` === yearFilter;
      const matchesMonth = monthFilter === 'All' || month.startsWith(monthFilter);
      return matchesSearch && matchesYear && matchesMonth;
    });
  }, [history, search, yearFilter, monthFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const exportFiltered = () => {
    const rows = filtered.map((row) => ({ Month: row.Month, Consumption_KWh: row.Consumption_KWh, Bill_Amount: row.Bill_Amount }));
    downloadCsv('history_filtered.csv', rows, ['Month', 'Consumption_KWh', 'Bill_Amount']);
    toast.success('Filtered history exported.');
  };

  return (
    <PageWrapper className="space-y-4">
      <div className="rounded-2xl border border-slate-200/70 dark:border-white/10 bg-white dark:bg-[#111827] p-4 flex flex-wrap gap-3 items-center">
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search month/year" className="rounded-xl border border-slate-300/70 dark:border-white/10 px-3 py-2 text-sm bg-transparent" />
        <select value={monthFilter} onChange={(e) => setMonthFilter(e.target.value)} className="rounded-xl border border-slate-300/70 dark:border-white/10 px-3 py-2 text-sm bg-transparent">
          {['All', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m) => <option key={m}>{m}</option>)}
        </select>
        <select value={yearFilter} onChange={(e) => setYearFilter(e.target.value)} className="rounded-xl border border-slate-300/70 dark:border-white/10 px-3 py-2 text-sm bg-transparent">
          {years.map((year) => <option key={year}>{year}</option>)}
        </select>
        <div className="ml-auto"><ExportButton label="Export CSV" onClick={exportFiltered} /></div>
      </div>

      <div className="rounded-2xl border border-slate-200/70 dark:border-white/10 bg-white dark:bg-[#111827] shadow-sm overflow-hidden">
        <div className="max-h-[480px] overflow-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-slate-100 dark:bg-slate-900 z-10">
              <tr className="text-left">
                <th className="px-4 py-3">Month</th>
                <th className="px-4 py-3">Consumption (kWh)</th>
                <th className="px-4 py-3">Bill Amount</th>
              </tr>
            </thead>
            <tbody>
              {historyLoading ? (
                <tr><td className="px-4 py-6" colSpan={3}>Loading history...</td></tr>
              ) : paginated.length === 0 ? (
                <tr><td className="px-4 py-6" colSpan={3}>No records found.</td></tr>
              ) : paginated.map((row, index) => (
                <tr key={`${row.Month}-${index}`} className={`${index % 2 === 0 ? 'bg-white dark:bg-[#111827]' : 'bg-slate-50 dark:bg-slate-900/40'} hover:bg-emerald-50 dark:hover:bg-emerald-900/15 transition`}>
                  <td className="px-4 py-3">{row.Month}</td>
                  <td className="px-4 py-3">{row.Consumption_KWh}</td>
                  <td className="px-4 py-3">{row.Bill_Amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 text-sm">
        <button onClick={() => setPage((p) => Math.max(1, p - 1))} className="px-3 py-1.5 rounded-lg border border-slate-300/70 dark:border-white/10">Prev</button>
        <span>Page {page} of {totalPages}</span>
        <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} className="px-3 py-1.5 rounded-lg border border-slate-300/70 dark:border-white/10">Next</button>
      </div>
    </PageWrapper>

  const filtered = useMemo(() => {
    if (!query.trim()) return history;

    const lower = query.toLowerCase();
    return history.filter((row) => row.Month?.toLowerCase().includes(lower));
  }, [history, query]);

  const handleExport = () => {
    if (!history.length) return;

    const header = "Month,Consumption_KWh,Bill_Amount\n";
    const rows = history
      .map((row) => `${row.Month},${row.Consumption_KWh},${row.Bill_Amount}`)
      .join("\n");

    const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "energy_history.csv");

    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="space-y-6 page-transition">
      {/* Search + Export */}
      <section className="glass-panel p-5 rounded-2xl hover-lift">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <input
            className="bg-white/80 dark:bg-slate-800/80 p-3 rounded-xl w-full md:w-64 border border-slate-200/60 dark:border-slate-700/50 focus:outline-none focus:ring-2 focus:ring-emerald-400"
            placeholder="Search month/year"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />

          <button
            onClick={handleExport}
            className="bg-emerald-400 text-slate-900 px-5 py-3 rounded-xl font-semibold transition hover:-translate-y-0.5 hover:shadow-xl"
          >
            Export CSV
          </button>
        </div>
      </section>

      {/* History Table */}
      <section className="glass-panel p-5 rounded-2xl hover-lift">
        <h2 className="text-lg font-semibold mb-3">Upload History</h2>

        {historyLoading && filtered.length === 0 ? (
          <div className="space-y-3 animate-pulse">
            <div className="h-4 bg-slate-200/70 dark:bg-slate-700/50 rounded" />
            <div className="h-4 bg-slate-200/70 dark:bg-slate-700/50 rounded w-5/6" />
            <div className="h-4 bg-slate-200/70 dark:bg-slate-700/50 rounded w-2/3" />
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-slate-500 dark:text-slate-300">
            No data available yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 dark:text-slate-300">
                  <th className="py-2">Month</th>
                  <th className="py-2">Consumption (kWh)</th>
                  <th className="py-2">Bill Amount</th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((row, index) => (
                  <tr
                    key={`${row.Month}-${index}`}
                    className="border-t border-slate-200/50 dark:border-slate-800 hover:bg-white/40 dark:hover:bg-slate-800/40 transition"
                  >
                    <td className="py-2">{row.Month}</td>
                    <td className="py-2">{row.Consumption_KWh}</td>
                    <td className="py-2">{row.Bill_Amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {error && <p className="text-red-400 mt-3">{error}</p>}
      </section>
    </div>

  );
};

export default History;
