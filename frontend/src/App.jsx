import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { ToastProvider } from './contexts/ToastContext';
import { NotificationProvider } from './contexts/NotificationContext';
import Header from './components/layout/Header';
import ProtectedRoute from './components/common/ProtectedRoute';
import Loading from './components/common/Loading';
import ErrorBoundary from './components/common/ErrorBoundary';
import ScrollToTop from './components/common/ScrollToTop';

// Lazy load pages for code splitting
const HomePage = lazy(() => import('./pages/HomePage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const MenuPage = lazy(() => import('./pages/MenuPage'));
const OrdersPage = lazy(() => import('./pages/OrdersPage'));
const OrderDetailPage = lazy(() => import('./pages/OrderDetailPage'));
const CartPage = lazy(() => import('./pages/CartPage'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const PaymentPage = lazy(() => import('./pages/PaymentPage'));
const PaymentSuccessPage = lazy(() => import('./pages/PaymentSuccessPage'));
const VendorDashboardPage = lazy(() => import('./pages/VendorDashboardPage'));
const VendorOrdersPage = lazy(() => import('./pages/VendorOrdersPage'));
const VendorMenuPage = lazy(() => import('./pages/VendorMenuPage'));
const VendorReportsPage = lazy(() => import('./pages/VendorReportsPage'));
const AdminDashboardPage = lazy(() => import('./pages/AdminDashboardPage'));
const AdminUsersPage = lazy(() => import('./pages/AdminUsersPage'));
const AdminVendorsPage = lazy(() => import('./pages/AdminVendorsPage'));
const AdminReportsPage = lazy(() => import('./pages/AdminReportsPage'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnMount: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <LanguageProvider>
          <AuthProvider>
            <CartProvider>
              <NotificationProvider>
                <ErrorBoundary>
                  <ToastProvider>
                    <div className="app">
                      <Header />
                      <main className="main-content">
                        <Suspense fallback={<Loading />}>
                          <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/menu" element={<MenuPage />} />
                    <Route
                      path="/orders"
                      element={
                        <ProtectedRoute allowedRoles={['customer']}>
                          <OrdersPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/orders/:orderId"
                      element={
                        <ProtectedRoute allowedRoles={['customer']}>
                          <OrderDetailPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/cart"
                      element={
                        <ProtectedRoute allowedRoles={['customer']}>
                          <CartPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/checkout"
                      element={
                        <ProtectedRoute allowedRoles={['customer']}>
                          <CheckoutPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/payment/:orderId"
                      element={
                        <ProtectedRoute allowedRoles={['customer']}>
                          <PaymentPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/payment-success/:orderId"
                      element={
                        <ProtectedRoute allowedRoles={['customer']}>
                          <PaymentSuccessPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/vendor"
                      element={
                        <ProtectedRoute allowedRoles={['vendor']}>
                          <VendorDashboardPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/vendor/dashboard"
                      element={
                        <ProtectedRoute allowedRoles={['vendor']}>
                          <VendorDashboardPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/vendor/orders"
                      element={
                        <ProtectedRoute allowedRoles={['vendor']}>
                          <VendorOrdersPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/vendor/menu"
                      element={
                        <ProtectedRoute allowedRoles={['vendor']}>
                          <VendorMenuPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/vendor/reports"
                      element={
                        <ProtectedRoute allowedRoles={['vendor']}>
                          <VendorReportsPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/admin"
                      element={
                        <ProtectedRoute allowedRoles={['admin']}>
                          <AdminDashboardPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/admin/users"
                      element={
                        <ProtectedRoute allowedRoles={['admin']}>
                          <AdminUsersPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/admin/vendors"
                      element={
                        <ProtectedRoute allowedRoles={['admin']}>
                          <AdminVendorsPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/admin/reports"
                      element={
                        <ProtectedRoute allowedRoles={['admin']}>
                          <AdminReportsPage />
                        </ProtectedRoute>
                      }
                    />
                          </Routes>
                        </Suspense>
                      </main>
                      <ScrollToTop />
                    </div>
                  </ToastProvider>
                </ErrorBoundary>
              </NotificationProvider>
            </CartProvider>
          </AuthProvider>
        </LanguageProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
