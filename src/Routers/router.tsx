import Layout from '../layouts/Layout'
import Login from '../Pages/Login'
import Dashboard from '../Pages/Dashboard'
import NotFound from '../Pages/NotFound'
import { createBrowserRouter, Navigate } from 'react-router-dom'

// Protected Route Component
const ProtectedRoute = ({ element }) => {
  const token = localStorage.getItem('authToken')
  
  if (!token) {
    return <Navigate to="/login" replace />
  }
  
  return element
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    errorElement: <NotFound />,
    children: [
      { path: '', element: <Navigate to="login" /> },
      { path: 'login', element: <Login /> },
      { 
        path: 'dashboard', 
        element: <ProtectedRoute element={<Dashboard />} /> 
      },
    ],
  },
])

export default router