import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useUser } from '../userContext';
import '../styles/navbar.css';

function Navbar() {
  const { user, logout } = useUser();
  const location = useLocation();
  const navigate = useNavigate();

  if (!user || location.pathname === '/login') return null;

  const links = [
    { to: '/', label: 'Home' },
  ];

  if (user.role === 'employee' || user.role === 'manager' || user.role === 'hr') {
    links.push({ to: '/request-leave', label: 'Request Leave' });
    links.push({ to: '/leave-balance', label: 'Leave Balance' });
    links.push({ to: '/leave-history', label: 'Leave History' });
  }

  if (user.role !== 'employee') {
    links.push({ to: '/team-leave-history', label: 'TeamLeave History' });
  }

  if (user.role === 'admin') {
    links.push({ to: '/add-user', label: 'Add User' });
    links.push({ to: '/leave-policy', label: 'Leave Policy' });
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <ul>
        {links.map(link => (
          <li key={link.to}>
            <Link to={link.to}>{link.label}</Link>
          </li>
        ))}
        <li>
          <button onClick={handleLogout}>Logout</button>
        </li>
      </ul>
    </nav>
  );
}

export default Navbar;
