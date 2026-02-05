
import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import axios from 'axios';

import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState
} from "react";
import axios from "axios";


const PredictionContext = createContext(null);

const api = axios.create({

  baseURL: 'http://localhost:5000'

  baseURL: "http://localhost:5000",

});

export const PredictionProvider = ({ children }) => {
  const [forecastData, setForecastData] = useState({ actual: [], forecast: [] });
  const [insights, setInsights] = useState(null);
  const [history, setHistory] = useState([]);
  const [prediction, setPrediction] = useState(null);

  const [toasts, setToasts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);


  const [toasts, setToasts] = useState([]);

  const [error, setError] = useState(null);


  const [forecastLoading, setForecastLoading] = useState(false);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [predictLoading, setPredictLoading] = useState(false);

  const addToast = useCallback((type, message) => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, type, message }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 3500);
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const refreshForecast = useCallback(async () => {
    setForecastLoading(true);

    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/forecast');
      setForecastData(response.data);
    } catch (err) {
      setError('Unable to load forecast data.');
    } finally {
      setLoading(false);
      setForecastLoading(false);
    }
  }, []);

  const refreshInsights = useCallback(async () => {
    setInsightsLoading(true);
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/insights');
      setInsights(response.data.message ? null : response.data);
    } catch (err) {
      setError('Unable to load insights.');
    } finally {
      setLoading(false);
      setInsightsLoading(false);
    }
  }, []);

  const refreshHistory = useCallback(async () => {
    setHistoryLoading(true);
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/history');
      setHistory(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      setError('Unable to load history.');
    } finally {
      setLoading(false);
      setHistoryLoading(false);
    }
  }, []);

  const uploadData = useCallback(async (file) => {
    setUploadLoading(true);
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      await Promise.all([refreshForecast(), refreshInsights(), refreshHistory()]);
      addToast('success', 'CSV uploaded and forecast updated.');
    } catch (err) {
      setError('Upload failed. Please check the CSV format.');
      addToast('error', 'CSV upload failed. Please check the file format.');
    } finally {
      setLoading(false);
      setUploadLoading(false);
    }
  }, [addToast, refreshForecast, refreshInsights, refreshHistory]);

  const requestPrediction = useCallback(async (month) => {
    setPredictLoading(true);
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/predict', { month });
      setPrediction(response.data);
      addToast('success', 'Prediction generated successfully.');
    } catch (err) {
      setError('Unable to fetch prediction.');
      addToast('error', 'Prediction failed. Please try again.');
    } finally {
      setLoading(false);
      setPredictLoading(false);
    }
  }, [addToast]);

    setError(null);

    try {
      const response = await api.get("/forecast");
      setForecastData(response.data);
    } catch (err) {
      setError("Unable to load forecast data.");
      addToast("error", "Failed to load forecast data.");
    } finally {
      setForecastLoading(false);
    }
  }, [addToast]);

  const refreshInsights = useCallback(async () => {
    setInsightsLoading(true);
    setError(null);

    try {
      const response = await api.get("/insights");
      setInsights(response.data.message ? null : response.data);
    } catch (err) {
      setError("Unable to load insights.");
      addToast("error", "Failed to load insights.");
    } finally {
      setInsightsLoading(false);
    }
  }, [addToast]);

  const refreshHistory = useCallback(async () => {
    setHistoryLoading(true);
    setError(null);

    try {
      const response = await api.get("/history");
      setHistory(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      setError("Unable to load history.");
      addToast("error", "Failed to load history.");
    } finally {
      setHistoryLoading(false);
    }
  }, [addToast]);

  const uploadData = useCallback(
    async (file) => {
      setUploadLoading(true);
      setError(null);

      try {
        const formData = new FormData();
        formData.append("file", file);

        await api.post("/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        await Promise.all([refreshForecast(), refreshInsights(), refreshHistory()]);

        addToast("success", "CSV uploaded and dashboard updated.");
      } catch (err) {
        setError("Upload failed. Please check the CSV format.");
        addToast("error", "CSV upload failed. Please check the file format.");
      } finally {
        setUploadLoading(false);
      }
    },
    [addToast, refreshForecast, refreshInsights, refreshHistory]
  );

  const requestPrediction = useCallback(
    async (month) => {
      setPredictLoading(true);
      setError(null);

      try {
        const response = await api.post("/predict", { month });
        setPrediction(response.data);

        addToast("success", "Prediction generated successfully.");
      } catch (err) {
        setError("Unable to fetch prediction.");
        addToast("error", "Prediction failed. Please try again.");
      } finally {
        setPredictLoading(false);
      }
    },
    [addToast]
  );

  const loading =
    forecastLoading ||
    insightsLoading ||
    historyLoading ||
    uploadLoading ||
    predictLoading;


  const value = useMemo(
    () => ({
      forecastData,
      insights,
      history,
      prediction,

      toasts,
      loading,
      error,

      toasts,
      dismissToast,
      addToast,

      loading,
      error,


      forecastLoading,
      insightsLoading,
      historyLoading,
      uploadLoading,
      predictLoading,

      refreshForecast,
      refreshInsights,
      refreshHistory,
      uploadData,
      requestPrediction,

      dismissToast
n
    }),
    [
      forecastData,
      insights,
      history,
      prediction,
      toasts,

      dismissToast,
      addToast,

      loading,
      error,
      forecastLoading,
      insightsLoading,
      historyLoading,
      uploadLoading,
      predictLoading,
      refreshForecast,
      refreshInsights,
      refreshHistory,
      uploadData,
      requestPrediction,

      dismissToast
    ]
  );

  return <PredictionContext.Provider value={value}>{children}</PredictionContext.Provider>;

    ]
  );

  return (
    <PredictionContext.Provider value={value}>
      {children}
    </PredictionContext.Provider>
  );

};

export const usePrediction = () => {
  const context = useContext(PredictionContext);

  if (!context) {
    throw new Error('usePrediction must be used within PredictionProvider');
  }


  if (!context) {
    throw new Error("usePrediction must be used within PredictionProvider");
  }


  return context;
};
