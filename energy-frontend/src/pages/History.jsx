import React, { useEffect, useMemo, useState } from 'react';
import { usePrediction } from '../context/PredictionContext.jsx';

const History = () => {
  const { history, refreshHistory, loading, error } = usePrediction();
  const [query, setQuery] = useState('');

  useEffect(() => {
    refreshHistory();
  }, [refreshHistory]);

  const filtered = useMemo(() => {
    if (!query.trim()) {
      return history;
    }
    const lower = query.toLowerCase();
    return history.filter((row) => row.Month.toLowerCase().includes(lower));
  }, [history, query]);

  const handleExport = () => {
    if (!history.length) {
      return;
    }
    const header = 'Month,Consumption_KWh,Bill_Amount\n';
    const rows = history
      .map((row) => `${row.Month},${row.Consumption_KWh},${row.Bill_Amount}`)
      .join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'energy_history.csv');
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="space-y-6">
      <section className="bg-slate-900 p-4 rounded-xl shadow">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <input
            className="bg-slate-800 p-2 rounded w-full md:w-64"
            placeholder="Search month/year"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <button onClick={handleExport} className="bg-emerald-400 text-slate-900 px-4 py-2 rounded">
            Export CSV
          </button>
        </div>
      </section>

      <section className="bg-slate-900 p-4 rounded-xl shadow">
        <h2 className="text-lg font-semibold mb-3">Upload History</h2>
        {filtered.length === 0 ? (
          <p className="text-slate-300">No data available yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-slate-300">
                  <th className="py-2">Month</th>
                  <th className="py-2">Consumption (kWh)</th>
                  <th className="py-2">Bill Amount</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((row) => (
                  <tr key={`${row.Month}-${row.Consumption_KWh}`} className="border-t border-slate-800">
                    <td className="py-2">{row.Month}</td>
                    <td className="py-2">{row.Consumption_KWh}</td>
                    <td className="py-2">{row.Bill_Amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {loading && <p className="text-emerald-300">Loading...</p>}
      {error && <p className="text-red-400">{error}</p>}
    </div>
  );
};

export default History;
