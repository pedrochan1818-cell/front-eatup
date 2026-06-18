import axios from "axios";

export const STORAGE_URL = "https://back-eatup.onrender.com";
{/*
VITE_STORAGE_URL=https://back-eatup.onrender.com
*/}

const api = axios.create({
  baseURL: "https://back-eatup.onrender.com",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

export default api;