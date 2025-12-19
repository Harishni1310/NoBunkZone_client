import React from 'react'
import './Css/Header.css'
import {Link} from 'react-router-dom'

const Header = () => {
  return (
    <div className='header-page'>
        <div>
            <h1>No-Bunk-Zone</h1>
        </div>
        <div>
            <ul className='header-links'>
              <Link to='/'> 
                <li className='header-list'>Home</li>
              </Link>
              <Link to='/Features'> 
                <li className='header-list'>Features</li>
              </Link>
              <Link to='/Contact'> 
                <li className='header-list'>Contact</li>
               </Link>
               <Link to='/Login'> 
                <li className='header-list'><button className='header-button'>Login</button></li>
                </Link>
                <Link to='/Register'>
                <li className='header-list'><button className='header-button'>Register</button></li>
                </Link>
            </ul>
        </div>
    </div>
  )
}
export default Header
