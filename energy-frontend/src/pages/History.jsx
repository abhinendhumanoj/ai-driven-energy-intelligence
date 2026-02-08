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
  );
};

export default History;
