import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AdminLayout } from './components/layouts/AdminLayout';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { GenerateActivity } from './pages/GenerateActivity';
import { MyActivities } from './pages/MyActivities';
import { PublicActivities } from './pages/PublicActivities';
import { ActivityDetail } from './pages/ActivityDetail';
import { UserRole } from './types';

// Admin pages
import { AdminDashboard } from './pages/admin/Dashboard';
import { InstitutionManagement } from './pages/admin/InstitutionManagement';
import { UserManagement } from './pages/admin/UserManagement';
import { GradeManagement } from './pages/admin/GradeManagement';

const DashboardRedirect = () => {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;

  // Redirect based on role
  if (user.role === UserRole.ADMIN) {
    return <Navigate to="/admin/dashboard" replace />;
  }
  // Default dashboard for TEACHER and STUDENT
  return <Dashboard />;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Dashboard redirect */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardRedirect />
              </ProtectedRoute>
            }
          />

          {/* Admin Routes with Layout */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="institutions" element={<InstitutionManagement />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="grades" element={<GradeManagement />} />
          </Route>

          {/* Existing routes */}
          <Route
            path="/generate"
            element={
              <ProtectedRoute>
                <GenerateActivity />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-activities"
            element={
              <ProtectedRoute>
                <MyActivities />
              </ProtectedRoute>
            }
          />
          <Route
            path="/public-activities"
            element={
              <ProtectedRoute>
                <PublicActivities />
              </ProtectedRoute>
            }
          />
          <Route
            path="/activity/:id"
            element={
              <ProtectedRoute>
                <ActivityDetail />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
