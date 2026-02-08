
import React, { useEffect, useMemo } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { FileText, Lightbulb, TrendingUp, Wallet } from 'lucide-react';
import jsPDF from 'jspdf';
import toast from 'react-hot-toast';
import { usePrediction } from '../context/PredictionContext.jsx';
import ExportButton from '../components/ExportButton.jsx';
import StatCard from '../components/StatCard.jsx';
import PageWrapper from '../components/PageWrapper.jsx';
import { toNumber } from '../utils/dataHelpers.js';

const Insights = () => {
  const { insights, refreshInsights, forecastData, insightsLoading } = usePrediction();

import React, { useEffect } from "react";
import { usePrediction } from "../context/PredictionContext.jsx";

const Insights = () => {
  const { insights, refreshInsights, insightsLoading, error } = usePrediction();


  useEffect(() => {
    refreshInsights();
  }, [refreshInsights]);


  const chartData = useMemo(() => {
    const actual = forecastData.actual || [];
    return actual.slice(-6).map((item) => ({ month: item.month, bill: toNumber(item.bill), consumption: toNumber(item.consumption) }));
  }, [forecastData.actual]);

  const exportPdf = () => {
    if (!insights) return toast.error('No insights to export.');
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text('Energy Insights Summary', 20, 20);
    doc.setFontSize(11);
    doc.text(`Average Consumption: ${insights.average_consumption}`, 20, 35);
    doc.text(`Peak Month: ${insights.peak_month} (${insights.peak_value})`, 20, 45);
    doc.text(`Lowest Month: ${insights.lowest_month} (${insights.lowest_value})`, 20, 55);
    doc.text(`Total Bill: ${insights.total_bill}`, 20, 65);
    doc.text(`Avg Rate/kWh: ${insights.avg_rate_per_kwh}`, 20, 75);
    doc.text('Recommendations:', 20, 90);
    (insights.recommendations || []).forEach((rec, index) => doc.text(`- ${rec}`, 24, 100 + index * 10));
    doc.save('insights-summary.pdf');
    toast.success('Insights PDF exported.');
  };

  if (!insights && !insightsLoading) {
    return <div className="rounded-2xl border border-slate-200/70 dark:border-white/10 bg-white dark:bg-[#111827] p-6">Upload energy data from Dashboard.</div>;
  }

  return (
    <PageWrapper className="space-y-6">
      <div className="flex justify-end">
        <ExportButton label="Export Insights PDF" onClick={exportPdf} />
      </div>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={TrendingUp} label="Consumption Insights" value={insightsLoading ? 'Loading...' : insights?.average_consumption} subtitle="Average monthly kWh" />
        <StatCard icon={Wallet} label="Bill Insights" value={insightsLoading ? 'Loading...' : `₹${insights?.total_bill || 0}`} subtitle="Total bill" />
        <StatCard icon={FileText} label="Trend Analysis" value={insightsLoading ? 'Loading...' : insights?.peak_month} subtitle="Peak month" />
        <StatCard icon={Lightbulb} label="Avg Rate / kWh" value={insightsLoading ? 'Loading...' : insights?.avg_rate_per_kwh} subtitle="Efficiency benchmark" />
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200/70 dark:border-white/10 bg-white dark:bg-[#111827] p-5 shadow-sm">
          <h2 className="text-base font-semibold mb-3">Bill Distribution (Last 6 Months)</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="bill" fill="#22C55E" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/70 dark:border-white/10 bg-white dark:bg-[#111827] p-5 shadow-sm">
          <h2 className="text-base font-semibold mb-3">Recommendations</h2>
          <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
            {(insights?.recommendations || []).map((item) => <li key={item} className="rounded-lg bg-slate-50 dark:bg-slate-800 p-3">{item}</li>)}
          </ul>
        </div>
      </section>
    </PageWrapper>

  if (!insights) {
    return (
      <div className="glass-panel p-6 rounded-2xl shadow page-transition">
        <h2 className="text-lg font-semibold mb-2">Insights</h2>

        <p className="text-slate-500 dark:text-slate-300">
          Upload energy data from Dashboard.
        </p>

        {insightsLoading && (
          <div className="mt-4 space-y-3 animate-pulse">
            <div className="h-4 bg-slate-200/70 dark:bg-slate-700/50 rounded" />
            <div className="h-4 bg-slate-200/70 dark:bg-slate-700/50 rounded w-3/4" />
            <div className="h-4 bg-slate-200/70 dark:bg-slate-700/50 rounded w-1/2" />
          </div>
        )}

        {error && <p className="text-red-400 mt-3">{error}</p>}
      </div>
    );
  }

  return (
    <div className="space-y-6 page-transition">
      {/* Top Stats */}
      <section className="grid gap-4 md:grid-cols-3">
        <div className="glass-panel p-5 rounded-2xl hover-lift">
          <p className="text-sm text-slate-500 dark:text-slate-300">
            Average Consumption
          </p>
          <p className="text-2xl font-semibold">{insights.average_consumption}</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl hover-lift">
          <p className="text-sm text-slate-500 dark:text-slate-300">
            Total Yearly Bill
          </p>
          <p className="text-2xl font-semibold">{insights.total_bill}</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl hover-lift">
          <p className="text-sm text-slate-500 dark:text-slate-300">
            Avg Rate per kWh
          </p>
          <p className="text-2xl font-semibold">{insights.avg_rate_per_kwh}</p>
        </div>
      </section>

      {/* Peak and Lowest */}
      <section className="grid gap-4 md:grid-cols-2">
        <div className="glass-panel p-5 rounded-2xl hover-lift">
          <p className="text-sm text-slate-500 dark:text-slate-300">Peak Month</p>
          <p className="text-xl font-semibold">{insights.peak_month}</p>
          <p className="text-sm text-slate-400">{insights.peak_value} kWh</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl hover-lift">
          <p className="text-sm text-slate-500 dark:text-slate-300">
            Lowest Month
          </p>
          <p className="text-xl font-semibold">{insights.lowest_month}</p>
          <p className="text-sm text-slate-400">{insights.lowest_value} kWh</p>
        </div>
      </section>

      {/* Recommendations */}
      <section className="glass-panel p-5 rounded-2xl hover-lift">
        <h2 className="text-lg font-semibold mb-3">Recommendations</h2>

        <ul className="list-disc list-inside space-y-2 text-slate-500 dark:text-slate-300">
          {insights.recommendations?.map((rec, index) => (
            <li key={index}>{rec}</li>
          ))}
        </ul>
      </section>

      {error && <p className="text-red-400">{error}</p>}
    </div>

  );
};

export default Insights;
