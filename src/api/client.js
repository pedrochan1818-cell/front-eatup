import axios from "axios";

export const STORAGE_URL = "http://127.0.0.1:8000";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

export default api;