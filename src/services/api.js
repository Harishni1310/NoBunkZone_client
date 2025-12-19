const API_BASE_URL = 'http://localhost:5000/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const authAPI = {
  login: async (credentials) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    } catch (error) {
      throw new Error(`Login failed: ${error.message}`);
    }
  },

  register: async (userData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    } catch (error) {
      throw new Error(`Registration failed: ${error.message}`);
    }
  }
};

export const studentAPI = {
  getProfile: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/student/profile`, {
        headers: getAuthHeaders()
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    } catch (error) {
      throw new Error(`Failed to get profile: ${error.message}`);
    }
  },

  getAttendance: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/student/attendance`, {
        headers: getAuthHeaders()
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    } catch (error) {
      throw new Error(`Failed to get attendance: ${error.message}`);
    }
  },

  applyLeave: async (leaveData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/student/leave`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify(leaveData)
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    } catch (error) {
      throw new Error(`Failed to apply leave: ${error.message}`);
    }
  },

  getLeaves: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/student/leaves`, {
        headers: getAuthHeaders()
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    } catch (error) {
      throw new Error(`Failed to get leaves: ${error.message}`);
    }
  }
};

export const teacherAPI = {
  getStudents: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/teacher/students`, {
        headers: getAuthHeaders()
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    } catch (error) {
      throw new Error(`Failed to get students: ${error.message}`);
    }
  },

  addStudent: async (studentData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/teacher/student`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify(studentData)
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    } catch (error) {
      throw new Error(`Failed to add student: ${error.message}`);
    }
  },

  updateStudent: async (studentId, studentData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/teacher/student/${studentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify(studentData)
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    } catch (error) {
      throw new Error(`Failed to update student: ${error.message}`);
    }
  },

  deleteStudent: async (studentId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/teacher/student/${studentId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    } catch (error) {
      throw new Error(`Failed to delete student: ${error.message}`);
    }
  },

  getAttendance: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/teacher/attendance`, {
        headers: getAuthHeaders()
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    } catch (error) {
      throw new Error(`Failed to get attendance: ${error.message}`);
    }
  },

  markAttendance: async (attendanceData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/teacher/attendance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify(attendanceData)
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    } catch (error) {
      throw new Error(`Failed to mark attendance: ${error.message}`);
    }
  },

  getLeaves: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/teacher/leaves`, {
        headers: getAuthHeaders()
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    } catch (error) {
      throw new Error(`Failed to get leaves: ${error.message}`);
    }
  },

  updateLeave: async (leaveId, updateData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/teacher/leave/${leaveId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify(updateData)
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    } catch (error) {
      throw new Error(`Failed to update leave: ${error.message}`);
    }
  },

  getTodos: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/teacher/todos`, {
        headers: getAuthHeaders()
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    } catch (error) {
      throw new Error(`Failed to get todos: ${error.message}`);
    }
  },

  addTodo: async (todoData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/teacher/todo`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify(todoData)
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    } catch (error) {
      throw new Error(`Failed to add todo: ${error.message}`);
    }
  },

  updateTodo: async (todoId, todoData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/teacher/todo/${todoId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify(todoData)
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    } catch (error) {
      throw new Error(`Failed to update todo: ${error.message}`);
    }
  },

  deleteTodo: async (todoId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/teacher/todo/${todoId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    } catch (error) {
      throw new Error(`Failed to delete todo: ${error.message}`);
    }
  }
};