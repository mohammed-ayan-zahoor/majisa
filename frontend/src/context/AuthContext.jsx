import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check local storage for persisted session
        const storedUser = localStorage.getItem('majisa_user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = async (role, email, password) => {
        try {
            const { data } = await api.post('/users/login', { email, password });

            // Verify role matches
            if (data.role !== role) {
                // Allow admin to login as customer/vendor for testing if needed, OR enforce strictness.
                // User requested strictness: "i entered admin credentials and it logged me in as vendor?"
                // So we enforce strict check.
                if (role !== 'admin' && data.role === 'admin') {
                    // Admin trying to login as vendor/customer - BLOCK IT based on user request
                    throw new Error(`Please login via Admin Portal`);
                }

                if (data.role !== role) {
                    throw new Error(`Unauthorized. This login is for ${role}s only.`);
                }
            }

            setUser(data);
            localStorage.setItem('majisa_user', JSON.stringify(data));
            toast.success(`Welcome back, ${data.name}!`);
            return data;
        } catch (error) {
            const message = error.response?.data || 'Login failed';
            toast.error(message);
            throw new Error(message);
        }
    };

    const register = async (userData) => {
        try {
            const { data } = await api.post('/users', userData);
            setUser(data);
            localStorage.setItem('majisa_user', JSON.stringify(data));
            toast.success('Registration successful!');
            return data;
        } catch (error) {
            const message = error.response?.data || 'Registration failed';
            toast.error(message);
            throw new Error(message);
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('majisa_user');
        toast.success('Logged out successfully');
    };

    const updateUser = (userData) => {
        setUser(userData);
        localStorage.setItem('majisa_user', JSON.stringify(userData));
    };

    const value = React.useMemo(() => ({
        user,
        login,
        register,
        logout,
        updateUser,
        isAuthenticated: !!user,
        loading
    }), [user, loading]);

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
