import axios from "axios";
import config from "../config/index.js";

const api = axios.create({
  baseURL: config.API_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json"
  }
});

export default api;