import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import '../styles/users.css';

function Users() {
  const [users, setUsers] = useState([]);
  const [reassigning, setReassigning] = useState(false);
  const [deletingManagerId, setDeletingManagerId] = useState(null);
  const [reportees, setReportees] = useState([]);
  const [reassigned, setReassigned] = useState({});

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const res = await api.get('/auth/users');
    setUsers(res.data.users);
  };

  const handleDelete = async (id) => {
    const reportees = users.filter((u) => u.managerId === id);
    if (reportees.length > 0) {
      setDeletingManagerId(id);
      setReportees(reportees);
      setReassigning(true);
      return;
    }
    await api.delete(`/auth/users/${id}`);
    fetchUsers();
  };

  const confirmReassignment = async () => {
    const updates = reportees.map((emp) => {
      return api.put(`/auth/users/${emp.id}/manager`, {
        newManagerId: reassigned[emp.id],
      });
    });
    await Promise.all(updates);
    await api.delete(`/auth/users/${deletingManagerId}`);
    setReassigning(false);
    setDeletingManagerId(null);
    setReportees([]);
    setReassigned({});
    fetchUsers();
  };

  return (
    <div className="users-container">
      <h2>Manage Users</h2>
      <div className="users-main-content">
        <div className="table-container">
          <table className="users-table">
            <thead>
              <tr>
                <th>Id</th>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Manager</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.id}</td>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>{u.role}</td>
                  <td>{u.managerId || '-'}</td>
                  <td>
                    <button onClick={() => handleDelete(u.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {reassigning && (
          <div className="reassign-container">
            <h3>Reassign Manager</h3>
            {reportees.map((emp) => (
              <div key={emp.id} className="reassign-item">
                <span>{emp.name}</span>
                <select
                  value={reassigned[emp.id] || ''}
                  onChange={(e) =>
                    setReassigned({ ...reassigned, [emp.id]: e.target.value })
                  }
                >
                  <option value="">Select new manager</option>
                  {users
                    .filter((u) => u.role === 'manager' && u.id !== deletingManagerId)
                    .map((mgr) => (
                      <option key={mgr.id} value={mgr.id}>
                        {mgr.name}
                      </option>
                    ))}
                </select>
              </div>
            ))}
            <button onClick={confirmReassignment}>Confirm Reassignment & Delete</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Users;
