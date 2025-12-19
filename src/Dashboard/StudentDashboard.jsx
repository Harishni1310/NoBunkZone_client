import React, { useState, useEffect } from 'react';
import './Css/StudentDashboard.css';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { studentAPI } from '../services/api.js';

const StudentDashboard=()=>{
  const [activeTab, setActiveTab] = useState('overview');
  
  const renderContent = () => {
    switch(activeTab) {
      case 'my-attendance': return <MyAttendance />;
      case 'apply-leave': return <ApplyLeave setActiveTab={setActiveTab} />;
      case 'leave-status': return <LeaveStatus />;
      case 'profile': return <StudentProfile setActiveTab={setActiveTab} />;
      default: return <StudentOverview />;
    }
  };
  
  return (
      <div className="student-app">
        <StudentSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <div style={{flex:1, display:'flex', flexDirection:'column', minHeight:'100vh'}}>
          <StudentHeader />
          <div style={{flex:1, padding:'20px', background:'#f6f8fa', overflow:'auto'}}>
            {renderContent()}
          </div>
          <StudentFooter />
        </div>
      </div>
  );
}

function StudentHeader() {
  const [currentUser, setCurrentUser] = useState({name: 'Student'});
  
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userName = localStorage.getItem('userName');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setCurrentUser({name: payload.name || userName || 'Student'});
      } catch (error) {
        console.error('Error parsing token:', error);
        setCurrentUser({name: userName || 'Student'});
      }
    } else if (userName) {
      setCurrentUser({name: userName});
    }
  }, []);
  
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  return (
    <header style={{background:'#4848f8', color:'#fff', padding:'15px 20px', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
      <h1 style={{margin:0, fontSize:'24px'}}>Welcome, {currentUser.name}!</h1>
      <span>📅 {currentDate}</span>
    </header>
  );
}

function StudentFooter() {
  return (
    <footer style={{background:'#4848f8', color:'#fff', padding:'15px 20px', textAlign:'center'}}>
      <p style={{margin:'0 0 5px 0'}}>© NoBunkZone - Student Portal</p>
    </footer>
  );
}

export default StudentDashboard

function StudentSidebar({activeTab, setActiveTab}){
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  
  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      navigate('/');
    }
  };
  
  return (
    <aside className={`student-sidebar ${collapsed? 'collapsed':''}`}>
      <div className="student-brand">
        <div className="student-logo">{collapsed? 'ST':'STUDENT'}</div>
        <button className="toggle-btn" onClick={()=>setCollapsed(c=>!c)}>{collapsed? '→':'←'}</button>
      </div>
      <nav>
        <ul>
          <li><a href="#" className={activeTab === 'overview' ? 'active' : ''} onClick={(e) => {e.preventDefault(); setActiveTab('overview')}}>📊 Overview</a></li>
          <li><a href="#" className={activeTab === 'my-attendance' ? 'active' : ''} onClick={(e) => {e.preventDefault(); setActiveTab('my-attendance')}}>📋 My Attendance</a></li>
          <li><a href="#" className={activeTab === 'apply-leave' ? 'active' : ''} onClick={(e) => {e.preventDefault(); setActiveTab('apply-leave')}}>📝 Apply Leave</a></li>
          <li><a href="#" className={activeTab === 'leave-status' ? 'active' : ''} onClick={(e) => {e.preventDefault(); setActiveTab('leave-status')}}>🕰️ Leave Status</a></li>
          <li><a href="#" className={activeTab === 'profile' ? 'active' : ''} onClick={(e) => {e.preventDefault(); setActiveTab('profile')}}>👤 Profile</a></li>
        </ul>
      </nav>
      
      <div style={{marginTop: 'auto', padding: '10px 0'}}>
        <button className="btn danger" onClick={handleLogout} style={{width:'100%', margin:'0px 0px 60px 0px'}}>🚪 Logout</button>
        <div className="student-footer">© Student Dashboard</div>
      </div>
    </aside>
  );
}

function StudentOverview(){
  const [currentUser, setCurrentUser] = useState({name: 'Guest Student'});
  const [attendance, setAttendance] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const userName = localStorage.getItem('userName');
        
        console.log('Token:', token ? 'Present' : 'Missing');
        console.log('UserName:', userName);
        
        let studentProfile = null;
        try {
          studentProfile = await studentAPI.getProfile();
          console.log('Student profile:', studentProfile);
        } catch (error) {
          console.log('No student profile found:', error.message);
        }
        
        if (studentProfile) {
          setCurrentUser({name: studentProfile.name || userName || 'Guest Student', id: studentProfile._id});
        } else if (token) {
          try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            console.log('Token payload:', payload);
            setCurrentUser({name: payload.name || userName || 'Guest Student', id: payload.id});
          } catch (tokenError) {
            console.error('Error parsing token:', tokenError);
            setCurrentUser({name: userName || 'Guest Student', id: null});
          }
        }
        
        try {
          const [attendanceData, leavesData] = await Promise.all([
            studentAPI.getAttendance(),
            studentAPI.getLeaves()
          ]);
          console.log('Attendance data:', attendanceData);
          console.log('Leaves data:', leavesData);
          setAttendance(Array.isArray(attendanceData) ? attendanceData : []);
          setLeaves(Array.isArray(leavesData) ? leavesData : []);
        } catch (dataError) {
          console.error('Error fetching attendance/leaves:', dataError.message);
          setAttendance([]);
          setLeaves([]);
        }
      } catch (error) {
        console.error('Error in fetchData:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);
  
  if (loading) return <div className="student-panel">Loading...</div>;
  
  console.log('Current user:', currentUser);
  console.log('Attendance array:', attendance);
  console.log('Leaves array:', leaves);
  
  // Calculate student's attendance percentage
  const myRecords = attendance.flatMap(a=> a.records?.filter(r=> r.studentId === currentUser.id) || []);
  const presentDays = myRecords.filter(r=> r.status === 'present').length;
  const totalDays = myRecords.length;
  const attendancePercentage = totalDays > 0 ? ((presentDays/totalDays)*100).toFixed(1) : 0;
  
  const myLeaves = leaves.filter(l=> l.studentId === currentUser.id);
  const pendingLeaves = myLeaves.filter(l=> l.status === 'pending').length;
  
  const refreshData = async () => {
    setLoading(true);
    try {
      const [attendanceData, leavesData] = await Promise.all([
        studentAPI.getAttendance(),
        studentAPI.getLeaves()
      ]);
      console.log('Refreshed - Attendance data:', attendanceData);
      console.log('Refreshed - Leaves data:', leavesData);
      setAttendance(Array.isArray(attendanceData) ? attendanceData : []);
      setLeaves(Array.isArray(leavesData) ? leavesData : []);
    } catch (error) {
      console.error('Error refreshing data:', error.message);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="student-panel">
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
        <h1>👋 Welcome, {currentUser.name}!</h1>
        <button className="btn primary" onClick={refreshData} disabled={loading}>
          {loading ? '🔄 Loading...' : '🔄 Refresh Data'}
        </button>
      </div>
      
      <div className="info-cards">
        <div className="card">
          <div className="card-title">My Attendance</div>
          <div className="card-value">{attendancePercentage}%</div>
        </div>
        <div className="card">
          <div className="card-title">Days Present</div>
          <div className="card-value">{presentDays}/{totalDays}</div>
        </div>
        <div className="card">
          <div className="card-title">Pending Leaves</div>
          <div className="card-value">{pendingLeaves}</div>
        </div>
        <div className="card">
          <div className="card-title">Total Applications</div>
          <div className="card-value">{myLeaves.length}</div>
        </div>
      </div>
      
      <div style={{marginTop: '20px'}}>
        <br/><h3>📅 Recent Activity</h3><br/>
        {totalDays === 0 && <p>No attendance records yet.</p>}
        {totalDays > 0 && myRecords.length > 0 && (
          <p>Last attendance: {myRecords[myRecords.length-1]?.date} - You were {myRecords[myRecords.length-1]?.status || 'not marked'}</p>
        )}
      </div>
    </div>
  );
}

function MyAttendance(){
  const [currentUser, setCurrentUser] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const userName = localStorage.getItem('userName');
        
        let studentProfile = null;
        try {
          studentProfile = await studentAPI.getProfile();
        } catch (error) {
          console.log('No student profile found');
        }
        
        if (studentProfile) {
          setCurrentUser({
            name: studentProfile.name || userName,
            id: studentProfile._id,
            roll: studentProfile.roll,
            className: studentProfile.className
          });
        } else if (token) {
          const payload = JSON.parse(atob(token.split('.')[1]));
          setCurrentUser({name: payload.name || userName, id: payload.id, roll: payload.roll, className: payload.className});
        }
        
        const attendanceData = await studentAPI.getAttendance();
        setAttendance(attendanceData);
      } catch (error) {
        console.error('Error fetching attendance:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);
  
  if (loading) return <div className="student-panel">Loading attendance...</div>;
  
  const records = attendance.flatMap(a=> a.records?.map(r=> ({date:a.date, ...r})) || []);
  const myRecords = records.filter(r=> r.studentId === currentUser?.id);
  
  return (
    <div className="student-panel">
      <h2>📋 My Attendance Records</h2>
      
      {currentUser && (
        <div style={{marginBottom: '20px', padding: '15px', background: '#f8f9fa', borderRadius: '8px'}}>
          <p><strong>Name:</strong> {currentUser.name}</p>
          <p><strong>Roll:</strong> {currentUser.roll}</p>
          <p><strong>Class:</strong> {currentUser.className}</p>
        </div>
      )}
      
      {myRecords.length === 0 ? (
        <p>No attendance records found.</p>
      ) : (
        <div className="attendance-table">
          <table style={{width: '100%', borderCollapse: 'collapse'}}>
            <thead>
              <tr style={{background: '#4848f8', color: 'white'}}>
                <th style={{padding: '10px', border: '1px solid #ddd'}}>Date</th>
                <th style={{padding: '10px', border: '1px solid #ddd'}}>Status</th>
              </tr>
            </thead>
            <tbody>
              {myRecords.map((record, index) => (
                <tr key={index}>
                  <td style={{padding: '10px', border: '1px solid #ddd'}}>{record.date}</td>
                  <td style={{padding: '10px', border: '1px solid #ddd', color: record.status === 'present' ? 'green' : 'red'}}>
                    {record.status === 'present' ? '✅ Present' : '❌ Absent'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function ApplyLeave({setActiveTab}) {
  const [formData, setFormData] = useState({
    from: '',
    to: '',
    reason: '',
    type: 'sick'
  });
  const [loading, setLoading] = useState(false);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Debug: Check token and user info
    const token = localStorage.getItem('token');
    console.log('Token exists:', !!token);
    console.log('Form data:', formData);
    
    if (!token) {
      alert('Please login first');
      setLoading(false);
      return;
    }
    
    // Check user role
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      console.log('Token payload:', payload);
      if (payload.role !== 'student') {
        alert(`Access denied. Your role is '${payload.role}' but 'student' role is required.`);
        setLoading(false);
        return;
      }
    } catch (error) {
      console.error('Token parsing error:', error);
      alert('Invalid token. Please login again.');
      setLoading(false);
      return;
    }
    
    try {
      await studentAPI.applyLeave(formData);
      alert('Leave application submitted successfully!');
      setFormData({from: '', to: '', reason: '', type: 'sick'});
      setActiveTab('leave-status');
    } catch (error) {
      console.error('Leave application error:', error);
      alert('Error submitting leave application: ' + error.message);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="student-panel">
      <h2>📝 Apply for Leave</h2>
      <form onSubmit={handleSubmit} style={{maxWidth: '500px'}}>
        <div style={{marginBottom: '15px'}}>
          <label>Leave Type:</label>
          <select 
            value={formData.type}
            onChange={(e) => setFormData({...formData, type: e.target.value})}
            style={{width: '100%', padding: '8px', marginTop: '5px'}}
          >
            <option value="sick">Sick Leave</option>
            <option value="personal">Personal Leave</option>
            <option value="emergency">Emergency Leave</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div style={{marginBottom: '15px'}}>
          <label>From Date:</label>
          <input 
            type="date" 
            value={formData.from}
            onChange={(e) => setFormData({...formData, from: e.target.value})}
            required
            style={{width: '100%', padding: '8px', marginTop: '5px'}}
          />
        </div>
        <div style={{marginBottom: '15px'}}>
          <label>To Date:</label>
          <input 
            type="date" 
            value={formData.to}
            onChange={(e) => setFormData({...formData, to: e.target.value})}
            required
            style={{width: '100%', padding: '8px', marginTop: '5px'}}
          />
        </div>
        <div style={{marginBottom: '15px'}}>
          <label>Reason:</label>
          <textarea 
            value={formData.reason}
            onChange={(e) => setFormData({...formData, reason: e.target.value})}
            required
            rows="4"
            placeholder="Please provide detailed reason for leave..."
            style={{width: '100%', padding: '8px', marginTop: '5px'}}
          />
        </div>
        <button type="submit" disabled={loading} className="btn primary">
          {loading ? 'Submitting...' : 'Submit Application'}
        </button>
      </form>
    </div>
  );
}

function LeaveStatus() {
  const [leaves, setLeaves] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const userName = localStorage.getItem('userName');
        
        let studentProfile = null;
        try {
          studentProfile = await studentAPI.getProfile();
        } catch (error) {
          console.log('No student profile found');
        }
        
        if (studentProfile) {
          setCurrentUser({name: studentProfile.name || userName, id: studentProfile._id});
        } else if (token) {
          const payload = JSON.parse(atob(token.split('.')[1]));
          setCurrentUser({name: payload.name || userName, id: payload.id});
        }
        
        const leavesData = await studentAPI.getLeaves();
        setLeaves(leavesData);
      } catch (error) {
        console.error('Error fetching leaves:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);
  
  if (loading) return <div className="student-panel">Loading leave status...</div>;
  
  const myLeaves = leaves.filter(l => l.studentId === currentUser?.id);
  
  return (
    <div className="student-panel">
      <h2>🕰️ Leave Applications Status</h2>
      
      {myLeaves.length === 0 ? (
        <p>No leave applications found.</p>
      ) : (
        <div className="leaves-table">
          <table style={{width: '100%', borderCollapse: 'collapse'}}>
            <thead>
              <tr style={{background: '#4848f8', color: 'white'}}>
                <th style={{padding: '10px', border: '1px solid #ddd'}}>From Date</th>
                <th style={{padding: '10px', border: '1px solid #ddd'}}>To Date</th>
                <th style={{padding: '10px', border: '1px solid #ddd'}}>Reason</th>
                <th style={{padding: '10px', border: '1px solid #ddd'}}>Status</th>
              </tr>
            </thead>
            <tbody>
              {myLeaves.map((leave, index) => (
                <tr key={index}>
                  <td style={{padding: '10px', border: '1px solid #ddd'}}>{leave.from}</td>
                  <td style={{padding: '10px', border: '1px solid #ddd'}}>{leave.to}</td>
                  <td style={{padding: '10px', border: '1px solid #ddd'}}>{leave.reason}</td>
                  <td style={{padding: '10px', border: '1px solid #ddd', 
                    color: leave.status === 'approved' ? 'green' : leave.status === 'rejected' ? 'red' : 'orange'}}>
                    {leave.status === 'approved' ? '✅ Approved' : 
                     leave.status === 'rejected' ? '❌ Rejected' : '⏳ Pending'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function StudentProfile({setActiveTab}) {
  const [currentUser, setCurrentUser] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const userName = localStorage.getItem('userName');
        
        let studentProfile = null;
        try {
          studentProfile = await studentAPI.getProfile();
        } catch (error) {
          console.log('No student profile found');
        }
        
        if (studentProfile) {
          setCurrentUser({
            id: studentProfile._id,
            name: studentProfile.name || userName,
            email: studentProfile.email,
            roll: studentProfile.roll,
            className: studentProfile.className,
            phone: studentProfile.phone
          });
        } else if (token) {
          const payload = JSON.parse(atob(token.split('.')[1]));
          setCurrentUser({
            id: payload.id,
            name: payload.name || userName,
            email: payload.email,
            roll: payload.roll,
            className: payload.className
          });
        }
        
        const [attendanceData, leavesData] = await Promise.all([
          studentAPI.getAttendance(),
          studentAPI.getLeaves()
        ]);
        setAttendance(attendanceData);
        setLeaves(leavesData);
      } catch (error) {
        console.error('Error fetching profile data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);
  
  if (loading) return <div className="student-panel">Loading profile...</div>;
  
  if (!currentUser) {
    return (
      <div className="student-panel">
        <h2>👤 Student Profile</h2>
        <div style={{padding: '20px', background: '#f8f9fa', borderRadius: '8px', textAlign: 'center'}}>
          <p>⚠️ No student profile found.</p>
          <p>Please contact your teacher to add your profile to the system.</p>
        </div>
      </div>
    );
  }
  
  // Calculate statistics
  const myRecords = attendance.flatMap(a=> a.records?.filter(r=> r.studentId === currentUser.id) || []);
  const presentDays = myRecords.filter(r=> r.status === 'present').length;
  const totalDays = myRecords.length;
  const attendancePercentage = totalDays > 0 ? ((presentDays/totalDays)*100).toFixed(1) : 0;
  
  const myLeaves = leaves.filter(l=> l.studentId === currentUser.id);
  const approvedLeaves = myLeaves.filter(l=> l.status === 'approved').length;
  
  return (
    <div className="student-panel">
      <h2>👤 Student Profile</h2>
      
      <div style={{background: '#fff', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '25px'}}>
          <div style={{width: '80px', height: '80px', borderRadius: '50%', background: '#4848f8', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '28px', fontWeight: 'bold'}}>
            {currentUser.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 style={{margin: 0, fontSize: '24px', color: '#333'}}>{currentUser.name}</h3>
            <p style={{margin: '5px 0', color: '#666', fontSize: '16px'}}>Roll No: {currentUser.roll || 'N/A'}</p>
            <p style={{margin: '5px 0', color: '#666', fontSize: '16px'}}>Class: {currentUser.className || 'N/A'}</p>
          </div>
        </div>
        
        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '25px'}}>
          <div style={{padding: '15px', background: '#f8f9fa', borderRadius: '8px'}}>
            <strong style={{color: '#4848f8'}}>📧 Email:</strong>
            <p style={{margin: '5px 0 0 0'}}>{currentUser.email || 'Not provided'}</p>
          </div>
          <div style={{padding: '15px', background: '#f8f9fa', borderRadius: '8px'}}>
            <strong style={{color: '#4848f8'}}>📱 Phone:</strong>
            <p style={{margin: '5px 0 0 0'}}>{currentUser.phone || 'Not provided'}</p>
          </div>
        </div>
        
        <h4 style={{color: '#333', marginBottom: '15px'}}>📈 Academic Statistics</h4>
        <div className="info-cards">
          <div className="card">
            <div className="card-title">Attendance Rate</div>
            <div className="card-value" style={{color: attendancePercentage >= 75 ? 'green' : 'red'}}>{attendancePercentage}%</div>
          </div>
          <div className="card">
            <div className="card-title">Days Present</div>
            <div className="card-value">{presentDays}</div>
          </div>
          <div className="card">
            <div className="card-title">Total Days</div>
            <div className="card-value">{totalDays}</div>
          </div>
          <div className="card">
            <div className="card-title">Approved Leaves</div>
            <div className="card-value">{approvedLeaves}</div>
          </div>
        </div>
        
        <div style={{marginTop: '25px', padding: '20px', background: '#f8f9fa', borderRadius: '8px'}}>
          <h4 style={{color: '#333', marginBottom: '15px'}}>📝 Quick Actions</h4>
          <div style={{display: 'flex', gap: '10px', flexWrap: 'wrap'}}>
            <button className="btn primary" onClick={() => setActiveTab('my-attendance')}>📋 View Attendance</button>
            <button className="btn" onClick={() => setActiveTab('apply-leave')}>📝 Apply Leave</button>
            <button className="btn" onClick={() => setActiveTab('leave-status')}>🕰️ Leave Status</button>
          </div>
        </div>
      </div>
    </div>
  );
}