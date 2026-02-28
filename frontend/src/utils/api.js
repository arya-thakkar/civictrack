import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5001/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("civictrack_token");

  // Only attach if it's a valid string and not already huge
  if (token && token !== "undefined" && token.length < 1000) {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    // If token is missing or corrupted, make sure the header is EMPTY
    delete config.headers.Authorization;
  }
  return config;
});

export default api;
