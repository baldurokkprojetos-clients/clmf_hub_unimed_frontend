import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import React from 'react';
import Importacoes from './pages/Importacoes';
import Carteirinhas from './pages/Carteirinhas';
import Logs from './pages/Logs';
import Login from './pages/Login';
import BaseGuias from './pages/BaseGuias';
import Dashboard from './pages/Dashboard';
import GestaoPei from './pages/GestaoPei';
import MainLayout from './layouts/MainLayout';

function PrivateRoute({ children }) {
  const token = localStorage.getItem('token');
  return token ? <MainLayout>{children}</MainLayout> : <Navigate to="/login" />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route path="/" element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        } />

        <Route path="/guias" element={
          <PrivateRoute>
            <BaseGuias />
          </PrivateRoute>
        } />

        <Route path="/jobs" element={
          <PrivateRoute>
            <Importacoes />
          </PrivateRoute>
        } />

        <Route path="/carteirinhas" element={
          <PrivateRoute>
            <Carteirinhas />
          </PrivateRoute>
        } />

        <Route path="/pei" element={
          <PrivateRoute>
            <GestaoPei />
          </PrivateRoute>
        } />

        <Route path="/logs" element={
          <PrivateRoute>
            <Logs />
          </PrivateRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}
