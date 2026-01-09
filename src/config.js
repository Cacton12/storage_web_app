// src/config.js
export const API_BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://storagewebappbackend-production.up.railway.app" // your production backend
    : "http://localhost:8080";         // local dev backend
