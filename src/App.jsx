import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Login from './pages/Auth/Login';
import Signup from './pages/Auth/Register';
import PatientDashboard from './pages/patient/Dashboard';
import DoctorDashboard from './pages/doctor/Dashboard';
import ProtectedRoutes from './components/ProtectedRoutes';
import NotFound from './pages/NotFound';
import Layout from './components/Layout';
import AIConsulting from './pages/patient/AIConsulting';
import Pharmacy from './pages/patient/Pharmacy';
import BookAppointment from './pages/patient/BookAppointment';
import Dietetics from './pages/patient/Dietetics';
import MentalHealth from './pages/patient/MentalHealth';
import Profile from './pages/patient/Profile';
import Cart from './pages/patient/Cart';
import EditProfile from './pages/patient/EditProfile';
import Appointments from './pages/doctor/Appointments';
import Patients from './pages/doctor/Patients';
import DoctorProfile from './pages/doctor/Profile';
import Prescriptions from './pages/doctor/Prescriptions';


function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Signup />} />

          {/* Patient Routes */}
          <Route path="/patient-dashboard" element={
            <ProtectedRoutes>
              <Layout>
                  <PatientDashboard />
              </Layout>
            </ProtectedRoutes>
          } />
          <Route path="/ai-consult" element={
            <ProtectedRoutes>
              <Layout>
                  <AIConsulting />
              </Layout>
            </ProtectedRoutes>
          } />
          <Route path="/epharmacy" element={
            <ProtectedRoutes>
              <Layout>
                  <Pharmacy />
              </Layout>
            </ProtectedRoutes>
          } />
          <Route path="/booking" element={
            <ProtectedRoutes>
              <Layout>
                  <BookAppointment />
              </Layout>
            </ProtectedRoutes>
          } />
          <Route path="/dietetics" element={
            <ProtectedRoutes>
              <Layout>
                  <Dietetics />
              </Layout>
            </ProtectedRoutes>
          } />
          <Route path="/psychology" element={
            <ProtectedRoutes>
              <Layout>
                  <MentalHealth />
              </Layout>
            </ProtectedRoutes>
          } />
          <Route path="/profile" element={
            <ProtectedRoutes>
              <Layout>
                  <Profile />
              </Layout>
            </ProtectedRoutes>
          } />
          <Route path="/cart" element={
            <ProtectedRoutes>
              <Layout>
                  <Cart />
              </Layout>
            </ProtectedRoutes>
          } />
          <Route path="/edit-profile" element={
            <ProtectedRoutes>
              <Layout>
                  <EditProfile />
              </Layout>
            </ProtectedRoutes>
          } />


          {/* Doctors Routes */}
          <Route path="/doctor-dashboard" element={
            <ProtectedRoutes>
              <Layout>
                <DoctorDashboard />
              </Layout>
            </ProtectedRoutes>
          } />
          <Route path="/prescriptions" element={
            <ProtectedRoutes>
              <Layout>
                <Prescriptions />
              </Layout>
            </ProtectedRoutes>
          } />
          <Route path="/appointments" element={
            <ProtectedRoutes>
              <Layout>
                <Appointments />
              </Layout>
            </ProtectedRoutes>
          } />
          <Route path="/patients" element={
            <ProtectedRoutes>
              <Layout>
                <Patients />
              </Layout>
            </ProtectedRoutes>
          } />
          <Route path="/profile" element={
            <ProtectedRoutes>
              <Layout>
                <DoctorProfile />
              </Layout>
            </ProtectedRoutes>
          } />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;