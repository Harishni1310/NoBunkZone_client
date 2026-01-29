import React, { useState } from "react";
import "./Css/Login.css";
import {Link, useNavigate} from 'react-router-dom'

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const API_URL = process.env.REACT_APP_API_URL || (process.env.NODE_ENV === 'production' ? 'https://nobunkzone-server-5.onrender.com' : 'http://localhost:5000');
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const result = await response.json();
      
      if (response.ok) {
        // Store auth data
        localStorage.setItem('token', result.token);
        localStorage.setItem('userName', result.name);
        localStorage.setItem('userRole', result.role);
        localStorage.setItem('userEmail', result.email);
        
        // Pre-fetch latest data based on role
        if (result.role === 'student') {
          // Fetch latest attendance on login
          try {
            const attendanceResponse = await fetch(`${API_URL}/api/student/attendance`, {
              headers: { 
                'Authorization': `Bearer ${result.token}`,
                'Content-Type': 'application/json'
              }
            });
            
            if (attendanceResponse.ok) {
              const attendanceData = await attendanceResponse.json();
              localStorage.setItem('latestAttendance', JSON.stringify(attendanceData));
              localStorage.setItem('attendanceLastFetch', Date.now().toString());
            }
          } catch (attendanceError) {
            console.log('Could not pre-fetch attendance:', attendanceError);
          }
        }
        
        // Role-based redirection
        if (result.role === 'admin' || result.role === 'teacher') {
          navigate('/TeacherDashboard');
        } else {
          navigate('/StudentDashboard');
        }
      } else {
        alert(result.msg || 'Login failed');
      }
    } catch (error) {
      alert('Network error: ' + error.message);
    }
  };

  return (
    <div className="login-container">
      <div className="login-overlay"></div>

      <div className="login-card">
        <h1>Login</h1>

        <form className="login-form" onSubmit={handleSubmit}>
          <input 
            type="email" 
            placeholder="Email" 
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            required 
          />
          <input 
            type="password" 
            placeholder="Password" 
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            required 
          />
          <button type="submit" className="login-btn">Login</button>
        </form>

        <p className="login-switch-text">
          Don’t have an account? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
