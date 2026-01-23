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

const DashboardRedirect = () => {
  const { user } = useAuth();
  if (user?.role === 'seller') {
    return <SellerDashboard />;
  }
  return <UserDashboard />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
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
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;