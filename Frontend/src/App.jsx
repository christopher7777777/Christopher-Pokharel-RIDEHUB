import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import SupportChat from './components/chat/SupportChat';
import PrivateRoute from './components/PrivateRoute';
import { AuthProvider, useAuth } from './context/AuthContext';
import AdminDashboard from './pages/admin/AdminDashboard';
import BikeList from './pages/admin/BikeList';
import KycVerification from './pages/admin/KycVerification';
import Payments from './pages/admin/Payments';
import UserManagement from './pages/admin/UserManagement';
import ValuationRules from './pages/admin/ValuationRules';
import ForgotPassword from './pages/auth/ForgotPassword';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ResetPassword from './pages/auth/ResetPassword';
import SellerBikes from './pages/seller/SellerBikes';
import SellerDashboard from './pages/seller/SellerDashboard';
import SellerInventory from './pages/seller/SellerInventory';
import SellerKYC from './pages/seller/SellerKYC';
import SellerMessages from './pages/seller/SellerMessages';
import SellerPayments from './pages/seller/SellerPayments';
import SellerPurchaseHub from './pages/seller/SellerPurchaseHub';
import AboutUs from './pages/user/AboutUs';
import BikeDetails from './pages/user/BikeDetails';
import BrowseBikes from './pages/user/BrowseBikes';
import Contact from './pages/user/Contact';
import ListBike from './pages/user/ListBike';
import UserDashboard from './pages/user/UserDashboard';
import UserKYC from './pages/user/UserKYC';
import UserProfile from './pages/user/UserProfile';
import UserSellingStatus from './pages/user/UserSellingStatus';
import PaymentSuccess from './pages/user/PaymentSuccess';
import PaymentFailure from './pages/user/PaymentFailure';

const GlobalSupportChat = () => {
  const { user, loading } = useAuth();
  if (loading || !user) return null;
  return <SupportChat />;
};

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
            <Route path="/payment-success" element={<PaymentSuccess />} />
            <Route path="/payment-failure" element={<PaymentFailure />} />
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
            <Route
              path="/seller/payments"
              element={
                <PrivateRoute role="seller">
                  <SellerPayments />
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
          <GlobalSupportChat />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
