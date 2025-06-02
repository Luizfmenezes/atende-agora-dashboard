
// Client-side API configuration only
// Server-side database config is now in src/server/config/sqlserver.js

export const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
  endpoints: {
    auth: '/auth',
    users: '/users',
    attendances: '/attendances',
    sectors: '/sectors'
  }
};
