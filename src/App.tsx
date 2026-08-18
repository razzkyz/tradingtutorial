import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ProtectedRoute } from './routes/ProtectedRoute'
import { AdminRoute } from './routes/AdminRoute'
import AppLayout from './layouts/AppLayout'
import LoadingState from './components/LoadingState'

// Lazy load pages
const Login = lazy(() => import('./pages/Login'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Profile = lazy(() => import('./pages/Profile'))
const MarketGlobal = lazy(() => import('./pages/MarketGlobal'))
const TradingAccess = lazy(() => import('./pages/TradingAccess'))
const Withdrawal = lazy(() => import('./pages/Withdrawal'))
const Settings = lazy(() => import('./pages/Settings'))

// Admin pages
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'))
const AddCustomer = lazy(() => import('./pages/admin/AddCustomer'))
const ManageCustomers = lazy(() => import('./pages/admin/ManageCustomers'))
const AdminWithdrawals = lazy(() => import('./pages/admin/AdminWithdrawals'))

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingState />}>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route element={<AppLayout />}>
            {/* User Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/market-global"
              element={
                <ProtectedRoute>
                  <MarketGlobal />
                </ProtectedRoute>
              }
            />
            <Route
              path="/trading-access"
              element={
                <ProtectedRoute>
                  <TradingAccess />
                </ProtectedRoute>
              }
            />
            <Route
              path="/withdrawal"
              element={
                <ProtectedRoute>
                  <Withdrawal />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              }
            />

            {/* Admin Routes - Protected with AdminRoute */}
            <Route
              path="/admin/dashboard"
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/add-customer"
              element={
                <AdminRoute>
                  <AddCustomer />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/customers"
              element={
                <AdminRoute>
                  <ManageCustomers />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/withdrawals"
              element={
                <AdminRoute>
                  <AdminWithdrawals />
                </AdminRoute>
              }
            />
          </Route>

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

export default App
