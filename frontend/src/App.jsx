import React from 'react';
import { BrowserRouter as Router, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';
import CompareBar from './components/Compare/CompareBar';
import AppRoutes from './routes/AppRoutes';

const Layout = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      {!isAdminRoute && <Navbar />}
      {!isAdminRoute && <CompareBar />}
      <main className="flex-1">
        <AppRoutes />
      </main>
      {!isAdminRoute && <Footer />}
    </div>
  );
};

function App() {
  return (
    <Router>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#0f172a',
            color: '#fff',
            borderRadius: '16px',
            fontSize: '13px',
            fontWeight: '600',
          },
        }}
      />
      <Layout />
    </Router>
  );
}

export default App;
