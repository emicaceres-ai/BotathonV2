import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import SearchPage from './pages/SearchPage';
import VolunteerFormPage from './pages/VolunteerFormPage';
import AdminPage from './pages/AdminPage';
import Layout from './components/Layout';

const Router: React.FC = () => {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/buscar" element={<SearchPage />} />
        <Route path="/voluntarios/nuevo" element={<VolunteerFormPage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </Layout>
  );
};

export default Router;

