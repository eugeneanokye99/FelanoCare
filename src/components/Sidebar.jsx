import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Menu, X } from 'lucide-react';

export default function Sidebar() {
  const { logout, userData } = useAuth();
  const navigate = useNavigate();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to logout?')) {
      await logout();
      navigate('/login');
    }
  };

  const isDoctor = userData?.userType === 'doctor';
  const isPatient = userData?.userType === 'patient';

  return (
    <>
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-30 bg-indigo-800 flex items-center justify-between px-4 h-16 shadow">
        <div className="flex items-center">
          <img src="/logo.png" alt="Logo" className="h-8" />
          <span className="ml-2 text-lg font-semibold text-white">FelanoCare</span>
        </div>
        <button onClick={() => setIsMobileOpen(!isMobileOpen)} className="text-white">
          {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar container */}
      <div className={`fixed z-40 inset-y-0 left-0 w-64 bg-indigo-700 transform transition-transform duration-300 ease-in-out
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static md:flex-shrink-0`}>
        <div className="flex flex-col w-64 h-full">
          {/* Logo Header */}
          <div className="flex items-center justify-center h-16 px-4 bg-indigo-800">
            <img src="/logo.png" alt="PharmaChain Logo" className="h-10" />
            <span className="ml-2 text-xl font-bold text-white">FelanoCare</span>
          </div>

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto py-4 px-4 space-y-1">
            {isDoctor && (
              <>
                <NavItem to="/doctor-dashboard" icon="home" text="Dashboard" />
                <NavItem to="/appointments" icon="calendar" text="Appointments" />
                <NavItem to="/patients" icon="users" text="Patients" />
                <NavItem to="/prescriptions" icon="document-text" text="Prescriptions" />
                <NavItem to="/profile" icon="user" text="Profile" />
              </>
            )}
            {isPatient && (
              <>
                <NavItem to="/patient-dashboard" icon="home" text="Dashboard" />
                <NavItem to="/booking" icon="calendar" text="Consultation Booking" />
                <NavItem to="/epharmacy" icon="document-text" text="E-pharmacy" />
                <NavItem to="/dietetics" icon="document-text" text="Dietetics" />
                <NavItem to="/psychology" icon="document-text" text="Psychology & Mental Health" />
                <NavItem to="/ai-consult" icon="users" text="AI Consulting" />
                <NavItem to="/profile" icon="user" text="Profile" />
              </>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-indigo-800">
            <div className="flex items-center px-4">
              <div className="h-10 w-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold">
                {userData?.name?.charAt(0)}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-white">{userData?.name}</p>
                <p className="text-xs font-medium text-indigo-200">
                  {isDoctor ? 'Doctor' : isPatient ? 'Patient' : 'User'}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="mt-4 w-full flex items-center px-4 py-2 text-sm text-indigo-200 hover:text-white hover:bg-indigo-600 rounded-md"
            >
              <svg className="h-5 w-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Page content padding for mobile topbar */}
      <div className="md:hidden h-16" />
    </>
  );
}

function NavItem({ to, icon, text }) {
  const iconPaths = {
    home: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
    calendar: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
    users: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
    'document-text': 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
    user: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
  };

  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `group flex items-center px-4 py-2 text-sm font-medium rounded-md ${
          isActive
            ? 'bg-indigo-800 text-white'
            : 'text-indigo-100 hover:bg-indigo-600 hover:text-white'
        }`
      }
    >
      <svg
        className="mr-3 h-5 w-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={iconPaths[icon]} />
      </svg>
      {text}
    </NavLink>
  );
}
