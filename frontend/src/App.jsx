import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { OrderProvider } from './context/OrderContext';
import { SettingsProvider } from './context/SettingsContext';
import { HelmetProvider } from 'react-helmet-async';

import Layout from './components/layout/Layout';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetails from './pages/ProductDetails';
import Login from './pages/Login';
import VendorRegister from './pages/VendorRegister';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

import AdminLayout from './components/layout/AdminLayout';
import AdminDashboard from './pages/admin/Dashboard';
import AdminProducts from './pages/admin/Products';
import AddProduct from './pages/admin/AddProduct';
import AdminOrders from './pages/admin/Orders';
import OrderDetails from './pages/admin/OrderDetails';
import AdminVendors from './pages/admin/Vendors';
import AdminGoldsmiths from './pages/admin/Goldsmiths';
import AdminNotifications from './pages/admin/Notifications';
import AdminSettings from './pages/admin/Settings';
import CustomerVisits from './pages/admin/CustomerVisits';
import Categories from './pages/admin/Categories';

import VendorLayout from './components/layout/VendorLayout';
import VendorDashboard from './pages/vendor/Dashboard';
import VendorOrder from './pages/vendor/VendorOrder';
import VendorOrderDetails from './pages/vendor/OrderDetails';
import MyOrders from './pages/vendor/MyOrders';
import VendorProfile from './pages/vendor/Profile';

import GoldsmithLayout from './components/layout/GoldsmithLayout';
import GoldsmithDashboard from './pages/goldsmith/Dashboard';
import JobDetails from './pages/goldsmith/JobDetails';

import MyJobs from './pages/goldsmith/MyJobs';

import Cart from './pages/Cart';
import Wishlist from './pages/Wishlist';
import About from './pages/About';

// Placeholder pages
const NotFound = () => <div className="p-10 text-center">404 Not Found</div>;

import ReferralGate from './components/common/ReferralGate';



import ScrollToTop from './components/common/ScrollToTop';

import { WishlistProvider } from './context/WishlistContext';

import ProtectedRoute from './components/common/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <HelmetProvider>
        <AuthProvider>
          <SettingsProvider>
            <CartProvider>
              <WishlistProvider>
                <OrderProvider>
                  <Toaster position="top-center" toastOptions={{ duration: 1000 }} />
                  <Routes>
                    <Route path="/" element={<Layout />}>
                      <Route index element={
                        <ReferralGate>
                          <Home />
                        </ReferralGate>
                      } />
                      <Route path="products" element={
                        <ReferralGate>
                          <Products />
                        </ReferralGate>
                      } />
                      <Route path="product/:id" element={
                        <ReferralGate>
                          <ProductDetails />
                        </ReferralGate>
                      } />
                      <Route path="about" element={<About />} />
                      <Route path="wishlist" element={<Wishlist />} />
                      <Route path="cart" element={<Cart />} />
                      <Route path="*" element={<NotFound />} />
                    </Route>

                    {/* Auth Routes (No Header/Footer) */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/vendor-register" element={<VendorRegister />} />
                    <Route path="/forgotpassword" element={<ForgotPassword />} />
                    <Route path="/resetpassword/:resetToken" element={<ResetPassword />} />

                    {/* Admin Routes */}
                    <Route path="/admin" element={
                      <ProtectedRoute allowedRoles={['admin']}>
                        <AdminLayout />
                      </ProtectedRoute>
                    }>
                      <Route index element={<AdminDashboard />} />
                      <Route path="dashboard" element={<AdminDashboard />} />
                      <Route path="products" element={<AdminProducts />} />
                      <Route path="products/new" element={<AddProduct />} />
                      <Route path="products/edit/:id" element={<AddProduct />} />
                      <Route path="orders" element={<AdminOrders />} />
                      <Route path="orders/:id" element={<OrderDetails />} />
                      <Route path="vendors" element={<AdminVendors />} />
                      <Route path="goldsmiths" element={<AdminGoldsmiths />} />
                      <Route path="visits" element={<CustomerVisits />} />
                      <Route path="categories" element={<Categories />} />
                      <Route path="notifications" element={<AdminNotifications />} />
                      <Route path="settings" element={<AdminSettings />} />
                    </Route>

                    {/* Goldsmith Routes */}
                    <Route path="/goldsmith" element={
                      <ProtectedRoute allowedRoles={['goldsmith', 'admin']}>
                        <GoldsmithLayout />
                      </ProtectedRoute>
                    }>
                      <Route index element={<GoldsmithDashboard />} />
                      <Route path="dashboard" element={<GoldsmithDashboard />} />
                      <Route path="jobs" element={<MyJobs />} />
                      <Route path="jobs/:id" element={<JobDetails />} />
                    </Route>

                    {/* Vendor Routes */}
                    <Route path="/vendor" element={
                      <ProtectedRoute allowedRoles={['vendor', 'admin']}>
                        <VendorLayout />
                      </ProtectedRoute>
                    }>
                      <Route index element={<VendorDashboard />} />
                      <Route path="dashboard" element={<VendorDashboard />} />
                      <Route path="place-order" element={<VendorOrder />} />
                      <Route path="orders" element={<MyOrders />} />
                      <Route path="orders/:id" element={<VendorOrderDetails />} />
                      <Route path="profile" element={<VendorProfile />} />
                    </Route>
                  </Routes>
                </OrderProvider>
              </WishlistProvider>
            </CartProvider>
          </SettingsProvider>
        </AuthProvider>
      </HelmetProvider>
    </BrowserRouter>
  );
}

export default App;
