// src/pages/ProtectedRoute.jsx
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import Loading from '../components/LoadingSpinner';

export default function ProtectedRoute({ children }) {
  const authState = useSelector((state) => state.auth || {}); // safe default
  const { user, loading = false } = authState;

  if (loading) return <Loading />;
  if (!user) return <Navigate to="/login" replace />;

  return children;
}