import React from "react";
import "./Css/Features.css";
import SplitText from './SplitText/SplitText'

const Features = () => {
  const handleAnimationComplete = () => {
  console.log('All letters have animated!');
};
  const featuresList = [
    {
      title: "Attendance Tracking",
      desc: "Students can view daily, monthly and overall attendance. Admin can mark attendance quickly and accurately."
    },
    {
      title: "Leave Application System",
      desc: "Students apply for leave with date, reason, and attachments. Admin approves or rejects instantly."
    },
    {
      title: "Role-Based Login",
      desc: "Separate login for Students and Admin with secure authentication."
    },
    {
      title: "Real-Time Notifications",
      desc: "Students get updates on leave status and attendance shortage alerts."
    },
    {
      title: "Student & Admin Dashboard",
      desc: "Visual charts, leave history, pending requests, and attendance stats."
    },
    {
      title: "Manage Student Details",
      desc: "Admin can add, edit, delete student records and view complete history."
    },
    {
      title: "Analytics & Reports",
      desc: "Graphical attendance trends and downloadable monthly reports."
    },
    {
      title: "Responsive & Secure UI",
      desc: "Mobile-friendly design and protected routes for data safety."
    },
  ];

  return (
    <div className="features-container">
      
      <div className="features-overlay"></div>

      <h1 className="features-heading"><SplitText
  text="Our Features"
  delay={100}
  duration={0.6}
  ease="power3.out"
  splitType="chars"
  from={{ opacity: 0, y: 40 }}
  to={{ opacity: 1, y: 0 }}
  threshold={0.1}
  rootMargin="-100px"
  textAlign="center"
  
  onLetterAnimationComplete={handleAnimationComplete}
/></h1>

      <div className="features-card-grid">
        {featuresList.map((item, index) => (
          <div className="features-card" key={index}>
            <h2>{item.title}</h2>
            <p>{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Features;
