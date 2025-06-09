import { useEffect, useState } from 'react'
import api from '../utils/api';
import { useUser } from '../userContext'
import '../styles/teamLeaveHistory.css'

function TeamLeaveHistory() {
  const { user } = useUser()
  const [teamMembers, setTeamMembers] = useState([])
  const [leaveHistories, setLeaveHistories] = useState({})

  useEffect(() => {
    if (user) {
      api.get('/auth/users')
        .then(res => {
          const filteredTeam = res.data.users.filter(u => u.managerId === user.id)
          setTeamMembers(filteredTeam)
        })
        .catch(() => setTeamMembers([]))
    }
  }, [user])

  useEffect(() => {
    const fetchLeaveHistories = async () => {
      const histories = {}
      for (const member of teamMembers) {
        try {
          const res = await api.get(`/leave/history/${member.id}`)
          histories[member.id] = {
            name: member.name,
            leaveHistory: res.data.leaveHistory || []
          }
        } catch {
          histories[member.id] = {
            name: member.name,
            leaveHistory: []
          }
        }
      }
      setLeaveHistories(histories)
    }

    if (teamMembers.length > 0) {
      fetchLeaveHistories()
    }
  }, [teamMembers])

  const formatDate = (dateStr) => {
    if (!dateStr) return ''
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
  }

  const formatDateTime = (isoString) => {
    const date = new Date(isoString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
  
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
  
    return `${day}-${month}-${year} ,${hours}:${minutes}:${seconds}`;
  };

  return (
    <div className="team-leave-history">
      <h2>Team Leave History</h2>
      {teamMembers.length === 0 && <p className="no-members">No team members found.</p>}
      {Object.entries(leaveHistories).map(([userId, data]) => (
        <div key={userId} className="member-section">
          <h3>{data.name}</h3>
          {data.leaveHistory.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>Type</th>
                  <th>From</th>
                  <th>To</th>
                  <th>Reason</th>
                  <th>TotalDays</th>
                  <th>Status</th>
                  <th>Requested On</th>
                  <th>Updated At</th>
                </tr>
              </thead>
              <tbody>
                {data.leaveHistory.map(leave => (
                  <tr key={leave.id}>
                    <td>{leave.leave_type || leave.leaveType}</td>
                    <td>{formatDate(leave.start_date || leave.startDate)}</td>
                    <td>{formatDate(leave.end_date || leave.endDate)}</td>
                    <td>{leave.reason || leave.reason}</td>
                    <td>{leave.totalDays || leave.total_days}</td>
                    <td>{leave.status}</td>
                    <td>{formatDateTime(leave.created_at || leave.createdAt)}</td>
                    <td>{leave.updated_at ? formatDateTime(leave.updated_at) : "Not updated"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="no-history">No leave history available.</p>
          )}
        </div>
      ))}
      
    </div>
  )
}

export default TeamLeaveHistory
