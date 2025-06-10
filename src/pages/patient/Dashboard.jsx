import { useAuth } from '../../contexts/AuthContext';
import {
  CalendarDays,
  Pill,
  Bot,
  Activity,
  Bell,
  Stethoscope,
  Droplet,
  Brain,
  CalendarCheck,
} from 'lucide-react';

export default function PatientDashboard() {
  const { userData } = useAuth();

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          Welcome, {userData?.name}
        </h1>

        {/* Analytics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div className="bg-white rounded-2xl shadow p-5 flex items-center space-x-4">
            <div className="bg-indigo-100 p-3 rounded-full">
              <CalendarDays className="text-indigo-600 w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Appointments</p>
              <p className="text-xl font-semibold text-gray-800">3</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow p-5 flex items-center space-x-4">
            <div className="bg-green-100 p-3 rounded-full">
              <Pill className="text-green-600 w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Medications</p>
              <p className="text-xl font-semibold text-gray-800">5 Active</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow p-5 flex items-center space-x-4">
            <div className="bg-yellow-100 p-3 rounded-full">
              <Bot className="text-yellow-600 w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500">AI Consults</p>
              <p className="text-xl font-semibold text-gray-800">1 Pending</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow p-5 flex items-center space-x-4">
            <div className="bg-pink-100 p-3 rounded-full">
              <Activity className="text-pink-600 w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Health Plans</p>
              <p className="text-xl font-semibold text-gray-800">2 Active</p>
            </div>
          </div>
        </div>

        {/* Two Column Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upcoming Appointments */}
          <div className="bg-white rounded-2xl shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-indigo-600" />
                Upcoming Appointments
              </h2>
              <a href="/booking" className="text-sm text-indigo-600 hover:underline">View all</a>
            </div>
            <ul className="space-y-4">
              <li className="flex justify-between items-center">
                <div>
                  <p className="font-medium text-gray-700">Dr. Sarah Johnson</p>
                  <p className="text-sm text-gray-500">June 12, 2025 · 10:00 AM</p>
                </div>
                <span className="text-sm bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full">Confirmed</span>
              </li>
              <li className="flex justify-between items-center">
                <div>
                  <p className="font-medium text-gray-700">Dr. Kelvin Ayew</p>
                  <p className="text-sm text-gray-500">June 15, 2025 · 1:30 PM</p>
                </div>
                <span className="text-sm bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full">Pending</span>
              </li>
            </ul>
          </div>

          {/* AI Tips or Announcements */}
          <div className="bg-white rounded-2xl shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <Bell className="w-5 h-5 text-pink-600" />
                Tips & Announcements
              </h2>
            </div>
            <ul className="space-y-4">
              <li className="flex items-center gap-2 text-gray-700 font-medium">
                <Droplet className="w-4 h-4 text-blue-500" />
                Stay hydrated! Drinking water helps your medication work better.
              </li>
              <li className="flex items-center gap-2 text-gray-700 font-medium">
                <Brain className="w-4 h-4 text-purple-500" />
                Try our AI Consultation to get quick advice on your symptoms.
              </li>
              <li className="flex items-center gap-2 text-gray-700 font-medium">
                <CalendarCheck className="w-4 h-4 text-green-600" />
                Book your follow-up after every prescription for accurate tracking.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
