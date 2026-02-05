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
    }
  }, []);

  const refreshInsights = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/insights');
      setInsights(response.data.message ? null : response.data);
    } catch (err) {
      setError('Unable to load insights.');
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshHistory = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/history');
      setHistory(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      setError('Unable to load history.');
    } finally {
      setLoading(false);
    }
  }, []);

  const uploadData = useCallback(async (file) => {
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      await Promise.all([refreshForecast(), refreshInsights(), refreshHistory()]);
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
      loading,
      error,
      refreshForecast,
      refreshInsights,
      refreshHistory,
      uploadData,
      requestPrediction
    }),
    [
      forecastData,
      insights,
      history,
      prediction,
      loading,
      error,
      refreshForecast,
      refreshInsights,
      refreshHistory,
      uploadData,
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
