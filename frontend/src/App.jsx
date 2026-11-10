import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import './App.css';

// Pages
import Landing      from './pages/Landing';
import Login        from './pages/Login';
import Register     from './pages/Register';
import Dashboard    from './pages/Dashboard';
import KnowledgeBase from './pages/KnowledgeBase';
import Documents    from './pages/Documents';
import Chat         from './pages/Chat';
import Analytics    from './pages/Analytics';
import Settings     from './pages/Settings';
import Profile      from './pages/Profile';
import NotFound     from './pages/NotFound';

// Redirect logged-in users away from /login and /register
function GuestRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return null;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return children;
}

// Layout wrapper — renders Outlet for nested protected routes
function LayoutWrapper() {
  return (
    <ProtectedRoute>
      <Layout />
    </ProtectedRoute>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/"         element={<Landing />} />
          <Route path="/login"    element={<GuestRoute><Login /></GuestRoute>} />
          <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />

          {/* Protected — all render inside Layout via Outlet */}
          <Route element={<LayoutWrapper />}>
            <Route path="/dashboard"       element={<Dashboard />} />
            <Route path="/knowledge-base"  element={<KnowledgeBase />} />
            <Route path="/documents"       element={<Documents />} />
            <Route path="/chat"            element={<Chat />} />
            <Route path="/analytics"       element={<Analytics />} />
            <Route path="/settings"        element={<Settings />} />
            <Route path="/profile"         element={<Profile />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
