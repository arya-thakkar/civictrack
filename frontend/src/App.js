import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import CitizenDashboard from './pages/CitizenDashboard';
import AuthorityDashboard from './pages/AuthorityDashboard';
import ReportIssue from './pages/ReportIssue';
import IssueDetail from './pages/IssueDetail';
import Profile from './pages/Profile';
import './styles/global.css';

const AuthRedirect = ({ to }) => {
  const { user } = useAuth();
  if (user) return <Navigate to={user.role === 'authority' ? '/authority' : '/dashboard'} replace />;
  return <Navigate to={to} replace />;
};

const App = () => (
  <AuthProvider>
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={
          <ProtectedRoute role="citizen"><CitizenDashboard /></ProtectedRoute>
        } />
        <Route path="/authority" element={
          <ProtectedRoute role="authority"><AuthorityDashboard /></ProtectedRoute>
        } />
        <Route path="/report" element={
          <ProtectedRoute role="citizen"><ReportIssue /></ProtectedRoute>
        } />
        <Route path="/issues/:id" element={
          <ProtectedRoute><IssueDetail /></ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute><Profile /></ProtectedRoute>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  </AuthProvider>
);

export default App;
