import React, { useEffect, useMemo, useState } from 'react';
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
  CartesianGrid
} from 'recharts';
import { usePrediction } from '../context/PredictionContext.jsx';

const Dashboard = () => {
  const {
    forecastData,
    prediction,
    loading,
    error,
    refreshForecast,
    uploadData,
    requestPrediction
  } = usePrediction();
  const [file, setFile] = useState(null);
  const [month, setMonth] = useState('');

  useEffect(() => {
    refreshForecast();
  }, [refreshForecast]);

  const chartData = useMemo(() => {
    const actual = forecastData.actual || [];
    const forecast = forecastData.forecast || [];
    const merged = [...actual.map((row) => ({ ...row, type: 'actual' }))];
    forecast.forEach((row) => {
      merged.push({ ...row, type: 'forecast' });
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

  return (
    <div className="space-y-6">
      <section className="bg-slate-900 p-4 rounded-xl shadow">
        <h2 className="text-lg font-semibold mb-3">Upload Energy CSV</h2>
        <form className="flex flex-col sm:flex-row gap-3" onSubmit={handleUpload}>
          <input
            type="file"
            accept=".csv"
            onChange={(event) => setFile(event.target.files[0])}
            className="flex-1 bg-slate-800 p-2 rounded"
          />
          <button type="submit" className="bg-emerald-400 text-slate-900 px-4 py-2 rounded">
            Upload
          </button>
        </form>
      </section>

      <section className="bg-slate-900 p-4 rounded-xl shadow">
        <h2 className="text-lg font-semibold mb-3">Actual vs Forecast</h2>
        {chartData.length === 0 ? (
          <p className="text-slate-300">Upload energy data to view the forecast.</p>
        ) : (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="month" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="consumption"
                  name="Consumption (kWh)"
                  stroke="#38bdf8"
                  strokeWidth={2}
                />
                <Line type="monotone" dataKey="bill" name="Bill Amount" stroke="#facc15" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>

      <section className="bg-slate-900 p-4 rounded-xl shadow">
        <h2 className="text-lg font-semibold mb-3">Predict Future Month</h2>
        <form className="flex flex-col sm:flex-row gap-3" onSubmit={handlePredict}>
          <input
            className="flex-1 bg-slate-800 p-2 rounded"
            placeholder="Oct-26 / October, 2026 / 2026-10"
            value={month}
            onChange={(event) => setMonth(event.target.value)}
          />
          <button type="submit" className="bg-emerald-400 text-slate-900 px-4 py-2 rounded">
            Predict
          </button>
        </form>

        {prediction && (
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="bg-slate-800 p-3 rounded">
              <p className="text-sm text-slate-300">Predicted Consumption (kWh)</p>
              <p className="text-xl font-semibold">{prediction.predicted_consumption}</p>
            </div>
            <div className="bg-slate-800 p-3 rounded">
              <p className="text-sm text-slate-300">Predicted Bill</p>
              <p className="text-xl font-semibold">{prediction.predicted_bill}</p>
            </div>
            <div className="bg-slate-800 p-3 rounded">
              <p className="text-sm text-slate-300">Confidence</p>
              <p className="text-xl font-semibold">{prediction.confidence}</p>
            </div>
            <div className="bg-slate-800 p-3 rounded">
              <p className="text-sm text-slate-300">Model</p>
              <p className="text-sm font-semibold">{prediction.model_used}</p>
            </div>
          </div>
        )}
      </section>

      {loading && <p className="text-emerald-300">Loading...</p>}
      {error && <p className="text-red-400">{error}</p>}
    </div>
  );
};

export default Dashboard;
