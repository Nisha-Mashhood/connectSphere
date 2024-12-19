import {  Routes, Route } from 'react-router-dom'
import Home from './pages/User/Home'
import Header from './Components/User/Header'
import Login from './Components/User/Login'
import Signup from './Components/User/Signup'
import ForgotPassword from './Components/User/ForgotPassword'
import OTPVerification from './Components/User/OtpVerification'
import ResetPassword from './Components/User/ResetPassword'
import Profile from './Components/User/Profile'
import Categories from './Components/Admin/Categories'

function App() {

  return (
  <>
  <Header />
    <Routes>
      <Route path='/' element={ <Home />} />
      <Route path='/login' element={ <Login />} />
      <Route path='/signup' element={ <Signup />} />
      <Route path='/forgot' element={ <ForgotPassword />} />
      <Route path='/otp' element={ <OTPVerification />} />
      <Route path='/reset' element={ <ResetPassword />} />
      <Route path='/profile' element={ <Profile />} />
      <Route path='/categories' element={<Categories />} />
    </Routes>
  </>
  )
}

export default App
