import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { useUser } from '../userContext';
import '../styles/leavebalance.css';

function LeaveBalance() {
  const { user } = useUser();
  const [leaveDetails, setLeaveDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user?.id) return;
    api.get(`/leave/balance/${user.id}`)
      .then(res => {
        setLeaveDetails(res.data.leaveDetails || []);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load leave balance');
        setLoading(false);
      });
  }, [user]);

  const totalUsed = leaveDetails.reduce((sum, d) => sum + d.used, 0);
  const totalAvailable = leaveDetails.reduce((sum, d) => sum + d.balance, 0) - totalUsed;

  const renderLeaveCard = (detail) => {
    const used = detail.used;
    const available = detail.balance;
    const total = detail.total;
    const percentage = total === 0 ? 0 : Math.min((used / total) * 100, 100);

    return (
      <div className="leave-card" key={detail.leave_type}>
        <h3>{detail.leave_type}</h3>
        <div className="donut">
          <svg viewBox="0 0 42 42">
            <circle className="circle-bg" cx="21" cy="21" r="18" />
            <circle
              className="circle"
              cx="21"
              cy="21"
              r="18"
              strokeDasharray={`${percentage}, 100`}
              strokeDashoffset="25"
              transform="rotate(90 21 21)"
            />
            <text x="21" y="23" className="percentage">
              {available} Days
            </text>
          </svg>
        </div>
        <div className="leave-card-footer">
          <div>
            <p>Available</p>
            <strong>{available}</strong>
          </div>
          <div>
            <p>Consumed</p>
            <strong>{used}</strong>
          </div>
        </div>
      </div>
    );
  };

  if (!user) return null;
  if (loading) return <p>Loading leave balance...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div style={{ padding: '2rem' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>Leave Balance</h2>

      <div className="summary-card">
        <div className="summary-box used">
          <p>Total Leaves Used</p>
          <h1>{totalUsed}</h1>
        </div>
        <div className="summary-box available">
          <p>Total Leaves Available</p>
          <h1>{totalAvailable}</h1>
        </div>
      </div>

      <div className="leave-balance-grid">
        {leaveDetails.map(renderLeaveCard)}
      </div>
    </div>
  );
}

export default LeaveBalance;
