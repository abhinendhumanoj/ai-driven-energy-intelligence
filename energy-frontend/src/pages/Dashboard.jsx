
import React, { useEffect, useMemo, useState } from 'react';
import { Activity, BarChart3, CircleDollarSign, Gauge, TrendingDown, TrendingUp } from 'lucide-react';
import { Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Bar, BarChart } from 'recharts';
import toast from 'react-hot-toast';
import UploadCard from '../components/UploadCard.jsx';
import StatCard from '../components/StatCard.jsx';
import ChartCard from '../components/ChartCard.jsx';
import PredictionForm from '../components/PredictionForm.jsx';
import PredictionResult from '../components/PredictionResult.jsx';
import ExportButton from '../components/ExportButton.jsx';
import PageWrapper from '../components/PageWrapper.jsx';
import { usePrediction } from '../context/PredictionContext.jsx';
import { calculateSummaryStats, downloadCsv, toNumber } from '../utils/dataHelpers.js';

import React, { useEffect, useMemo, useState } from "react";
import {
  Line,
  LineChart,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
  CartesianGrid,
} from "recharts";

import { usePrediction } from "../context/PredictionContext.jsx";
import LoadingSpinner from "../components/LoadingSpinner.jsx";


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
    predictLoading
  } = usePrediction();
  const [chartMode, setChartMode] = useState('both');

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
      bill: toNumber(row.bill)
    }));
  }, [forecastData]);

  const stats = useMemo(() => calculateSummaryStats(forecastData.actual || [], insights), [forecastData.actual, insights]);

  const handleExportForecast = () => {
    const rows = mergedChart.map((row) => ({ Month: row.month, Consumption_KWh: row.consumption, Bill_Amount: row.bill }));
    downloadCsv('forecast_dataset.csv', rows, ['Month', 'Consumption_KWh', 'Bill_Amount']);
    toast.success('Forecast CSV exported.');
  };

  const handleExportPrediction = () => {
    if (!prediction) return toast.error('Generate prediction first.');
    downloadCsv('prediction_result.csv', [{
      month: prediction.month,
      predicted_consumption: prediction.predicted_consumption,
      predicted_bill: prediction.predicted_bill,
      confidence: prediction.confidence
    }], ['month', 'predicted_consumption', 'predicted_bill', 'confidence']);
    toast.success('Prediction CSV exported.');
  };

  const predictionConsumption = toNumber(prediction?.predicted_consumption);
  const predictionBill = toNumber(prediction?.predicted_bill);
  const barData = [
    { name: 'Consumption', value: predictionConsumption },
    { name: 'Bill', value: predictionBill }
  ];
  const pieData = barData;
  const trendData = [
    ...(forecastData.actual || []).slice(-6).map((row) => ({ month: row.month, consumption: toNumber(row.consumption) })),
    ...(prediction ? [{ month: prediction.month, consumption: predictionConsumption, predicted: true }] : [])
  ];

  return (
    <PageWrapper className="space-y-6">
      <section className="grid gap-4 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <UploadCard onUpload={uploadData} loading={uploadLoading} onInvalidFile={() => toast.error('Invalid file. Please select a .csv')} />
        </div>
        <div className="lg:col-span-3 grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
          <StatCard icon={Gauge} label="Total Consumption" value={`${stats.totalConsumption.toFixed(0)} kWh`} />
          <StatCard icon={Activity} label="Avg Monthly Consumption" value={`${stats.averageConsumption.toFixed(2)} kWh`} />
          <StatCard icon={TrendingUp} label="Peak Month" value={stats.peakMonth} />
          <StatCard icon={TrendingDown} label="Lowest Month" value={stats.lowestMonth} />
          <StatCard icon={CircleDollarSign} label="Total Bill Amount" value={`₹${stats.totalBill.toFixed(2)}`} />
          <StatCard icon={BarChart3} label="Avg Cost per kWh" value={`₹${toNumber(stats.avgRate).toFixed(3)}`} />
        </div>
      </section>

      <ChartCard data={mergedChart} chartMode={chartMode} onModeChange={setChartMode} />

      <div className="grid gap-4 lg:grid-cols-2">
        <PredictionForm onPredict={requestPrediction} loading={predictLoading} />
        <PredictionResult prediction={prediction} lastActualConsumption={(forecastData.actual || []).slice(-1)[0]?.consumption} />
      </div>

      <div className="flex flex-wrap gap-3">
        <ExportButton label="Export Forecast CSV" onClick={handleExportForecast} />
        <ExportButton label="Export Prediction CSV" onClick={handleExportPrediction} />
      </div>

      <section className="rounded-2xl border border-slate-200/70 dark:border-white/10 bg-white dark:bg-[#111827] p-5 shadow-sm">
        <h2 className="text-base font-semibold mb-3">Prediction Visualizations</h2>
        {!prediction ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">Generate prediction to view charts.</p>
        ) : (
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3B82F6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
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
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="consumption" stroke="#3B82F6" strokeWidth={2} dot={(props) => <circle {...props} r={props.payload?.predicted ? 6 : 3} fill={props.payload?.predicted ? '#22C55E' : '#3B82F6'} />} />
                </LineChart>
              </ResponsiveContainer>

    prediction,

    loading,
    error,

    uploadLoading,
    predictLoading,
    forecastLoading,

    refreshForecast,
    uploadData,
    requestPrediction,
  } = usePrediction();

  const [file, setFile] = useState(null);
  const [month, setMonth] = useState("");

  useEffect(() => {
    refreshForecast();
  }, [refreshForecast]);

  const chartData = useMemo(() => {
    const actual = forecastData.actual || [];
    const forecast = forecastData.forecast || [];

    const merged = [...actual.map((row) => ({ ...row, type: "actual" }))];

    forecast.forEach((row) => {
      merged.push({ ...row, type: "forecast" });
    });

    return merged;
  }, [forecastData]);

  const handleUpload = async (event) => {
    event.preventDefault();
    if (file) {
      await uploadData(file);
    }
  };

  const handlePredict = async (event) => {
    event.preventDefault();
    if (month.trim()) {
      await requestPrediction(month.trim());
    }
  };

  const predictionConsumption = Number(prediction?.predicted_consumption || 0);
  const predictionBill = Number(prediction?.predicted_bill || 0);

  const barData = [
    { name: "Consumption (kWh)", value: predictionConsumption },
    { name: "Bill Amount", value: predictionBill },
  ];

  const pieData = [
    { name: "Consumption", value: predictionConsumption },
    { name: "Bill", value: predictionBill },
  ];

  const pieColors = ["#38bdf8", "#facc15"];

  const trendData = useMemo(() => {
    if (!prediction) return [];

    const actual = forecastData.actual || [];

    const recent = actual.slice(-6).map((row) => ({
      month: row.month,
      consumption: Number(row.consumption || 0),
    }));

    return [
      ...recent,
      {
        month: prediction.month || "Predicted",
        consumption: predictionConsumption,
        predicted: true,
      },
    ];
  }, [forecastData, prediction, predictionConsumption]);

  return (
    <div className="space-y-6 page-transition">
      {/* Upload Section */}
      <section className="glass-panel p-5 rounded-2xl hover-lift">
        <div className="flex flex-col gap-2 mb-4">
          <h2 className="text-lg font-semibold">Upload Energy CSV</h2>
          <p className="text-sm text-slate-500 dark:text-slate-300">
            Upload the latest monthly data to refresh forecasts and insights.
          </p>
        </div>

        <form className="flex flex-col sm:flex-row gap-3" onSubmit={handleUpload}>
          <input
            type="file"
            accept=".csv"
            onChange={(event) => setFile(event.target.files[0])}
            className="flex-1 bg-white/80 dark:bg-slate-800/80 p-3 rounded-xl border border-slate-200/60 dark:border-slate-700/50"
          />

          <button
            type="submit"
            disabled={uploadLoading}
            className="bg-emerald-400 text-slate-900 px-5 py-3 rounded-xl font-semibold transition hover:-translate-y-0.5 hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {uploadLoading ? <LoadingSpinner size={18} /> : "Upload"}
          </button>
        </form>
      </section>

      {/* Forecast Chart */}
      <section className="glass-panel p-5 rounded-2xl hover-lift">
        <h2 className="text-lg font-semibold mb-3">Actual vs Forecast</h2>

        {forecastLoading && chartData.length === 0 ? (
          <div className="h-80 flex items-center justify-center text-slate-400">
            <LoadingSpinner size={28} />
          </div>
        ) : chartData.length === 0 ? (
          <p className="text-slate-500 dark:text-slate-300">
            Upload energy data to view the forecast.
          </p>
        ) : (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#cbd5f5" />
                <XAxis dataKey="month" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip />
                <Legend />

                <Line
                  type="monotone"
                  dataKey="consumption"
                  name="Consumption (kWh)"
                  stroke="#38bdf8"
                  strokeWidth={2}
                />

                <Line
                  type="monotone"
                  dataKey="bill"
                  name="Bill Amount"
                  stroke="#facc15"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>

      {/* Prediction Section */}
      <section className="glass-panel p-5 rounded-2xl hover-lift">
        <h2 className="text-lg font-semibold mb-3">Predict Future Month</h2>

        <form className="flex flex-col sm:flex-row gap-3" onSubmit={handlePredict}>
          <input
            className="flex-1 bg-white/80 dark:bg-slate-800/80 p-3 rounded-xl border border-slate-200/60 dark:border-slate-700/50"
            placeholder="Oct-26 / October, 2026 / 2026-10"
            value={month}
            onChange={(event) => setMonth(event.target.value)}
          />

          <button
            type="submit"
            disabled={predictLoading}
            className="bg-emerald-400 text-slate-900 px-5 py-3 rounded-xl font-semibold transition hover:-translate-y-0.5 hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {predictLoading ? <LoadingSpinner size={18} /> : "Predict"}
          </button>
        </form>

        {prediction && (
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="glass-panel p-4 rounded-xl hover-lift">
              <p className="text-sm text-slate-500 dark:text-slate-300">
                Predicted Consumption (kWh)
              </p>
              <p className="text-2xl font-semibold">
                {prediction.predicted_consumption}
              </p>
            </div>

            <div className="glass-panel p-4 rounded-xl hover-lift">
              <p className="text-sm text-slate-500 dark:text-slate-300">Predicted Bill</p>
              <p className="text-2xl font-semibold">{prediction.predicted_bill}</p>
            </div>

            <div className="glass-panel p-4 rounded-xl hover-lift">
              <p className="text-sm text-slate-500 dark:text-slate-300">Confidence</p>
              <p className="text-2xl font-semibold">{prediction.confidence}</p>
            </div>

            <div className="glass-panel p-4 rounded-xl hover-lift">
              <p className="text-sm text-slate-500 dark:text-slate-300">Model</p>
              <p className="text-sm font-semibold">{prediction.model_used}</p>
            </div>
          </div>
        )}
      </section>

      {/* New Visualization Section */}
      <section className="glass-panel p-5 rounded-2xl hover-lift">
        <h2 className="text-lg font-semibold mb-3">Prediction Visualization</h2>

        {!prediction ? (
          <p className="text-slate-500 dark:text-slate-300">
            Generate prediction to view charts.
          </p>
        ) : (
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Bar Chart */}
            <div className="glass-panel p-4 rounded-2xl hover-lift">
              <p className="text-sm text-slate-500 dark:text-slate-300 mb-2">
                Consumption vs Bill
              </p>

              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#cbd5f5" />
                    <XAxis dataKey="name" stroke="#64748b" />
                    <YAxis stroke="#64748b" />
                    <Tooltip />
                    <Bar dataKey="value" fill="#38bdf8" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Pie Chart */}
            <div className="glass-panel p-4 rounded-2xl hover-lift">
              <p className="text-sm text-slate-500 dark:text-slate-300 mb-2">
                Share Distribution
              </p>

              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label
                    >
                      {pieData.map((entry, index) => (
                        <Cell
                          key={`cell-${entry.name}`}
                          fill={pieColors[index % pieColors.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Line Chart Trend */}
            <div className="glass-panel p-4 rounded-2xl hover-lift">
              <p className="text-sm text-slate-500 dark:text-slate-300 mb-2">
                Recent Consumption Trend
              </p>

              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#cbd5f5" />
                    <XAxis dataKey="month" stroke="#64748b" />
                    <YAxis stroke="#64748b" />
                    <Tooltip />

                    <Line
                      type="monotone"
                      dataKey="consumption"
                      stroke="#38bdf8"
                      strokeWidth={2}
                      dot={(props) => {
                        const { cx, cy, payload } = props;

                        if (payload?.predicted) {
                          return (
                            <circle
                              cx={cx}
                              cy={cy}
                              r={6}
                              fill="#f97316"
                              stroke="#fff"
                            />
                          );
                        }

                        return <circle cx={cx} cy={cy} r={4} fill="#38bdf8" />;
                      }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

            </div>
          </div>
        )}
      </section>
    </PageWrapper>


      {loading && <p className="text-emerald-500">Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}
    </div>

  );
};

export default Dashboard;
