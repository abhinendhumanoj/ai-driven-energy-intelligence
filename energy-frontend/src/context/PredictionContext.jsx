import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import axios from "axios";
import toast from "react-hot-toast";

const PredictionContext = createContext(null);

const api = axios.create({
  baseURL: "http://localhost:5000",
});

export const PredictionProvider = ({ children }) => {
  const [forecastData, setForecastData] = useState({ actual: [], forecast: [] });
  const [insights, setInsights] = useState(null);
  const [history, setHistory] = useState([]);
  const [prediction, setPrediction] = useState(null);

  const [error, setError] = useState(null);

  const [forecastLoading, setForecastLoading] = useState(false);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [predictLoading, setPredictLoading] = useState(false);

  const refreshForecast = useCallback(async () => {
    setForecastLoading(true);
    setError(null);

    try {
      const response = await api.get("/forecast");
      setForecastData(response.data);
    } catch (err) {
      setError("Unable to load forecast data.");
      toast.error("Failed to load forecast data.");
    } finally {
      setForecastLoading(false);
    }
  }, []);

  const refreshInsights = useCallback(async () => {
    setInsightsLoading(true);
    setError(null);

    try {
      const response = await api.get("/insights");
      setInsights(response.data.message ? null : response.data);
    } catch (err) {
      setError("Unable to load insights.");
      toast.error("Failed to load insights.");
    } finally {
      setInsightsLoading(false);
    }
  }, []);

  const refreshHistory = useCallback(async () => {
    setHistoryLoading(true);
    setError(null);

    try {
      const response = await api.get("/history");
      setHistory(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      setError("Unable to load history.");
      toast.error("Failed to load history.");
    } finally {
      setHistoryLoading(false);
    }
  }, []);

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

        toast.success("CSV uploaded successfully!");
      } catch (err) {
        setError("Upload failed. Please check the CSV format.");
        toast.error("CSV upload failed. Please check the file format.");
      } finally {
        setUploadLoading(false);
      }
    },
    [refreshForecast, refreshInsights, refreshHistory]
  );

  const requestPrediction = useCallback(async (month) => {
    setPredictLoading(true);
    setError(null);

    try {
      const response = await api.post("/predict", { month });
      setPrediction(response.data);
      toast.success("Prediction generated successfully!");
    } catch (err) {
      setError("Unable to fetch prediction.");
      toast.error("Prediction failed. Please try again.");
    } finally {
      setPredictLoading(false);
    }
  }, []);

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
    }),
    [
      forecastData,
      insights,
      history,
      prediction,
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
    throw new Error("usePrediction must be used within PredictionProvider");
  }

  return context;
};
