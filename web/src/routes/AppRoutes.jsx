import { Routes, Route, Navigate } from 'react-router-dom';
import PrivateRoute from './PrivateRoute';
import AuthLayout from '../layouts/AuthLayout';
import DashboardLayout from '../components/layout/DashboardLayout';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import ForgotPassword from '../pages/auth/ForgotPassword';
import Dashboard from '../pages/dashboard/Dashboard';
import Medicines from '../pages/medicines/Medicines';
import Inventory from '../pages/inventory/Inventory';
import POS from '../pages/pos/POS';
import Reports from '../pages/reports/Reports';
import Suppliers from '../pages/suppliers/Suppliers';
import Customers from '../pages/customers/Customers';
import Settings from '../pages/settings/Settings';
import Profile from '../pages/profile/Profile';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<AuthLayout><Login /></AuthLayout>} />
      <Route path="/register" element={<AuthLayout><Register /></AuthLayout>} />
      <Route path="/forgot-password" element={<AuthLayout><ForgotPassword /></AuthLayout>} />
      <Route path="/" element={<PrivateRoute><DashboardLayout /></PrivateRoute>}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="medicines" element={<Medicines />} />
        <Route path="inventory" element={<Inventory />} />
        <Route path="pos" element={<POS />} />
        <Route path="reports" element={<Reports />} />
        <Route path="suppliers" element={<Suppliers />} />
        <Route path="customers" element={<Customers />} />
        <Route path="settings" element={<Settings />} />
        <Route path="profile" element={<Profile />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
