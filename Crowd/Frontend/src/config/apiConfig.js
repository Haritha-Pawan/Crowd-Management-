/**
 * API Configuration
 * Dynamically sets the API base URL based on environment
 * - In development: http://localhost:5000
 * - In production: Uses VITE_API_BASE_URL environment variable
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export { API_BASE_URL, SOCKET_URL };
