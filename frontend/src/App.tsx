import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Login from './admin/Login';
import Dashboard from './admin/Dashboard';
import AdminLayout from './layout/AdminLayout';
import ProtectedRoute from './routes/ProtectedRoute';

function App() {
  return (
    <Router>
      <Toaster position="top-right" reverseOrder={false} />


      <Routes>
        {/* Login page */}
        <Route path="/" element={<Login />} />

        {/* Admin routes */}
        {/* Protected Admin Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<Dashboard />} />
          {/* <Route path="users" element={<UserList />} /> */}
          {/* <Route path="owners" element={<OwnerList />} /> */}
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
