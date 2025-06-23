import React, { useEffect, useState, useCallback } from 'react';
import api from '../utils/api';
import Calendar from '../components/Calendar';
import '../styles/admin.css';
import { notifySuccess, notifyError } from '../utils/toast';

function Admin({ user, teamMembers, fetchTeamLeaveData }) {

  const [adminRequests, setAdminRequests] = useState([]);
  const [usersOnLeaveToday, setUsersOnLeaveToday] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [leaveUsers, setLeaveUsers] = useState(0);

  const fetchAdminRequests = useCallback(async () => {
    const res = await api.get(`/leave/requests/${user.id}`);
    if (!res.data) {
      setAdminRequests([]);
    } else {
      setAdminRequests(res.data.incomingRequests);
    }
  }, [user]);

  const fetchUsersOnLeaveToday = async () => {
    const res = await api.get('/leave/on-leave-today');
    if (!res.data) {
      setUsersOnLeaveToday([]);
      setLeaveUsers(0);
    } else {
      setUsersOnLeaveToday(res.data.users);
      setLeaveUsers(res.data.count);
    }
  };

  const fetchAllUsers = async () => {
    const res = await api.get('/auth/users');
    setTotalUsers(res.data.count);
  };

  useEffect(() => {
    if (user) {
      fetchAdminRequests();
      fetchUsersOnLeaveToday();
      fetchAllUsers();
    }
  }, [user, fetchAdminRequests]);

  const handleApproveReject = async (requestId, action) => {
    try {
      await api.put(`/leave/${action}/${requestId}`);
      setAdminRequests(prevRequests =>
        prevRequests.map(req => req.id === requestId ? { ...req, status: action } : req)
      );
      notifySuccess(`Request ${action}ed successfully`);
    } catch (err) {
      notifyError(`Failed to ${action} request`);
    }
  };

  const formatDate = (dateStr) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateStr).toLocaleDateString(undefined, options);
  };

  return (
    <div className="admin-dashboard">
      <header className="home-header">
        <h2>Welcome,<span> Admin</span></h2>
      </header>

      <section className="summary-section">
        <div className="users-on-leave-card">
          <h3>Employee's on Leave Today</h3>
          {usersOnLeaveToday.length === 0 ? (
            <p>No one is on leave today</p>
          ) : (
            <ul>
              {usersOnLeaveToday.map(user => (
                <li key={user.id}>{user.name}</li>
              ))}
            </ul>
          )}
          <p className="leave-count">{leaveUsers} out of {totalUsers} employee on leave</p>
        </div>
      </section>

      {adminRequests.length > 0 && (
        <section className="admin-requests">
          <h3>Leave Requests</h3>
          <div className="requests-container">
            {adminRequests.map(req => (
              <div key={req.id} className="request-card">
                <div className="request-info">
                  <p><strong>Employee:</strong> {req.employee_name}</p>
                  <p><strong>Leave Type:</strong> {req.leave_type}</p>
                  <p><strong>Period:</strong> {formatDate(req.start_date)} - {formatDate(req.end_date)}</p>
                  <p><strong>Reason:</strong> {req.reason}</p>
                  <p><strong>Status:</strong> <span className={`status-tag ${req.status.toLowerCase().replace(/ /g, '-')}`}>{req.status}</span></p>
                </div>
                <div className="request-actions">
                  {(req.status === 'Pending' || req.status.includes('Pending (')) ? (
                    <>
                      <button className="approve-btn" onClick={() => handleApproveReject(req.id, 'approve')}>Approve</button>
                      <button className="approve-btn reject-btn" onClick={() => handleApproveReject(req.id, 'reject')}>Reject</button>
                    </>
                  ) : (
                    <span className="no-action">No actions</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {(
        <div className='team-calendar'>
          <Calendar
            teamMembers={teamMembers}
            fetchTeamLeaveData={fetchTeamLeaveData}
          />
        </div>
      )}
    </div>
  );
}

export default Admin;
