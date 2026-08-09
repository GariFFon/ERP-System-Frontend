import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';
import Sidebar from './components/Sidebar';

// Pages
import LoginPage from './pages/Login/LoginPage';
import DashboardPage from './pages/Dashboard/DashboardPage';
import CustomersPage from './pages/Customers/CustomersPage';
import CustomerDetailPage from './pages/Customers/CustomerDetailPage';
import ProductsPage from './pages/Products/ProductsPage';
import ProductDetailPage from './pages/Products/ProductDetailPage';
import InventoryPage from './pages/Inventory/InventoryPage';
import ChallansPage from './pages/Challans/ChallansPage';
import CreateChallanPage from './pages/Challans/CreateChallanPage';
import ChallanDetailPage from './pages/Challans/ChallanDetailPage';

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="app-layout">
    <Sidebar />
    <main className="main-content">{children}</main>
  </div>
);

const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1e2130',
              color: '#f1f5f9',
              border: '1px solid #2a2d3e',
            },
          }}
        />
        <Routes>
          {/* Public */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected */}
          <Route path="/" element={
            <ProtectedRoute>
              <AppLayout><DashboardPage /></AppLayout>
            </ProtectedRoute>
          } />

          <Route path="/customers" element={
            <ProtectedRoute>
              <AppLayout><CustomersPage /></AppLayout>
            </ProtectedRoute>
          } />

          <Route path="/customers/:id" element={
            <ProtectedRoute>
              <AppLayout><CustomerDetailPage /></AppLayout>
            </ProtectedRoute>
          } />

          <Route path="/products" element={
            <ProtectedRoute>
              <AppLayout><ProductsPage /></AppLayout>
            </ProtectedRoute>
          } />

          <Route path="/products/:id" element={
            <ProtectedRoute>
              <AppLayout><ProductDetailPage /></AppLayout>
            </ProtectedRoute>
          } />

          <Route path="/inventory" element={
            <ProtectedRoute>
              <AppLayout><InventoryPage /></AppLayout>
            </ProtectedRoute>
          } />

          <Route path="/challans" element={
            <ProtectedRoute>
              <AppLayout><ChallansPage /></AppLayout>
            </ProtectedRoute>
          } />

          <Route path="/challans/new" element={
            <ProtectedRoute allowedRoles={['Admin', 'Sales']}>
              <AppLayout><CreateChallanPage /></AppLayout>
            </ProtectedRoute>
          } />

          <Route path="/challans/:id" element={
            <ProtectedRoute>
              <AppLayout><ChallanDetailPage /></AppLayout>
            </ProtectedRoute>
          } />

          {/* Unauthorized */}
          <Route path="/unauthorized" element={
            <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem' }}>
              <h1 style={{ fontSize: '2rem' }}>403 — Access Denied</h1>
              <p style={{ color: 'var(--text-muted)' }}>You don't have permission to view this page.</p>
            </div>
          } />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
