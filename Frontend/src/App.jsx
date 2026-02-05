import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import UserDashboard from './pages/user/UserDashboard';
import SellerDashboard from './pages/seller/SellerDashboard';
import SellerInventory from './pages/seller/SellerInventory';
import BrowseBikes from './pages/user/BrowseBikes';
import AboutUs from './pages/user/AboutUs';
import Contact from './pages/user/Contact';
import ListBike from './pages/user/ListBike';
import SellerPurchaseHub from './pages/seller/SellerPurchaseHub';
import SellerMessages from './pages/seller/SellerMessages';
import UserSellingStatus from './pages/user/UserSellingStatus';
import UserProfile from './pages/user/UserProfile';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import BikeDetails from './pages/user/BikeDetails';
import SellerBikes from './pages/seller/SellerBikes';
import SellerKYC from './pages/seller/SellerKYC';
import UserKYC from './pages/user/UserKYC';
import AdminDashboard from './pages/admin/AdminDashboard';
import KycVerification from './pages/admin/KycVerification';
import ValuationRules from './pages/admin/ValuationRules';
import UserManagement from './pages/admin/UserManagement';
import Payments from './pages/admin/Payments';
import BikeList from './pages/admin/BikeList';
import AdminLayout from './components/layout/AdminLayout';

const DashboardRedirect = () => {
  const { user } = useAuth();
  if (user?.isAdmin) {
    return <AdminDashboard />;
  }
  if (user?.role === 'seller') {
    return <SellerDashboard />;
  }
  return <UserDashboard />;
};

function App() {
  return (
    <AuthProvider>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <div className="App">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgotpassword" element={<ForgotPassword />} />
            <Route path="/resetpassword/:token" element={<ResetPassword />} />
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <DashboardRedirect />
                </PrivateRoute>
              }
            />
            <Route
              path="/browse"
              element={
                <PrivateRoute>
                  <BrowseBikes />
                </PrivateRoute>
              }
            />
            <Route
              path="/bike/:id"
              element={
                <PrivateRoute>
                  <BikeDetails />
                </PrivateRoute>
              }
            />
            <Route
              path="/about"
              element={
                <AboutUs />
              }
            />
            <Route
              path="/contact"
              element={
                <Contact />
              }
            />
            <Route
              path="/sell"
              element={
                <PrivateRoute>
                  <ListBike />
                </PrivateRoute>
              }
            />
            <Route
              path="/my-selling"
              element={
                <PrivateRoute>
                  <UserSellingStatus />
                </PrivateRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <PrivateRoute>
                  <UserProfile />
                </PrivateRoute>
              }
            />
            <Route
              path="/kyc-verification"
              element={
                <PrivateRoute>
                  <UserKYC />
                </PrivateRoute>
              }
            />
            {/* Seller specific routes */}
            <Route
              path="/seller/inventory"
              element={
                <PrivateRoute role="seller">
                  <SellerInventory />
                </PrivateRoute>
              }
            />
            <Route
              path="/seller/bikes"
              element={
                <PrivateRoute role="seller">
                  <SellerBikes />
                </PrivateRoute>
              }
            />
            <Route
              path="/seller/purchase-hub"
              element={
                <PrivateRoute role="seller">
                  <SellerPurchaseHub />
                </PrivateRoute>
              }
            />
            <Route
              path="/seller/messages"
              element={
                <PrivateRoute role="seller">
                  <SellerMessages />
                </PrivateRoute>
              }
            />
            <Route
              path="/seller/kyc"
              element={
                <PrivateRoute role="seller">
                  <SellerKYC />
                </PrivateRoute>
              }
            />

            {/* Admin specific routes */}
            <Route
              path="/admin/dashboard"
              element={
                <PrivateRoute isAdmin={true}>
                  <AdminDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/kyc"
              element={
                <PrivateRoute isAdmin={true}>
                  <KycVerification />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/valuation"
              element={
                <PrivateRoute isAdmin={true}>
                  <ValuationRules />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <PrivateRoute isAdmin={true}>
                  <UserManagement />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/payments"
              element={
                <PrivateRoute isAdmin={true}>
                  <Payments />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/bikes"
              element={
                <PrivateRoute isAdmin={true}>
                  <BikeList />
                </PrivateRoute>
              }
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;