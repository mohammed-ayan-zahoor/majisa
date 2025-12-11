import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const PageTitleUpdater = () => {
    const location = useLocation();

    const routeTitles = {
        '/': 'Majisa - Home',
        '/products': 'Majisa - Products',
        '/about': 'About Us - Majisa',
        '/contact': 'Contact Us - Majisa',
        '/cart': 'Shopping Cart - Majisa',
        '/login': 'Login - Majisa',
        '/vendor-register': 'Vendor Registration - Majisa',
        '/forgotpassword': 'Forgot Password - Majisa',

        // Admin Routes
        '/admin/dashboard': 'Admin Dashboard - Majisa',
        '/admin/products': 'Manage Products - Majisa Admin',
        '/admin/products/new': 'Add Product - Majisa Admin',
        '/admin/orders': 'Manage Orders - Majisa Admin',
        '/admin/vendors': 'Manage Vendors - Majisa Admin',
        '/admin/goldsmiths': 'Manage Goldsmiths - Majisa Admin',
        '/admin/visits': 'Customer Visits - Majisa Admin',
        '/admin/categories': 'Manage Categories - Majisa Admin',
        '/admin/notifications': 'Notifications - Majisa Admin',
        '/admin/settings': 'Settings - Majisa Admin',

        // Vendor Routes
        '/vendor/dashboard': 'Vendor Dashboard - Majisa',
        '/vendor/place-order': 'Place Order - Majisa Vendor',
        '/vendor/orders': 'My Orders - Majisa Vendor',
        '/vendor/profile': 'My Profile - Majisa Vendor',

        // Goldsmith Routes
        '/goldsmith/dashboard': 'Goldsmith Dashboard - Majisa',
        '/goldsmith/jobs': 'My Jobs - Majisa Goldsmith',
    };

    useEffect(() => {
        const path = location.pathname;

        // Check for exact match first
        let title = routeTitles[path];

        // If no exact match, check for dynamic routes
        if (!title) {
            if (path.startsWith('/product/')) {
                title = 'Product Details - Majisa';
            } else if (path.startsWith('/admin/orders/')) {
                title = 'Order Details - Majisa Admin';
            } else if (path.startsWith('/admin/products/edit/')) {
                title = 'Edit Product - Majisa Admin';
            } else if (path.startsWith('/goldsmith/jobs/')) {
                title = 'Job Details - Majisa Goldsmith';
            } else {
                title = 'Majisa Jewelry';
            }
        }

        document.title = title;
    }, [location]);

    return null;
};

export default PageTitleUpdater;
