import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import axios from 'axios';

const PredictionContext = createContext(null);

const api = axios.create({
  baseURL: 'http://localhost:5000'
});

export const PredictionProvider = ({ children }) => {
  const [forecastData, setForecastData] = useState({ actual: [], forecast: [] });
  const [insights, setInsights] = useState(null);
  const [history, setHistory] = useState([]);
  const [prediction, setPrediction] = useState(null);

  const [toasts, setToasts] = useState([]);
  const [loading, setLoading] = useState(false);
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

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const refreshForecast = useCallback(async () => {

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

    } catch (err) {
      setError('Upload failed. Please check the CSV format.');
    } finally {
      setLoading(false);
    }
  }, [refreshForecast, refreshInsights, refreshHistory]);

  const requestPrediction = useCallback(async (month) => {

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

    } catch (err) {
      setError('Unable to fetch prediction.');
    } finally {
      setLoading(false);
    }
  }, []);


  const value = useMemo(
    () => ({
      forecastData,
      insights,
      history,
      prediction,

      toasts,
      loading,
      error,
      forecastLoading,
      insightsLoading,
      historyLoading,
      uploadLoading,
      predictLoading,

      loading,
      error,

      refreshForecast,
      refreshInsights,
      refreshHistory,
      uploadData,

      requestPrediction,
      dismissToast

      requestPrediction

    }),
    [
      forecastData,
      insights,
      history,
      prediction,

      toasts,
      loading,
      error,
      forecastLoading,
      insightsLoading,
      historyLoading,
      uploadLoading,
      predictLoading,

      loading,
      error,

      refreshForecast,
      refreshInsights,
      refreshHistory,
      uploadData,
 
      requestPrediction,
      dismissToast

      requestPrediction

    ]
  );

  return <PredictionContext.Provider value={value}>{children}</PredictionContext.Provider>;
};

export const usePrediction = () => {
  const context = useContext(PredictionContext);
  if (!context) {
    throw new Error('usePrediction must be used within PredictionProvider');
  }
  return context;
};
