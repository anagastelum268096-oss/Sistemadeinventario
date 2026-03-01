import { createBrowserRouter, RouterProvider, Navigate, Outlet } from 'react-router';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Toaster } from 'sonner';
import { Layout } from './components/Layout';
import { Inventory } from './pages/Inventory';
import { Calendar } from './pages/Calendar';
import { Groups } from './pages/Groups';
import { TeacherPresentations } from './pages/TeacherPresentations';
import { Categories } from './pages/Categories';
import { Loans } from './pages/Loans';
import { Login } from './pages/Login';

// Protected route wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
}

// Root component that wraps everything
function Root() {
  return (
    <AuthProvider>
      <Outlet />
      <Toaster position="top-right" richColors />
    </AuthProvider>
  );
}

const router = createBrowserRouter([
  {
    element: <Root />,
    children: [
      {
        path: '/login',
        element: <Login />,
      },
      {
        path: '/',
        element: (
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        ),
        children: [
          { index: true, element: <Inventory /> },
          { path: 'categories', element: <Categories /> },
          { path: 'loans', element: <Loans /> },
          { path: 'calendar', element: <Calendar /> },
          { path: 'groups', element: <Groups /> },
          { path: 'teacher-presentations', element: <TeacherPresentations /> },
        ],
      },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}