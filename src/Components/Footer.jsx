import React from 'react'
import './Css/Footer.css'
import { FaGithub , FaSquareInstagram , FaLinkedin } from "react-icons/fa6";
import { MdMarkEmailRead } from 'react-icons/md';
const Footer = () => {
  return (
    <div className='footer-page'>
      <a href="https://github.com/Harishni1310" target="_blank">
      <FaGithub className='icons'/>
      </a>
      <a href="mailto:harishni.ss2024csbs@sece.ac.in">
      <MdMarkEmailRead className='icons'/>
      </a>
      <a href="https://www.linkedin.com/in/harishni-s-s-379463324?utm_source=share_via&utm_content=profile&utm_medium=member_android" target="_blank">
      <FaLinkedin className='icons'/>
      </a>
      <a href="https://www.instagram.com/itzz._.harish._.niii" target="_blank">
      <FaSquareInstagram className='icons'/>
      </a>
      <p>© Student Leave & Attendance Management System. All Rights Reserved.</p>
    </div>
  )
}
export default Footer
