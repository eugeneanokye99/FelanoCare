import { useAuth } from '../../contexts/AuthContext';
import { useEffect, useState } from 'react';
import { db } from '../../firebase';
import {
  collection,
  query,
  where,
  onSnapshot
} from 'firebase/firestore';
import {
  CalendarDays,
  Pill,
  Bot,
  Activity,
  Bell,
  Stethoscope,
  Droplet,
  Brain,
  CalendarCheck
} from 'lucide-react';

export default function PatientDashboard() {
  const { currentUser, userData } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [healthPlans, setHealthPlans] = useState([]);

  useEffect(() => {
    if (!currentUser) return;

    const appointmentsQuery = query(
      collection(db, 'appointments'),
      where('patientId', '==', currentUser.uid)
    );
    const unsubscribeAppointments = onSnapshot(appointmentsQuery, (snapshot) => {
      setAppointments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const prescriptionsQuery = query(
      collection(db, 'prescriptions'),
      where('patientId', '==', currentUser.uid),
      where('status', '==', 'active')
    );
    const unsubscribePrescriptions = onSnapshot(prescriptionsQuery, (snapshot) => {
      setPrescriptions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const healthPlansQuery = query(
      collection(db, 'healthPlans'),
      where('patientId', '==', currentUser.uid)
    );
    const unsubscribePlans = onSnapshot(healthPlansQuery, (snapshot) => {
      setHealthPlans(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      unsubscribeAppointments();
      unsubscribePrescriptions();
      unsubscribePlans();
    };
  }, [currentUser]);

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          Welcome, {userData?.name}
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div className="bg-white rounded-2xl shadow p-5 flex items-center space-x-4">
            <div className="bg-indigo-100 p-3 rounded-full">
              <CalendarDays className="text-indigo-600 w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Appointments</p>
              <p className="text-xl font-semibold text-gray-800">{appointments.length}</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow p-5 flex items-center space-x-4">
            <div className="bg-green-100 p-3 rounded-full">
              <Pill className="text-green-600 w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Medications</p>
              <p className="text-xl font-semibold text-gray-800">{prescriptions.length} Active</p>
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
              <p className="text-xl font-semibold text-gray-800">{healthPlans.length} Active</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-indigo-600" />
                Upcoming Appointments
              </h2>
              <a href="/booking" className="text-sm text-indigo-600 hover:underline">View all</a>
            </div>
            <ul className="space-y-4">
              {appointments.slice(0, 2).map((appt) => (
                <li key={appt.id} className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-gray-700">{appt.doctorName}</p>
                    <p className="text-sm text-gray-500">{new Date(appt.date).toLocaleDateString()} · {appt.time}</p>
                  </div>
                  <span className="text-sm bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full">
                    {appt.status}
                  </span>
                </li>
              ))}
            </ul>
          </div>

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
