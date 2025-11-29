import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import VolunteerForm from './pages/VolunteerForm';

// Use HashRouter as specifically requested for environments where URL path manipulation is restricted
const App: React.FC = () => {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/nuevo" element={<VolunteerForm />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;