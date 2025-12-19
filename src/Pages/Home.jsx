import React, { useEffect, useState } from "react";
import "./Css/Home.css";

const Home = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setVisible(true), 200);
  }, []);

  return (
    <div className="home-page">
      <div className="overlay-light"></div>

      <div className={`home-content ${visible ? "show" : ""}`}>
        <h1>Student Leave & Attendance Management Portal</h1>

        <p>
          The Student Leave & Attendance Management System is a modern web 
          application designed to simplify and automate college attendance and 
          leave processes. Students can easily track attendance, apply for leave, 
          and stay updated with their academic progress—all through a user-friendly 
          interface. <br /><br />
          Administrators can manage records, approve or reject leave applications, 
          and generate detailed reports. With real-time updates, secure 
          authentication, and smooth workflow, the platform ensures transparency 
          and efficiency for students and staff.
        </p>
      </div>
    </div>
  );
};

export default Home;
