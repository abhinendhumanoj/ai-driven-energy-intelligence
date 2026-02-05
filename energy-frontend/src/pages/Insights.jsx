import React, { useEffect } from 'react';
import { usePrediction } from '../context/PredictionContext.jsx';

const Insights = () => {
  const { insights, refreshInsights, insightsLoading, error } = usePrediction();

  useEffect(() => {
    refreshInsights();
  }, [refreshInsights]);

  if (!insights) {
    return (
      <div className="glass-panel p-6 rounded-2xl shadow page-transition">
        <h2 className="text-lg font-semibold mb-2">Insights</h2>
        <p className="text-slate-500 dark:text-slate-300">Upload energy data from Dashboard.</p>
        {insightsLoading && (
          <div className="mt-4 space-y-3 animate-pulse">
            <div className="h-4 bg-slate-200/70 dark:bg-slate-700/50 rounded" />
            <div className="h-4 bg-slate-200/70 dark:bg-slate-700/50 rounded w-3/4" />
            <div className="h-4 bg-slate-200/70 dark:bg-slate-700/50 rounded w-1/2" />
          </div>
        )}
        {error && <p className="text-red-500 mt-3">{error}</p>}
      </div>
    );
  }

  return (
    <div className="space-y-6 page-transition">
      <section className="grid gap-4 md:grid-cols-3">
        <div className="glass-panel p-5 rounded-2xl hover-lift">
          <p className="text-sm text-slate-500 dark:text-slate-300">Average Consumption</p>
          <p className="text-2xl font-semibold">{insights.average_consumption}</p>
        </div>
        <div className="glass-panel p-5 rounded-2xl hover-lift">
          <p className="text-sm text-slate-500 dark:text-slate-300">Total Yearly Bill</p>
          <p className="text-2xl font-semibold">{insights.total_bill}</p>
        </div>
        <div className="glass-panel p-5 rounded-2xl hover-lift">
          <p className="text-sm text-slate-500 dark:text-slate-300">Avg Rate per kWh</p>
          <p className="text-2xl font-semibold">{insights.avg_rate_per_kwh}</p>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="glass-panel p-5 rounded-2xl hover-lift">
          <p className="text-sm text-slate-500 dark:text-slate-300">Peak Month</p>
          <p className="text-xl font-semibold">{insights.peak_month}</p>
          <p className="text-sm text-slate-400">{insights.peak_value} kWh</p>
        </div>
        <div className="glass-panel p-5 rounded-2xl hover-lift">
          <p className="text-sm text-slate-500 dark:text-slate-300">Lowest Month</p>
          <p className="text-xl font-semibold">{insights.lowest_month}</p>
          <p className="text-sm text-slate-400">{insights.lowest_value} kWh</p>
        </div>
      </section>

      <section className="glass-panel p-5 rounded-2xl hover-lift">
        <h2 className="text-lg font-semibold mb-3">Recommendations</h2>
        <ul className="list-disc list-inside space-y-2 text-slate-500 dark:text-slate-300">
          {insights.recommendations.map((rec) => (
            <li key={rec}>{rec}</li>
          ))}
        </ul>
      </section>
    </div>
  );
};

export default Insights;
