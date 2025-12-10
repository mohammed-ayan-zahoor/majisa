import axios from 'axios';

// Use relative URL for production, simple localhost for local dev if needed
const isProduction = import.meta.env.PROD;
const api = axios.create({
    baseURL: isProduction ? '/api' : 'http://localhost:5000/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to add the auth token to every request
api.interceptors.request.use(
    (config) => {
        const user = localStorage.getItem('majisa_user');
        if (user) {
            const { token } = JSON.parse(user);
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
