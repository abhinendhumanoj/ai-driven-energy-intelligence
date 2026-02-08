import React, { useEffect, useMemo } from "react";
import toast from "react-hot-toast";
import jsPDF from "jspdf";
import {
  BarChart,
  Bar,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { FileText, Lightbulb, TrendingUp, Wallet } from "lucide-react";

import { usePrediction } from "../context/PredictionContext.jsx";
import ExportButton from "../components/ExportButton.jsx";
import StatCard from "../components/StatCard.jsx";
import PageWrapper from "../components/PageWrapper.jsx";
import { toNumber } from "../utils/dataHelpers.js";

const Insights = () => {
  const { insights, refreshInsights, forecastData, insightsLoading } =
    usePrediction();

  useEffect(() => {
    refreshInsights();
  }, [refreshInsights]);

  const chartData = useMemo(() => {
    const actual = forecastData.actual || [];
    return actual.slice(-6).map((item) => ({
      month: item.month,
      bill: toNumber(item.bill),
      consumption: toNumber(item.consumption),
    }));
  }, [forecastData.actual]);

  const exportPdf = () => {
    if (!insights) return toast.error("No insights to export.");

    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Energy Insights Summary", 20, 20);

    doc.setFontSize(12);
    doc.text(`Average Consumption: ${insights.average_consumption || "N/A"}`, 20, 35);
    doc.text(`Peak Month: ${insights.peak_month || "N/A"}`, 20, 45);
    doc.text(`Lowest Month: ${insights.lowest_month || "N/A"}`, 20, 55);
    doc.text(`Total Bill: ${insights.total_bill || "N/A"}`, 20, 65);
    doc.text(`Avg Rate/kWh: ${insights.avg_rate_per_kwh || "N/A"}`, 20, 75);

    doc.text("Recommendations:", 20, 90);

    const recs = insights.recommendations || [];
    recs.forEach((rec, index) => {
      doc.text(`- ${rec}`, 24, 100 + index * 10);
    });

    doc.save("insights-summary.pdf");
    toast.success("Insights PDF exported.");
  };

  if (!insights && !insightsLoading) {
    return (
      <PageWrapper className="space-y-4">
        <div className="rounded-2xl border border-slate-200/70 dark:border-white/10 bg-white dark:bg-[#111827] p-6 shadow-sm">
          <p className="text-slate-500 dark:text-slate-400">
            Upload energy data from Dashboard to generate insights.
          </p>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper className="space-y-6">
      <div className="flex justify-end">
        <ExportButton label="Export Insights PDF" onClick={exportPdf} />
      </div>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={TrendingUp}
          label="Avg Consumption"
          value={insightsLoading ? "Loading..." : insights?.average_consumption || "N/A"}
          subtitle="Average monthly kWh"
        />

        <StatCard
          icon={Wallet}
          label="Total Bill"
          value={insightsLoading ? "Loading..." : `₹${insights?.total_bill || 0}`}
          subtitle="Total bill amount"
        />

        <StatCard
          icon={FileText}
          label="Peak Month"
          value={insightsLoading ? "Loading..." : insights?.peak_month || "N/A"}
          subtitle="Highest usage month"
        />

        <StatCard
          icon={Lightbulb}
          label="Avg Rate / kWh"
          value={insightsLoading ? "Loading..." : insights?.avg_rate_per_kwh || "N/A"}
          subtitle="Efficiency benchmark"
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200/70 dark:border-white/10 bg-white dark:bg-[#111827] p-5 shadow-sm">
          <h2 className="text-base font-semibold mb-3">
            Bill Distribution (Last 6 Months)
          </h2>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(148,163,184,0.2)"
                />
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
            {(insights?.recommendations || []).length === 0 ? (
              <p>No recommendations available.</p>
            ) : (
              insights.recommendations.map((item, index) => (
                <li
                  key={index}
                  className="rounded-lg bg-slate-50 dark:bg-slate-800 p-3"
                >
                  {item}
                </li>
              ))
            )}
          </ul>
        </div>
      </section>
    </PageWrapper>
  );
};

export default Insights;
