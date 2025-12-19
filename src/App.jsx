import React from 'react'
import Header from './Components/Header'
import Footer from './Components/Footer'
import Home from './Pages/Home'
import Features from './Pages/Features'
import Contact from './Pages/Contact'
import Login from './Pages/Login'
import Register from './Pages/Register'
import StudentDashboard from './Dashboard/StudentDashboard'
import TeacherDashboard from './Dashboard/TeacherDashboard'

import { BrowserRouter as Router,Routes,Route,useLocation} from 'react-router-dom'

const Layout =()=>{
  const location=useLocation();
  const hide=['/Login','/Register','/TeacherDashboard','/StudentDashboard'];
  const hideLayout=hide.includes(location.pathname)
  return(
    <>
    {!hideLayout && <Header/>}
    <Routes>
      <Route path='/' element={<Home/>}/>
      <Route path='/Features' element={<Features/>}/>
      <Route path='/Contact' element={<Contact/>}></Route>
      <Route path='/Login' element={<Login/>}/>
      <Route path='/Register' element={<Register/>}/>
      <Route path='/TeacherDashboard' element={<TeacherDashboard/>}/>
      <Route path='/StudentDashboard' element={<StudentDashboard/>}/>
    </Routes>
    {!hideLayout && <Footer/>}
    </>
  )
}
const App = () => {
  return (
    <div>
      <Router>
        <Layout/>
      </Router>
    </div>
  )
}
export default App
