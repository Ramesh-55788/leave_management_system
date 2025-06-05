import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { UserProvider } from './userContext';
import Login from './pages/Login';
import Home from './pages/Home';
import RequestLeave from './components/RequestLeave';
import AddUser from './components/AddUser';
import Navbar from './components/Navbar';
import axios from 'axios';
import LeaveBalance from './components/LeaveBalance';
import LeavePolicy from './components/LeavePolicy';
import LeaveHistory from './components/LeaveHistory';
import TeamLeaveHistory from './components/TeamLeaveHistory';

function App() {
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers['Authorization'] = `Bearer ${token}`;
    }
  }, []);

  return (
    <UserProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/request-leave" element={<RequestLeave />} />
          <Route path="/leave-balance" element={<LeaveBalance />} />
          <Route path="/leave-policy" element={<LeavePolicy />} />
          <Route path="/leave-history" element={<LeaveHistory/>} />
          <Route path="/team-leave-history" element={<TeamLeaveHistory />} />
          <Route path="/add-user" element={<AddUser />} />
        </Routes>
      </Router>
    </UserProvider>
  );
}

export default App;
