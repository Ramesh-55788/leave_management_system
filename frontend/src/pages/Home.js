import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useUser } from '../userContext';
import Admin from './Admin';
import Calendar from '../components/Calendar';
import '../styles/home.css';

function Home() {
  const { user, logout } = useUser();
  const navigate = useNavigate();
  const [teamMembers, setTeamMembers] = useState([]);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [loading, setLoading] = useState({ incoming: true });
  const [error, setError] = useState({ incoming: null });

  const fetchIncomingRequests = useCallback(async () => {
    if (!user || user.role === "employee") {
      setLoading(prev => ({ ...prev, incoming: false }));
      return;
    }
    try {
      const res = await api.get(`/leave/requests/${user.id}`);
      setIncomingRequests(res.data.incomingRequests);
      setError(prev => ({ ...prev, incoming: null }));
    } catch {
      setError(prev => ({ ...prev, incoming: 'Error fetching incoming requests' }));
    } finally {
      setLoading(prev => ({ ...prev, incoming: false }));
    }
  }, [user]);

  const fetchAllUsersInTeam = useCallback(async () => {
    try {
      const res = await api.get('/auth/users');
      const currentManagerId = user.id;
      const UsersManagerId = user.managerId;
      let teamMembers;
      if (user.role !== 'admin') {
        teamMembers = res.data.users.filter(
          u => u.managerId === currentManagerId || 
               (u.managerId === UsersManagerId)
        );
      } else {
        teamMembers = res.data.users;
      }
      setTeamMembers(teamMembers);
    } catch {
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchIncomingRequests();
    fetchAllUsersInTeam();
  }, [user, navigate, fetchIncomingRequests, fetchAllUsersInTeam]);

  const fetchTeamLeaveData = async (teamMemberIds, month, year) => {
    try {
      const response = await api.get('/leave/team-leaves', {
        params: {
          teamMembers: teamMemberIds.join(','),
          month: month,
          year: year,
          role: user.role
        }
      });
      return response.data.leaveRequests;
    } catch {
      return [];
    }
  };

  const handleApproveReject = async (requestId, action) => {
    try {
      await api.put(`/leave/${action}/${requestId}`);
      alert(`Request ${action}ed successfully`);
      setIncomingRequests(prev =>
        prev.map(req =>
          req.id === requestId
            ? { ...req, status: action === 'approve' ? 'Approved' : 'Rejected' }
            : req
        )
      );
    } catch {
      alert(`Failed to ${action} request`);
    }
  };

  const formatDate = (date) =>
    new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });

  if (!user) return null;

  if (user.role === "admin") {
    return (
      <Admin
        user={user}
        logout={logout}
        teamMembers={teamMembers}
        fetchTeamLeaveData={fetchTeamLeaveData}
      />
    );
  }

  return (
    <div className="employee-home">
      <div className="home-header">
        <h2>Welcome <span>{user.name}</span>!</h2>
      </div>

      {user.role !== "employee" && (
        <div className="incoming-requests">
          <h3>Leave Requests for Approval</h3>
          {loading.incoming && <p>Loading incoming requests...</p>}
          {error.incoming && <p className="error-message">{error.incoming}</p>}
          {!loading.incoming && !error.incoming && (
            <table>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Leave Type</th>
                  <th>From</th>
                  <th>To</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {incomingRequests.length > 0 ? (
                  incomingRequests.map(req => (
                    <tr key={req.id}>
                      <td>{req.employee_name}</td>
                      <td>{req.leave_type}</td>
                      <td>{formatDate(req.start_date)}</td>
                      <td>{formatDate(req.end_date)}</td>
                      <td>{req.status}</td>
                      <td>
                        {['Pending', 'Pending (L1)', 'Pending (L2)'].includes(req.status) ? (
                          <>
                            <button onClick={() => handleApproveReject(req.id, 'approve')}>Approve</button>
                            <button onClick={() => handleApproveReject(req.id, 'reject')}>Reject</button>
                          </>
                        ) : 'No actions'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center' }}>No leave requests</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      )}

      <div className='team-calendar'>
        <Calendar
          teamMembers={teamMembers}
          fetchTeamLeaveData={fetchTeamLeaveData}
        />
      </div>
    </div>
  );
}

export default Home;
