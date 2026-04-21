import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  const selectedYear = localStorage.getItem("selectedYear");
  if (selectedYear) {
    try {
      const yearData = JSON.parse(selectedYear);
      config.headers["x-year-id"] = yearData.year_id || yearData.id;
    } catch (e) {
      console.error("Year parsing error:", e);
    }
  }
  return config;
});

export default api;
