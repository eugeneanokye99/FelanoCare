import { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot, Timestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../contexts/AuthContext';
import dayjs from 'dayjs';
import StatCard from '../../components/StatCard'

export default function DoctorDashboard() {
  const { user } = useAuth();
  const [appointmentsToday, setAppointmentsToday] = useState([]);
  const [pendingPrescriptions, setPendingPrescriptions] = useState([]);
  const [messages, setMessages] = useState([]);
  const [recentAppointments, setRecentAppointments] = useState([]);

  useEffect(() => {
    if (!user?.uid) return;

    // Fetch today's appointments
    const todayStart = Timestamp.fromDate(dayjs().startOf('day').toDate());
    const todayEnd = Timestamp.fromDate(dayjs().endOf('day').toDate());

    const appointmentsQuery = query(
      collection(db, 'appointments'),
      where('doctorId', '==', user.uid),
      where('time', '>=', todayStart),
      where('time', '<=', todayEnd)
    );

    const unsubscribeAppointments = onSnapshot(appointmentsQuery, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAppointmentsToday(data);
      setRecentAppointments(data.slice(0, 5)); // last 5 for example
    });

    // Pending prescriptions
    const prescriptionsQuery = query(
      collection(db, 'prescriptions'),
      where('doctorId', '==', user.uid),
      where('status', '==', 'pending')
    );

    const unsubscribePrescriptions = onSnapshot(prescriptionsQuery, (snapshot) => {
      setPendingPrescriptions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    // New messages
    const messagesQuery = query(
      collection(db, 'messages'),
      where('recipientId', '==', user.uid),
      where('status', '==', 'unread')
    );

    const unsubscribeMessages = onSnapshot(messagesQuery, (snapshot) => {
      setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      unsubscribeAppointments();
      unsubscribePrescriptions();
      unsubscribeMessages();
    };
  }, [user?.uid]);

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome, Dr. {user?.name}
        </h1>
        <p className="text-gray-600">Here's what's happening today</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="Today's Appointments"
          value={appointmentsToday.length}
          icon="calendar"
          color="bg-blue-100 text-blue-600"
        />
        <StatCard
          title="Pending Prescriptions"
          value={pendingPrescriptions.length}
          icon="document-text"
          color="bg-yellow-100 text-yellow-600"
        />
        <StatCard
          title="New Messages"
          value={messages.length}
          icon="mail"
          color="bg-green-100 text-green-600"
        />
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Appointments</h2>
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {recentAppointments.map(app => (
              <AppointmentItem
                key={app.id}
                patient={app.patientName}
                time={dayjs(app.time.toDate()).format('hh:mm A')}
                reason={app.reason}
                status={app.status}
              />
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
