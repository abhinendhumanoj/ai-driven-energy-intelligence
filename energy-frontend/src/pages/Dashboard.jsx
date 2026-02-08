import React, { useEffect, useMemo, useState } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import toast from "react-hot-toast";
import {
  Activity,
  BarChart3,
  CircleDollarSign,
  Gauge,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

import UploadCard from "../components/UploadCard.jsx";
import StatCard from "../components/StatCard.jsx";
import ChartCard from "../components/ChartCard.jsx";
import PredictionForm from "../components/PredictionForm.jsx";
import PredictionResult from "../components/PredictionResult.jsx";
import ExportButton from "../components/ExportButton.jsx";
import PageWrapper from "../components/PageWrapper.jsx";

import { usePrediction } from "../context/PredictionContext.jsx";
import {
  calculateSummaryStats,
  downloadCsv,
  toNumber,
} from "../utils/dataHelpers.js";

const Dashboard = () => {
  const {
    forecastData,
    insights,
    prediction,
    refreshForecast,
    refreshInsights,
    uploadData,
    requestPrediction,
    uploadLoading,
    predictLoading,
  } = usePrediction();

  const [chartMode, setChartMode] = useState("both");

  useEffect(() => {
    refreshForecast();
    refreshInsights();
  }, [refreshForecast, refreshInsights]);

  const mergedChart = useMemo(() => {
    const actual = forecastData.actual || [];
    const forecast = forecastData.forecast || [];

    return [...actual, ...forecast].map((row) => ({
      month: row.month,
      consumption: toNumber(row.consumption),
      bill: toNumber(row.bill),
    }));
  }, [forecastData]);

  const stats = useMemo(() => {
    return calculateSummaryStats(forecastData.actual || [], insights);
  }, [forecastData.actual, insights]);

  const handleExportForecast = () => {
    const rows = mergedChart.map((row) => ({
      Month: row.month,
      Consumption_KWh: row.consumption,
      Bill_Amount: row.bill,
    }));

    downloadCsv("forecast_dataset.csv", rows, [
      "Month",
      "Consumption_KWh",
      "Bill_Amount",
    ]);

    toast.success("Forecast CSV exported.");
  };

  const handleExportPrediction = () => {
    if (!prediction) return toast.error("Generate prediction first.");

    downloadCsv(
      "prediction_result.csv",
      [
        {
          month: prediction.month,
          predicted_consumption: prediction.predicted_consumption,
          predicted_bill: prediction.predicted_bill,
          confidence: prediction.confidence,
        },
      ],
      ["month", "predicted_consumption", "predicted_bill", "confidence"]
    );

    toast.success("Prediction CSV exported.");
  };

  const predictionConsumption = toNumber(prediction?.predicted_consumption);
  const predictionBill = toNumber(prediction?.predicted_bill);

  const barData = [
    { name: "Consumption", value: predictionConsumption },
    { name: "Bill", value: predictionBill },
  ];

  const pieData = barData;

  const trendData = [
    ...(forecastData.actual || [])
      .slice(-6)
      .map((row) => ({ month: row.month, consumption: toNumber(row.consumption) })),
    ...(prediction
      ? [
          {
            month: prediction.month,
            consumption: predictionConsumption,
            predicted: true,
          },
        ]
      : []),
  ];

  return (
    <PageWrapper className="space-y-6">
      {/* Upload + Stats */}
      <section className="grid gap-4 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <UploadCard
            onUpload={uploadData}
            loading={uploadLoading}
            onInvalidFile={() =>
              toast.error("Invalid file. Please select a .csv file.")
            }
          />
        </div>

        <div className="lg:col-span-3 grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
          <StatCard
            icon={Gauge}
            label="Total Consumption"
            value={`${stats.totalConsumption.toFixed(0)} kWh`}
          />
          <StatCard
            icon={Activity}
            label="Avg Monthly Consumption"
            value={`${stats.averageConsumption.toFixed(2)} kWh`}
          />
          <StatCard icon={TrendingUp} label="Peak Month" value={stats.peakMonth} />
          <StatCard
            icon={TrendingDown}
            label="Lowest Month"
            value={stats.lowestMonth}
          />
          <StatCard
            icon={CircleDollarSign}
            label="Total Bill Amount"
            value={`₹${stats.totalBill.toFixed(2)}`}
          />
          <StatCard
            icon={BarChart3}
            label="Avg Cost per kWh"
            value={`₹${toNumber(stats.avgRate).toFixed(3)}`}
          />
        </div>
      </section>

      {/* Main Forecast Chart */}
      <ChartCard
        data={mergedChart}
        chartMode={chartMode}
        onModeChange={setChartMode}
      />

      {/* Prediction */}
      <div className="grid gap-4 lg:grid-cols-2">
        <PredictionForm onPredict={requestPrediction} loading={predictLoading} />
        <PredictionResult
          prediction={prediction}
          lastActualConsumption={(forecastData.actual || []).slice(-1)[0]?.consumption}
        />
      </div>

      {/* Export Buttons */}
      <div className="flex flex-wrap gap-3">
        <ExportButton label="Export Forecast CSV" onClick={handleExportForecast} />
        <ExportButton
          label="Export Prediction CSV"
          onClick={handleExportPrediction}
        />
      </div>

      {/* Prediction Visualizations */}
      <section className="rounded-2xl border border-slate-200/70 dark:border-white/10 bg-white dark:bg-[#111827] p-5 shadow-sm">
        <h2 className="text-base font-semibold mb-3">Prediction Visualizations</h2>

        {!prediction ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Generate prediction to view charts.
          </p>
        ) : (
          <div className="grid gap-4 lg:grid-cols-3">
            {/* Bar Chart */}
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(148,163,184,0.2)"
                  />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar
                    dataKey="value"
                    fill="#3B82F6"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Pie Chart */}
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" label>
                    <Cell fill="#3B82F6" />
                    <Cell fill="#22C55E" />
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Trend Chart */}
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(148,163,184,0.2)"
                  />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="consumption"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    dot={(props) => {
                      const { cx, cy, payload } = props;

                      if (payload?.predicted) {
                        return (
                          <circle
                            cx={cx}
                            cy={cy}
                            r={6}
                            fill="#22C55E"
                            stroke="#fff"
                          />
                        );
                      }

                      return <circle cx={cx} cy={cy} r={3} fill="#3B82F6" />;
                    }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </section>
    </PageWrapper>
  );
};

export default Dashboard;
