import React, { useEffect, useState } from 'react';
import './Css/TeacherDashboard.css';
import { Routes, Route, Link, useNavigate, useParams } from 'react-router-dom';

function useLocalStorage(key, initial) {
  const [state, setState] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : initial;
    } catch (e) {
      return initial;
    }
  });
  
  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(state) : value;
      setState(valueToStore);
      localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (e) {
      console.error('Error saving to localStorage:', e);
    }
  };
  
  return [state, setValue];
}

const defaultStudents = [];

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
  const students = JSON.parse(localStorage.getItem('teacher_students') || '[]');
  const leaves = JSON.parse(localStorage.getItem('teacher_leaves') || '[]');
  const attendance = JSON.parse(localStorage.getItem('teacher_attendance') || '[]');
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
  const [students, setStudents] = useLocalStorage('teacher_students', []);
  const [message, setMessage] = useState('');

  function handleDelete(id) {
    if (!confirm('Delete this student?')) return;
    setStudents(s => s.filter(x => x.id !== id));
    // remove related attendance
    const attendance = JSON.parse(localStorage.getItem('teacher_attendance') || '[]');
    localStorage.setItem('teacher_attendance', JSON.stringify(attendance.filter(a=>a.studentId!==id)));
    setMessage('Student deleted');
    setTimeout(() => setMessage(''), 2000);
  }
  
  function handleEdit(id) {
    setEditingStudentId(id);
    setActiveTab('edit-student');
  }

  return (
    <div className="teacher-panel">
      {message && (
        <div style={{background:'#d4edda', color:'#155724', padding:'8px 12px', borderRadius:'4px', marginBottom:'10px'}}>
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
            <tr key={s.id}>
              <td>{s.roll}</td>
              <td>{s.name}</td>
              <td>{s.className}</td>
              <td>{s.email}</td>
              <td>
                <button className="btn" onClick={()=>handleEdit(s.id)}>✏️ Edit</button>
                <button className="btn danger" onClick={()=>handleDelete(s.id)}>🗑️ Delete</button>
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
  const [students, setStudents] = useLocalStorage('teacher_students', []);
  const existing = editing ? students.find(s=>s.id===editingStudentId) : null;
  const [form,setForm] = useState(existing || {id:null, roll:'', name:'', className:'', email:''});
  const [message, setMessage] = useState('');

  function handleSubmit(e){
    e.preventDefault();
    if(!form.name.trim()||!form.roll.trim()) {
      setMessage('Name and Roll required');
      setTimeout(() => setMessage(''), 2000);
      return;
    }
    if(editing){ setStudents(s=>s.map(x=> x.id===editingStudentId?{...form, id:editingStudentId}:x)); }
    else{ const id='s'+Date.now(); setStudents(s=>[{...form,id},...s]); }
    setActiveTab('students');
  }

  return (
    <div className="teacher-panel">
      {message && (
        <div style={{background: message.includes('required') ? '#f8d7da' : '#d4edda', color: message.includes('required') ? '#721c24' : '#155724', padding:'8px 12px', borderRadius:'4px', marginBottom:'10px'}}>
          {message}
        </div>
      )}
      <h2>{editing? 'Edit Student' : 'Add Student'}</h2>
      <form className="form" onSubmit={handleSubmit}>
        <label>Roll<input value={form.roll} onChange={e=>setForm({...form,roll:e.target.value})} /></label>
        <label>Name<input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} /></label>
        <label>Class<input value={form.className} onChange={e=>setForm({...form,className:e.target.value})} /></label>
        <label>Email<input value={form.email} onChange={e=>setForm({...form,email:e.target.value})} /></label>
        <div className="form-actions">
          <button className="btn primary" type="submit">{editing? 'Save':'Add'}</button>
          <button className="btn" type="button" onClick={()=>setActiveTab('students')}>Cancel</button>
        </div>
      </form>
    </div>
  );
}

function TeacherAttendance(){
  const [students] = useLocalStorage('teacher_students', []);
  const [attendance, setAttendance] = useLocalStorage('teacher_attendance', []);
  const [date, setDate] = useState(new Date().toISOString().slice(0,10));
  const [selected, setSelected] = useState({});
  const [saveMessage, setSaveMessage] = useState('');

  useEffect(()=>{
    // load today's attendance into selected
    const todays = attendance.find(a=>a.date===date);
    if(todays){
      const map = {};
      todays.records.forEach(r=> map[r.studentId]=r.status);
      setSelected(map);
    } else setSelected({});
  },[date,attendance]);

  function toggle(studentId){
    setSelected(s=> ({...s, [studentId]: s[studentId]==='present'? 'absent':'present'}));
  }

  function save(){
    const records = students.map(st=> ({ studentId: st.id, status: selected[st.id] || 'absent' }));
    setAttendance(a=>{
      const others = a.filter(x=>x.date!==date);
      return [{date, records}, ...others];
    });
    setSaveMessage('Attendance saved');
    setTimeout(() => setSaveMessage(''), 2000);
  }

  return (
    <div className="teacher-panel">
      <h2>Mark Attendance</h2>
      {saveMessage && (
        <div style={{background:'#d4edda', color:'#155724', padding:'8px 12px', borderRadius:'4px', marginBottom:'10px'}}>
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
            <tr key={s.id}><td>{s.roll}</td><td>{s.name}</td><td>{s.className}</td>
              <td style={{color: selected[s.id]==='present' ? 'green' : 'red', fontWeight: 'bold'}}>
                {selected[s.id]==='present' ? 'Present' : 'Absent'}
              </td>
              <td><button className={`btn ${selected[s.id]==='present'?'primary':''}`} onClick={()=>toggle(s.id)}>
                {selected[s.id]==='present'?'✅ Present':'❌ Absent'}
              </button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TeacherLeaves(){
  const [leaves, setLeaves] = useLocalStorage('teacher_leaves', []);
  const [students] = useLocalStorage('teacher_students', []);
  const [message, setMessage] = useState('');

  function approve(id){ 
    setLeaves(l=> l.map(x=> x.id===id? {...x,status:'approved'}:x)); 
    setMessage('Leave approved');
    setTimeout(() => setMessage(''), 2000);
  }
  function reject(id){ 
    setLeaves(l=> l.map(x=> x.id===id? {...x,status:'rejected'}:x)); 
    setMessage('Leave rejected');
    setTimeout(() => setMessage(''), 2000);
  }

  return (
    <div className="teacher-panel">
      {message && (
        <div style={{background:'#d4edda', color:'#155724', padding:'8px 12px', borderRadius:'4px', marginBottom:'10px'}}>
          {message}
        </div>
      )}
      <h2>Leave Approvals</h2>
      <table className="table">
        <thead><tr><th>Student</th><th>From</th><th>To</th><th>Reason</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>
          {leaves.map(l=> (
            <tr key={l.id}><td>{(students.find(s=>s.id===l.studentId)||{}).name||l.studentId}</td>
              <td>{l.from}</td><td>{l.to}</td><td>{l.reason}</td><td>{l.status}</td>
              <td>{l.status==='pending' && <>
                <button className="btn primary" onClick={()=>approve(l.id)}>✅ Approve</button>
                <button className="btn danger" onClick={()=>reject(l.id)}>❌ Reject</button>
              </>}</td>
            </tr>
          ))}
          {leaves.length===0 && <tr><td colSpan={6} style={{textAlign:'center'}}>No leaves.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}

function TeacherReports(){
  const attendance = JSON.parse(localStorage.getItem('teacher_attendance')||'[]');
  const students = JSON.parse(localStorage.getItem('teacher_students')||'[]');
  const leaves = JSON.parse(localStorage.getItem('teacher_leaves')||'[]');
  
  const totalDays = attendance.length;
  const totalPresent = attendance.reduce((sum, a) => sum + a.records.filter(r=>r.status==='present').length, 0);
  const avgAttendance = totalDays > 0 ? ((totalPresent / (totalDays * students.length)) * 100).toFixed(1) : 0;
  
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
            const present = a.records.filter(r=>r.status==='present').length;
            const absent = a.records.length - present;
            const percentage = a.records.length > 0 ? ((present/a.records.length)*100).toFixed(1) : 0;
            return (
              <tr key={a.date}>
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
  const [todos, setTodos] = useLocalStorage('teacher_todos', []);
  const [newTodo, setNewTodo] = useState('');
  const [filter, setFilter] = useState('all');

  const addTodo = (e) => {
    e.preventDefault();
    if (!newTodo.trim()) return;
    const todo = {
      id: 't' + Date.now(),
      text: newTodo.trim(),
      completed: false,
      createdAt: new Date().toISOString().slice(0,10)
    };
    setTodos([todo, ...todos]);
    setNewTodo('');
  };

  const toggleTodo = (id) => {
    setTodos(todos.map(t => t.id === id ? {...t, completed: !t.completed} : t));
  };

  const deleteTodo = (id) => {
    setTodos(todos.filter(t => t.id !== id));
  };

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
          <div key={todo.id} className="card" style={{
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
                onChange={() => toggleTodo(todo.id)}
              />
              <span style={{
                textDecoration: todo.completed ? 'line-through' : 'none',
                color: todo.completed ? '#666' : '#000',
                flex: 1
              }}>
                {todo.text}
              </span>
              <small style={{color: '#888'}}>{todo.createdAt}</small>
            </div>
            <button 
              className="btn danger" 
              onClick={() => deleteTodo(todo.id)}
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
  
  const exportData = () => {
    const students = JSON.parse(localStorage.getItem('teacher_students')||'[]');
    const attendance = JSON.parse(localStorage.getItem('teacher_attendance')||'[]');
    const leaves = JSON.parse(localStorage.getItem('teacher_leaves')||'[]');
    const todos = JSON.parse(localStorage.getItem('teacher_todos')||'[]');
    
    let report = 'TEACHER DASHBOARD DATA EXPORT\n';
    report += '================================\n\n';
    
    report += `STUDENTS (${students.length}):\n`;
    students.forEach(s => {
      report += `- ${s.name} (Roll: ${s.roll}, Class: ${s.className}, Email: ${s.email})\n`;
    });
    
    report += `\nATTENDANCE RECORDS (${attendance.length} days):\n`;
    attendance.forEach(a => {
      const present = a.records.filter(r=>r.status==='present').length;
      report += `- ${a.date}: ${present}/${a.records.length} students present\n`;
    });
    
    report += `\nLEAVE APPLICATIONS (${leaves.length}):\n`;
    leaves.forEach(l => {
      const student = students.find(s=>s.id===l.studentId);
      report += `- ${student?.name || 'Unknown'}: ${l.from} to ${l.to} (${l.status}) - ${l.reason}\n`;
    });
    
    report += `\nTODO TASKS (${todos.length}):\n`;
    todos.forEach(t => {
      report += `- [${t.completed ? 'DONE' : 'PENDING'}] ${t.text} (${t.createdAt})\n`;
    });
    
    const blob = new Blob([report], {type: 'text/plain'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `teacher-report-${new Date().toISOString().slice(0,10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    setMessage('Data exported');
    setTimeout(() => setMessage(''), 2000);
  };
  
  const clearAllData = () => {
    if (confirm('⚠️ This will delete ALL data. Are you sure?')) {
      localStorage.removeItem('teacher_students');
      localStorage.removeItem('teacher_attendance');
      localStorage.removeItem('teacher_leaves');
      localStorage.removeItem('teacher_todos');
      setMessage('All data cleared');
      setTimeout(() => {
        setMessage('');
        window.location.reload();
      }, 2000);
    }
  };
  
  return (
    <div className="teacher-panel">
      {message && (
        <div style={{background:'#d4edda', color:'#155724', padding:'8px 12px', borderRadius:'4px', marginBottom:'10px'}}>
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
          <button className="btn primary" onClick={exportData}>📥 Export Data</button>
          <button className="btn danger" onClick={clearAllData}>🗑️ Clear All Data</button>
        </div>
        
        <br/><h3>About</h3>
        <p>Here we can export the data as a PDF.</p>
        <p>Here we can also clear all the data.</p>
      </div>
    </div>
  );
}

