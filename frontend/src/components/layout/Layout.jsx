import React from 'react';
import Header from './Header';
import Footer from './Footer';
import { Outlet, useLocation } from 'react-router-dom';
import CustomCursor from '../common/CustomCursor';
import SEO from '../common/SEO';

const Layout = () => {
    const location = useLocation();
    const isHome = location.pathname === '/';
    return (
        <div className="min-h-screen flex flex-col bg-white">
            <SEO />
            <CustomCursor variant="vector" />
            <Header />
            <main className={`flex-grow ${!isHome ? 'pt-24' : ''}`}>
                <Outlet />
            </main>
            {isHome && <Footer />}
        </div>
    );
};

export default Layout;
