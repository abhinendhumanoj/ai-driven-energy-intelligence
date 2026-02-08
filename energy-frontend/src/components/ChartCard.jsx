import React from 'react';
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const ChartCard = ({ data, chartMode, onModeChange }) => (
  <section className="rounded-2xl border border-slate-200/70 dark:border-white/10 bg-white dark:bg-[#111827] p-5 shadow-sm">
    <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
      <h2 className="text-base font-semibold">Actual vs Forecast</h2>
      <div className="flex gap-2">
        {['consumption', 'bill', 'both'].map((mode) => (
          <button
            key={mode}
            onClick={() => onModeChange(mode)}
            className={`px-3 py-1.5 text-xs rounded-lg border ${chartMode === mode ? 'bg-emerald-500 text-white border-emerald-500' : 'border-slate-300/70 dark:border-white/15'}`}
          >
            {mode === 'both' ? 'Show Both' : mode === 'bill' ? 'Show Bill' : 'Show Consumption'}
          </button>
        ))}
      </div>
    </div>
    <div className="h-96">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" />
          <XAxis dataKey="month" stroke="#9CA3AF" />
          <YAxis yAxisId="left" stroke="#3B82F6" hide={chartMode === 'bill'} />
          <YAxis yAxisId="right" orientation="right" stroke="#22C55E" hide={chartMode === 'consumption'} />
          <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid rgba(148,163,184,0.3)' }} />
          <Legend />
          {chartMode !== 'bill' && (
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="consumption"
              name="Consumption (kWh)"
              stroke="#3B82F6"
              strokeWidth={2.5}
              animationDuration={900}
              dot={false}
            />
          )}
          {chartMode !== 'consumption' && (
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="bill"
              name="Bill Amount (₹)"
              stroke="#22C55E"
              strokeWidth={2.5}
              animationDuration={900}
              dot={false}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  </section>
);

export default ChartCard;
