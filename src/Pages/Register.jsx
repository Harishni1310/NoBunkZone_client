import React, { useState } from "react";
import "./Css/Register.css";
import { Link, useNavigate } from 'react-router-dom'
const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    
    console.log('Submitting registration:', { name: formData.name, email: formData.email });
    
    try {
      const response = await fetch('https://nobunkzone-server-1.onrender.com/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password
        })
      });
      
      console.log('Response status:', response.status);
      const result = await response.json();
      console.log('Response data:', result);
      
      if (response.ok) {
        navigate('/login');
      } else {
        alert(result.msg || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration failed:', error);
      alert('Network error: ' + error.message);
    }
  };
  return (
    <div className="register-container">
      <div className="register-overlay"></div>

      <div className="register-card">
        <h1>Create Account</h1>

        <form className="register-form" onSubmit={handleSubmit}>
          <input 
            type="text" 
            placeholder="Full Name" 
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            required 
          />
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
          <input 
            type="password" 
            placeholder="Confirm Password" 
            value={formData.confirmPassword}
            onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
            required 
          />


          <button type="submit" className="register-btn">Register</button>
        </form>

        <p className="register-switch-text">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
