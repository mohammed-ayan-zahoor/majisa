import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * ProtectedRoute component to guard routes based on user authentication and roles.
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - The component to render if authorized
 * @param {Array<string>} props.allowedRoles - List of roles permitted to access the route
 */
const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user, loading } = useAuth();
    const location = useLocation();

    // Show nothing or a loading spinner while checking auth status
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-500"></div>
            </div>
        );
    }

    // Not logged in
    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Role not authorized
    if (allowedRoles && !allowedRoles.includes(user.role)) {
        // Redirect based on role or to home
        const redirectTo = user.role === 'admin' ? '/admin/dashboard' : '/';
        return <Navigate to={redirectTo} replace />;
    }

    return children;
};

export default ProtectedRoute;
