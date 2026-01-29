import React, { useEffect, useState } from 'react';
import './Css/TeacherDashboard.css';
import { Routes, Route, Link, useNavigate, useParams } from 'react-router-dom';
import { teacherAPI } from '../services/api.js';



const TeacherDashboard = () =>  {
  const [activeTab, setActiveTab] = useState('overview');
  const [editingStudentId, setEditingStudentId] = useState(null);
  
  const renderContent = () => {
    switch(activeTab) {
      case 'students': return <TeacherStudentList setActiveTab={setActiveTab} setEditingStudentId={setEditingStudentId} />;
      case 'add-student': return <TeacherStudentForm setActiveTab={setActiveTab} />;
      case 'edit-student': return <TeacherStudentForm setActiveTab={setActiveTab} editing={true} editingStudentId={editingStudentId} />;
      case 'attendance': return <TeacherAttendance />;
      case 'leaves': return <TeacherLeaves />;
      case 'todo': return <TeacherTodo />;
      case 'reports': return <TeacherReports />;
      case 'settings': return <TeacherSettings />;
      default: return <TeacherOverview />;
    }
  };
  
  return (
      <div className="teacher-app">
        <TeacherSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <div style={{flex:1, display:'flex', flexDirection:'column', minHeight:'100vh'}}>
          <TeacherHeader />
          <div style={{flex:1, padding:'20px', background:'#f4f6f8', overflow:'auto'}}>
            {renderContent()}
          </div>
          <TeacherFooter />
        </div>
      </div>
  );
}

function TeacherHeader() {
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  return (
    <header style={{background:'#4848f8', color:'#fff', padding:'15px 20px 20px 60px', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
      <h1 style={{margin:0, fontSize:'24px'}}>Teacher Dashboard</h1>
      <span>📅 {currentDate}</span>
    </header>
  );
}

function TeacherFooter() {
  return (
    <footer style={{background:'#4848f8', color:'#fff', padding:'15px 20px', textAlign:'center'}}>
      <p style={{margin:'0 0 5px 0'}}>© NoBunkZone - Teacher Dashboard </p>
    </footer>
  );
}

export default TeacherDashboard

function TeacherSidebar({activeTab, setActiveTab}) {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      navigate('/');
    }
  };
  
  return (
    <aside className={`teacher-sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="teacher-brand">
        <div className="teacher-logo">{collapsed ? 'TC' : 'FACULTY'}</div>
        <button className="toggle-btn" onClick={() => setCollapsed(c => !c)}>{collapsed ? '→' : '←'}</button>
      </div>

      <nav>
        <ul>
          <li><a href="#" className={activeTab === 'overview' ? 'active' : ''} onClick={(e) => {e.preventDefault(); setActiveTab('overview')}}>📊 Overview</a></li>
          <li><a href="#" className={activeTab === 'students' ? 'active' : ''} onClick={(e) => {e.preventDefault(); setActiveTab('students')}}>👥 Students</a></li>
          <li><a href="#" className={activeTab === 'attendance' ? 'active' : ''} onClick={(e) => {e.preventDefault(); setActiveTab('attendance')}}>📋 Attendance</a></li>
          <li><a href="#" className={activeTab === 'leaves' ? 'active' : ''} onClick={(e) => {e.preventDefault(); setActiveTab('leaves')}}>📝 Leave Approvals</a></li>
          <li><a href="#" className={activeTab === 'todo' ? 'active' : ''} onClick={(e) => {e.preventDefault(); setActiveTab('todo')}}>✅ Todo List</a></li>
          <li><a href="#" className={activeTab === 'reports' ? 'active' : ''} onClick={(e) => {e.preventDefault(); setActiveTab('reports')}}>📈 Reports</a></li>
          <li><a href="#" className={activeTab === 'settings' ? 'active' : ''} onClick={(e) => {e.preventDefault(); setActiveTab('settings')}}>⚙️ Settings</a></li>
        </ul>
      </nav>
      
      <div style={{marginTop: 'auto', padding: '10px 0'}}>
        <button className="btn danger" onClick={handleLogout} style={{width:'100%', margin:'70px 0px 40px 0px'}}>🚪 Logout</button>
        <div className="teacher-footer">© Teacher Dashboard</div>
      </div>
    </aside>
  );
}

function TeacherOverview() {
  const [students, setStudents] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [studentsData, leavesData, attendanceData] = await Promise.all([
          teacherAPI.getStudents(),
          teacherAPI.getLeaves(),
          teacherAPI.getAttendance()
        ]);
        setStudents(studentsData);
        setLeaves(leavesData);
        setAttendance(attendanceData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="teacher-panel">Loading...</div>;

  return (
    <div className="teacher-panel">
      <h1>Teacher Overview</h1><br/>
      <p>Welcome! Use the menu to manage students, attendance and leaves.</p><br/><br/>
      <div className="teacher-cards">
        <div className="card">
          <div className="card-title">Students</div>
          <div className="card-value">{students.length}</div>
        </div>
        <div className="card">
          <div className="card-title">Pending Leaves</div>
          <div className="card-value">{leaves.filter(l=>l.status==='pending').length}</div>
        </div>
        <div className="card">
          <div className="card-title">Attendance Records</div>
          <div className="card-value">{attendance.length}</div>
        </div>
      </div>
    </div>
  );
}

function TeacherStudentList({setActiveTab, setEditingStudentId}) {
  const [students, setStudents] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const data = await teacherAPI.getStudents();
      setStudents(data);
    } catch (error) {
      setMessage('Error loading students: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this student?')) return;
    try {
      await teacherAPI.deleteStudent(id);
      setStudents(s => s.filter(x => x._id !== id));
      setMessage('Student deleted');
      setTimeout(() => setMessage(''), 2000);
    } catch (error) {
      setMessage('Error deleting student: ' + error.message);
    }
  };
  
  const handleEdit = (id) => {
    setEditingStudentId(id);
    setActiveTab('edit-student');
  };

  if (loading) return <div className="teacher-panel">Loading students...</div>;

  return (
    <div className="teacher-panel">
      {message && (
        <div style={{background: message.includes('Error') ? '#f8d7da' : '#d4edda', color: message.includes('Error') ? '#721c24' : '#155724', padding:'8px 12px', borderRadius:'4px', marginBottom:'10px'}}>
          {message}
        </div>
      )}
      <div className="panel-header">
        <h2>Student Management</h2>
        <div>
          <button className="btn primary" onClick={()=>setActiveTab('add-student')}>➕ Add Student</button>
        </div>
      </div>

      <table className="table">
        <thead>
          <tr><th>Roll</th><th>Name</th><th>Class</th><th>Email</th><th>Actions</th></tr>
        </thead>
        <tbody>
          {students.map(s=> (
            <tr key={s._id}>
              <td>{s.roll || 'N/A'}</td>
              <td>{s.name}</td>
              <td>{s.className || 'N/A'}</td>
              <td>{s.email}</td>
              <td>
                <button className="btn" onClick={()=>handleEdit(s._id)}>✏️ Edit</button>
                <button className="btn danger" onClick={()=>handleDelete(s._id)}>🗑️ Delete</button>
              </td>
            </tr>
          ))}
          {students.length===0 && (
            <tr><td colSpan={5} style={{textAlign:'center'}}>No students yet.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function TeacherStudentForm({setActiveTab, editing = false, editingStudentId = null}){
  const [students, setStudents] = useState([]);
  const [form, setForm] = useState({name:'', roll:'', className:'', email:'', password:''});
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editing && editingStudentId) {
      fetchStudent();
    }
  }, [editing, editingStudentId]);

  const fetchStudent = async () => {
    try {
      const data = await teacherAPI.getStudents();
      const student = data.find(s => s._id === editingStudentId);
      if (student) {
        setForm({...student, password: ''});
      }
    } catch (error) {
      setMessage('Error loading student: ' + error.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if(!form.name.trim() || !form.email.trim()) {
      setMessage('Name and email are required');
      setTimeout(() => setMessage(''), 2000);
      return;
    }
    if (!editing && !form.password.trim()) {
      setMessage('Password is required for new students');
      setTimeout(() => setMessage(''), 2000);
      return;
    }

    setLoading(true);
    try {
      if (editing) {
        await teacherAPI.updateStudent(editingStudentId, form);
        setMessage('Student updated successfully');
      } else {
        await teacherAPI.addStudent(form);
        setMessage('Student added successfully');
      }
      setTimeout(() => setActiveTab('students'), 1000);
    } catch (error) {
      setMessage('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="teacher-panel">
      {message && (
        <div style={{background: message.includes('Error') || message.includes('required') ? '#f8d7da' : '#d4edda', color: message.includes('Error') || message.includes('required') ? '#721c24' : '#155724', padding:'8px 12px', borderRadius:'4px', marginBottom:'10px'}}>
          {message}
        </div>
      )}
      <h2>{editing? 'Edit Student' : 'Add Student'}</h2>
      <form className="form" onSubmit={handleSubmit}>
        <label>Name<input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required /></label>
        <label>Email<input type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} required /></label>
        <label>Roll<input value={form.roll} onChange={e=>setForm({...form,roll:e.target.value})} /></label>
        <label>Class<input value={form.className} onChange={e=>setForm({...form,className:e.target.value})} /></label>
        {!editing && <label>Password<input type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} required /></label>}
        <div className="form-actions">
          <button className="btn primary" type="submit" disabled={loading}>{loading ? 'Saving...' : (editing? 'Save':'Add')}</button>
          <button className="btn" type="button" onClick={()=>setActiveTab('students')}>Cancel</button>
        </div>
      </form>
    </div>
  );
}

function TeacherAttendance(){
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [date, setDate] = useState(new Date().toISOString().slice(0,10));
  const [selected, setSelected] = useState({});
  const [saveMessage, setSaveMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    loadTodaysAttendance();
  }, [date, attendance]);

  const fetchData = async () => {
    try {
      const [studentsData, attendanceData] = await Promise.all([
        teacherAPI.getStudents(),
        teacherAPI.getAttendance()
      ]);
      setStudents(studentsData);
      setAttendance(attendanceData);
    } catch (error) {
      setSaveMessage('Error loading data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadTodaysAttendance = () => {
    const todays = attendance.find(a => a.date === date);
    if (todays) {
      const map = {};
      todays.records.forEach(r => map[r.studentId] = r.status);
      setSelected(map);
    } else {
      setSelected({});
    }
  };

  const toggle = (studentId) => {
    setSelected(s => ({...s, [studentId]: s[studentId] === 'present' ? 'absent' : 'present'}));
  };

  const save = async () => {
    try {
      const records = students.map(st => ({ studentId: st._id, status: selected[st._id] || 'absent' }));
      await teacherAPI.markAttendance({ date, records });
      setSaveMessage('Attendance saved successfully');
      setTimeout(() => setSaveMessage(''), 2000);
      // Refresh attendance data
      const attendanceData = await teacherAPI.getAttendance();
      setAttendance(attendanceData);
    } catch (error) {
      setSaveMessage('Error saving attendance: ' + error.message);
    }
  };

  if (loading) return <div className="teacher-panel">Loading...</div>;

  return (
    <div className="teacher-panel">
      <h2>Mark Attendance</h2>
      {saveMessage && (
        <div style={{background: saveMessage.includes('Error') ? '#f8d7da' : '#d4edda', color: saveMessage.includes('Error') ? '#721c24' : '#155724', padding:'8px 12px', borderRadius:'4px', marginBottom:'10px'}}>
          {saveMessage}
        </div>
      )}
      <div className="small-row">
        <label>📅 Date: <input type="date" value={date} onChange={e=>setDate(e.target.value)} /></label>
        <button className="btn primary" onClick={save}>💾 Save Attendance</button>
        <button className="btn" onClick={()=>setSelected({})}>🔄 Clear All</button>
      </div>
      <table className="table">
        <thead><tr><th>Roll</th><th>Name</th><th>Class</th><th>Status</th><th>Mark Attendance</th></tr></thead>
        <tbody>
          {students.map(s=> (
            <tr key={s._id}><td>{s.roll || 'N/A'}</td><td>{s.name}</td><td>{s.className || 'N/A'}</td>
              <td style={{color: selected[s._id]==='present' ? 'green' : 'red', fontWeight: 'bold'}}>
                {selected[s._id]==='present' ? 'Present' : 'Absent'}
              </td>
              <td><button className={`btn ${selected[s._id]==='present'?'primary':''}`} onClick={()=>toggle(s._id)}>
                {selected[s._id]==='present'?'✅ Present':'❌ Absent'}
              </button></td>
            </tr>
          ))}
          {students.length === 0 && <tr><td colSpan={5} style={{textAlign:'center'}}>No students found.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}

function TeacherLeaves(){
  const [leaves, setLeaves] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    try {
      const data = await teacherAPI.getLeaves();
      setLeaves(data);
    } catch (error) {
      setMessage('Error loading leaves: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const approve = async (id) => {
    try {
      await teacherAPI.updateLeave(id, {status: 'approved'});
      setLeaves(l=> l.map(x=> x._id===id? {...x,status:'approved'}:x));
      setMessage('Leave approved');
      setTimeout(() => setMessage(''), 2000);
    } catch (error) {
      setMessage('Error approving leave: ' + error.message);
    }
  };

  const reject = async (id) => {
    try {
      await teacherAPI.updateLeave(id, {status: 'rejected'});
      setLeaves(l=> l.map(x=> x._id===id? {...x,status:'rejected'}:x));
      setMessage('Leave rejected');
      setTimeout(() => setMessage(''), 2000);
    } catch (error) {
      setMessage('Error rejecting leave: ' + error.message);
    }
  };

  if (loading) return <div className="teacher-panel">Loading leaves...</div>;

  return (
    <div className="teacher-panel">
      {message && (
        <div style={{background: message.includes('Error') ? '#f8d7da' : '#d4edda', color: message.includes('Error') ? '#721c24' : '#155724', padding:'8px 12px', borderRadius:'4px', marginBottom:'10px'}}>
          {message}
        </div>
      )}
      <h2>Leave Approvals</h2>
      <table className="table">
        <thead><tr><th>Student</th><th>Email</th><th>From</th><th>To</th><th>Reason</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>
          {leaves.map(l=> (
            <tr key={l._id}>
              <td>{l.studentName || 'Unknown'}</td>
              <td>{l.studentEmail || 'N/A'}</td>
              <td>{l.from}</td>
              <td>{l.to}</td>
              <td>{l.reason}</td>
              <td style={{color: l.status === 'approved' ? 'green' : l.status === 'rejected' ? 'red' : 'orange'}}>{l.status}</td>
              <td>{l.status==='pending' && <>
                <button className="btn primary" onClick={()=>approve(l._id)}>✅ Approve</button>
                <button className="btn danger" onClick={()=>reject(l._id)}>❌ Reject</button>
              </>}</td>
            </tr>
          ))}
          {leaves.length===0 && <tr><td colSpan={7} style={{textAlign:'center'}}>No leaves.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}

function TeacherReports(){
  const [attendance, setAttendance] = useState([]);
  const [students, setStudents] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [attendanceData, studentsData, leavesData] = await Promise.all([
        teacherAPI.getAttendance(),
        teacherAPI.getStudents(),
        teacherAPI.getLeaves()
      ]);
      setAttendance(attendanceData);
      setStudents(studentsData);
      setLeaves(leavesData);
    } catch (error) {
      console.error('Error fetching reports data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="teacher-panel">Loading reports...</div>;
  
  const totalDays = attendance.length;
  const totalPresent = attendance.reduce((sum, a) => sum + (a.records?.filter(r=>r.status==='present').length || 0), 0);
  const avgAttendance = totalDays > 0 && students.length > 0 ? ((totalPresent / (totalDays * students.length)) * 100).toFixed(1) : 0;
  
  return (
    <div className="teacher-panel">
      <h2>📈 Monthly Report</h2><br/>
      
      <div className="teacher-cards">
        <div className="card">
          <div className="card-title">Total Students</div>
          <div className="card-value">{students.length}</div>
        </div>
        <div className="card">
          <div className="card-title">Days Recorded</div>
          <div className="card-value">{totalDays}</div>
        </div>
        <div className="card">
          <div className="card-title">Avg Attendance</div>
          <div className="card-value">{avgAttendance}%</div>
        </div>
        <div className="card">
          <div className="card-title">Pending Leaves</div>
          <div className="card-value">{leaves.filter(l=>l.status==='pending').length}</div>
        </div>
      </div>
      
      <br/><h3>📅 Daily Attendance Summary</h3>
      <table className="table">
        <thead><tr><th>Date</th><th>Present</th><th>Absent</th><th>Percentage</th></tr></thead>
        <tbody>
          {attendance.map(a=> {
            const present = a.records?.filter(r=>r.status==='present').length || 0;
            const total = a.records?.length || 0;
            const absent = total - present;
            const percentage = total > 0 ? ((present/total)*100).toFixed(1) : 0;
            return (
              <tr key={a._id || a.date}>
                <td>{a.date}</td>
                <td>{present}</td>
                <td>{absent}</td>
                <td>{percentage}%</td>
              </tr>
            );
          })}
          {attendance.length===0 && <tr><td colSpan={4} style={{textAlign:'center'}}>No attendance records yet.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}

function TeacherTodo(){
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState('');
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      const data = await teacherAPI.getTodos();
      setTodos(data);
    } catch (error) {
      setMessage('Error loading todos: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const addTodo = async (e) => {
    e.preventDefault();
    if (!newTodo.trim()) return;
    
    try {
      const todo = await teacherAPI.addTodo({
        text: newTodo.trim(),
        completed: false
      });
      setTodos([todo, ...todos]);
      setNewTodo('');
      setMessage('Todo added successfully');
      setTimeout(() => setMessage(''), 2000);
    } catch (error) {
      setMessage('Error adding todo: ' + error.message);
    }
  };

  const toggleTodo = async (id) => {
    const todo = todos.find(t => t._id === id);
    if (!todo) return;
    
    try {
      await teacherAPI.updateTodo(id, { completed: !todo.completed });
      setTodos(todos.map(t => t._id === id ? {...t, completed: !t.completed} : t));
    } catch (error) {
      setMessage('Error updating todo: ' + error.message);
    }
  };

  const deleteTodo = async (id) => {
    try {
      await teacherAPI.deleteTodo(id);
      setTodos(todos.filter(t => t._id !== id));
      setMessage('Todo deleted');
      setTimeout(() => setMessage(''), 2000);
    } catch (error) {
      setMessage('Error deleting todo: ' + error.message);
    }
  };

  if (loading) return <div className="teacher-panel">Loading todos...</div>;

  const filteredTodos = todos.filter(t => {
    if (filter === 'completed') return t.completed;
    if (filter === 'pending') return !t.completed;
    return true;
  });

  const completedCount = todos.filter(t => t.completed).length;
  const pendingCount = todos.length - completedCount;

  return (
    <div className="teacher-panel">
      <h2>✅ Todo List</h2>
      
      {message && (
        <div style={{background: message.includes('Error') ? '#f8d7da' : '#d4edda', color: message.includes('Error') ? '#721c24' : '#155724', padding:'8px 12px', borderRadius:'4px', marginBottom:'10px'}}>
          {message}
        </div>
      )}
      
      <div className="teacher-cards">
        <div className="card">
          <div className="card-title">Total Tasks</div>
          <div className="card-value">{todos.length}</div>
        </div>
        <div className="card">
          <div className="card-title">Pending</div>
          <div className="card-value" style={{color: 'orange'}}>{pendingCount}</div>
        </div>
        <div className="card">
          <div className="card-title">Completed</div>
          <div className="card-value" style={{color: 'green'}}>{completedCount}</div>
        </div>
      </div>

      <form className="form" onSubmit={addTodo} style={{marginBottom: '20px'}}>
        <div style={{display: 'flex', gap: '10px'}}>
          <input 
            type="text" 
            value={newTodo} 
            onChange={e => setNewTodo(e.target.value)}
            placeholder="Add a new task..."
            style={{flex: 1}}
          />
          <button className="btn primary" type="submit">➕ Add Task</button>
        </div>
      </form>

      <div className="small-row">
        <label>Filter: 
          <select value={filter} onChange={e => setFilter(e.target.value)}>
            <option value="all">All Tasks</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
          </select>
        </label>
      </div>

      <div style={{marginTop: '15px'}}>
        {filteredTodos.map(todo => (
          <div key={todo._id} className="card" style={{
            marginBottom: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: todo.completed ? '#f0f9ff' : '#fff'
          }}>
            <div style={{display: 'flex', alignItems: 'center', gap: '10px', flex: 1}}>
              <input 
                type="checkbox" 
                checked={todo.completed}
                onChange={() => toggleTodo(todo._id)}
              />
              <span style={{
                textDecoration: todo.completed ? 'line-through' : 'none',
                color: todo.completed ? '#666' : '#000',
                flex: 1
              }}>
                {todo.text}
              </span>
              <small style={{color: '#888'}}>{new Date(todo.createdAt).toLocaleDateString()}</small>
            </div>
            <button 
              className="btn danger" 
              onClick={() => deleteTodo(todo._id)}
              style={{marginLeft: '10px'}}
            >
              🗑️
            </button>
          </div>
        ))}
        {filteredTodos.length === 0 && (
          <div className="card" style={{textAlign: 'center', color: '#666'}}>
            {filter === 'all' ? 'No tasks yet. Add one above!' : `No ${filter} tasks.`}
          </div>
        )}
      </div>
    </div>
  );
}

function TeacherSettings(){
  const [settings, setSettings] = useState({
    notifications: true,
    autoSave: true,
    theme: 'light'
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  
  const exportData = async () => {
    setLoading(true);
    try {
      const [students, attendance, leaves, todos] = await Promise.all([
        teacherAPI.getStudents(),
        teacherAPI.getAttendance(),
        teacherAPI.getLeaves(),
        teacherAPI.getTodos()
      ]);
      
      let report = 'TEACHER DASHBOARD DATA EXPORT\n';
      report += '================================\n\n';
      
      report += `STUDENTS (${students.length}):\n`;
      students.forEach(s => {
        report += `- ${s.name} (Roll: ${s.roll || 'N/A'}, Class: ${s.className || 'N/A'}, Email: ${s.email})\n`;
      });
      
      report += `\nATTENDANCE RECORDS (${attendance.length} days):\n`;
      attendance.forEach(a => {
        const present = a.records?.filter(r=>r.status==='present').length || 0;
        const total = a.records?.length || 0;
        report += `- ${a.date}: ${present}/${total} students present\n`;
      });
      
      report += `\nLEAVE APPLICATIONS (${leaves.length}):\n`;
      leaves.forEach(l => {
        report += `- ${l.studentName || 'Unknown'}: ${l.from} to ${l.to} (${l.status}) - ${l.reason}\n`;
      });
      
      report += `\nTODO TASKS (${todos.length}):\n`;
      todos.forEach(t => {
        const date = new Date(t.createdAt).toLocaleDateString();
        report += `- [${t.completed ? 'DONE' : 'PENDING'}] ${t.text} (${date})\n`;
      });
      
      const blob = new Blob([report], {type: 'text/plain'});
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `teacher-report-${new Date().toISOString().slice(0,10)}.txt`;
      a.click();
      URL.revokeObjectURL(url);
      setMessage('Data exported successfully');
    } catch (error) {
      setMessage('Error exporting data: ' + error.message);
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };
  
  const clearAllData = () => {
    if (confirm('⚠️ This will clear your browser cache. Server data will remain intact. Continue?')) {
      localStorage.clear();
      setMessage('Browser cache cleared');
      setTimeout(() => {
        setMessage('');
        window.location.reload();
      }, 2000);
    }
  };
  
  return (
    <div className="teacher-panel">
      {message && (
        <div style={{background: message.includes('Error') ? '#f8d7da' : '#d4edda', color: message.includes('Error') ? '#721c24' : '#155724', padding:'8px 12px', borderRadius:'4px', marginBottom:'10px'}}>
          {message}
        </div>
      )}
      <h2>⚙️ Settings</h2>
      
      <div className="form">
        <br/><h3>Preferences</h3>
        <label>
          <input type="checkbox" checked={settings.notifications} 
                 onChange={e=>setSettings({...settings, notifications: e.target.checked})} />
          Enable Notifications
        </label>
        <label>
          <input type="checkbox" checked={settings.autoSave} 
                 onChange={e=>setSettings({...settings, autoSave: e.target.checked})} />
          Auto-save Changes
        </label>
        
        <br/><h3>Data Management</h3>
        <div className="form-actions">
          <button className="btn primary" onClick={exportData} disabled={loading}>
            {loading ? '🔄 Exporting...' : '📥 Export Data'}
          </button>
          <button className="btn danger" onClick={clearAllData}>🗑️ Clear Cache</button>
        </div>
        
        <br/><h3>About</h3>
        <p>Export your data as a text file for backup purposes.</p>
        <p>Clear cache will only remove local browser data, server data remains safe.</p>
      </div>
    </div>
  );
}

