import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import UserDashboard from './pages/UserDashboard';
import SellerDashboard from './pages/SellerDashboard';
import SellerInventory from './pages/SellerInventory';
import BrowseBikes from './pages/BrowseBikes';
import AboutUs from './pages/AboutUs';
import Contact from './pages/Contact';
import ListBike from './pages/ListBike';
import SellerPurchaseHub from './pages/SellerPurchaseHub';
import SellerMessages from './pages/SellerMessages';
import UserSellingStatus from './pages/UserSellingStatus';
import UserProfile from './pages/UserProfile';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import BikeDetails from './pages/BikeDetails';
import SellerBikes from './pages/SellerBikes';

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