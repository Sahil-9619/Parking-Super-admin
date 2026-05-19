import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
// Framer motion is now handled inside AdminLayout and individual components where needed
import Login from './admin/Login';
import Dashboard from './admin/Dashboard';
import Owners from './admin/Owners';
import NotFound from './admin/NotFound';
import AdminLayout from './layout/AdminLayout';
import ProtectedRoute from './routes/ProtectedRoute';
import Users from './admin/Users';
import Settings from './admin/Settings';
import Area from './admin/Area';
import Bookings from './admin/Bookings';
import Review from './admin/Review';
import Subscribers from './admin/Subscribers';

// Navigation Wrapper is now handled inside AdminLayout for smoother sub-route transitions

function AnimatedRoutes() {
  return (
    <Routes>
      {/* Login page */}
      <Route path="/" element={<Login />} />

      {/* Admin routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="owners" element={<Owners />} />
        <Route path="area" element={<Area />} />
        <Route path="bookings" element={<Bookings />} />
        <Route path="review" element={<Review />} />
        <Route path="subscribers" element={<Subscribers />} />
        <Route path="users" element={<Users />} />
        <Route path="settings" element={<Settings />} />
        {/* Catch-all for unimplemented admin routes */}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <Toaster position="top-right" reverseOrder={false} />
      <AnimatedRoutes />
    </Router>
  );
}

export default App;
