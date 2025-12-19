import React from "react";
import "./Css/Contact.css";

const Contact = () => {
  return (
    <div className="contact-page">
      <div className="contact-card">
        <h1>Contact Us</h1>

        <p className="contact-info">
          Have any questions or need support?  
          Feel free to reach out — we're here to help!
        </p>

        <form className="contact-form">
          <input type="text" placeholder="Your Name" required />
          <input type="email" placeholder="Your Email" required />
          <textarea placeholder="Your Message" rows="5" required></textarea>

          <button className="contact-btn">Send Message</button>
        </form>
      </div>
    </div>
  );
};

export default Contact;
