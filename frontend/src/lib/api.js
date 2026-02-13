import axios from "axios";

const API_BASE = process.env.REACT_APP_BACKEND_URL 
  ? `${process.env.REACT_APP_BACKEND_URL}/api`
  : "/api";

export const api = axios.create({
  baseURL: API_BASE,
});
