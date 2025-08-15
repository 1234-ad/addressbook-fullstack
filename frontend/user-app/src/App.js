import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Container } from '@mui/material';
import { useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AddressForm from './pages/AddressForm';
import AddressList from './pages/AddressList';
import Profile from './pages/Profile';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  const { user } = useAuth();

  return (
    <div className="App">
      {user && <Navbar />}
      <Container maxWidth="lg" sx={{ mt: user ? 4 : 0, mb: 4 }}>
        <Routes>
          <Route 
            path="/login" 
            element={user ? <Navigate to="/dashboard" /> : <Login />} 
          />
          <Route 
            path="/register" 
            element={user ? <Navigate to="/dashboard" /> : <Register />} 
          />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/addresses" 
            element={
              <ProtectedRoute>
                <AddressList />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/addresses/new" 
            element={
              <ProtectedRoute>
                <AddressForm />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/addresses/edit/:id" 
            element={
              <ProtectedRoute>
                <AddressForm />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/" 
            element={<Navigate to={user ? "/dashboard" : "/login"} />} 
          />
        </Routes>
      </Container>
    </div>
  );
}

export default App;