import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import UserDashboard from './pages/UserDashboard';
import SellerDashboard from './pages/SellerDashboard';

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
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <DashboardRedirect />
                </PrivateRoute>
              }
            />
            {/* Seller specific routes can be added here */}
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;