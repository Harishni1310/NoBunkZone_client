import { useState, useEffect, useCallback } from 'react';

// Custom hook for real-time attendance updates
export const useAttendanceUpdates = () => {
  const [attendance, setAttendance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Fetch latest attendance from server
  const fetchAttendance = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token');
      
      const response = await fetch('/api/student/attendance', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Update state with fresh data
      setAttendance(data);
      setLastUpdated(new Date());
      
      // Cache in localStorage for offline access
      localStorage.setItem('latestAttendance', JSON.stringify(data));
      localStorage.setItem('attendanceLastFetch', Date.now().toString());
      
    } catch (err) {
      console.error('Fetch attendance error:', err);
      setError(err.message);
      
      // Try to load from cache if network fails
      const cachedData = localStorage.getItem('latestAttendance');
      if (cachedData) {
        setAttendance(JSON.parse(cachedData));
        setLastUpdated(new Date(parseInt(localStorage.getItem('attendanceLastFetch') || '0')));
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-refresh attendance data
  useEffect(() => {
    // Initial load
    fetchAttendance();
    
    // Set up polling for updates every 30 seconds
    const interval = setInterval(() => {
      fetchAttendance(false); // Silent refresh
    }, 30000);
    
    // Listen for focus events to refresh when user returns to tab
    const handleFocus = () => {
      const lastFetch = parseInt(localStorage.getItem('attendanceLastFetch') || '0');
      const timeSinceLastFetch = Date.now() - lastFetch;
      
      // Refresh if more than 1 minute since last fetch
      if (timeSinceLastFetch > 60000) {
        fetchAttendance(false);
      }
    };
    
    window.addEventListener('focus', handleFocus);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, [fetchAttendance]);

  // Manual refresh function
  const refreshAttendance = () => {
    fetchAttendance(true);
  };

  return {
    attendance,
    loading,
    error,
    lastUpdated,
    refreshAttendance
  };
};

// Sample Student Dashboard Component
export const StudentAttendanceView = () => {
  const { attendance, loading, error, lastUpdated, refreshAttendance } = useAttendanceUpdates();

  if (loading && !attendance) {
    return <div className="loading">Loading attendance data...</div>;
  }

  if (error && !attendance) {
    return (
      <div className="error">
        <p>Error loading attendance: {error}</p>
        <button onClick={refreshAttendance}>Retry</button>
      </div>
    );
  }

  return (
    <div className="attendance-container">
      <div className="attendance-header">
        <h2>My Attendance</h2>
        <div className="refresh-section">
          <button onClick={refreshAttendance} disabled={loading}>
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
          {lastUpdated && (
            <span className="last-updated">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>

      {attendance && (
        <>
          {/* Student Info */}
          <div className="student-info">
            <h3>{attendance.student.name}</h3>
            <p>Roll: {attendance.student.roll} | Class: {attendance.student.className}</p>
          </div>

          {/* Attendance Statistics */}
          <div className="attendance-stats">
            <div className="stat-card">
              <h4>Attendance Rate</h4>
              <div className="percentage">{attendance.statistics.attendancePercentage}%</div>
            </div>
            <div className="stat-card">
              <h4>Present Days</h4>
              <div className="count">{attendance.statistics.presentDays}</div>
            </div>
            <div className="stat-card">
              <h4>Total Days</h4>
              <div className="count">{attendance.statistics.totalDays}</div>
            </div>
          </div>

          {/* Recent Attendance Records */}
          <div className="attendance-records">
            <h4>Recent Attendance</h4>
            <div className="records-list">
              {attendance.attendance.slice(0, 10).map((record, index) => (
                <div key={index} className={`record-item ${record.status}`}>
                  <span className="date">{record.date}</span>
                  <span className={`status ${record.status}`}>
                    {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                  </span>
                  {record.markedAt && (
                    <span className="marked-time">
                      {new Date(record.markedAt).toLocaleTimeString()}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};