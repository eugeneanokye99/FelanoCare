import { useState, useEffect } from 'react';
import {
  collection,
  query,
  where,
  onSnapshot,
  updateDoc,
  doc
} from 'firebase/firestore';
import { db } from '../../firebase';
import { format, isToday, isAfter, isBefore } from 'date-fns';
import { useAuth } from '../../contexts/AuthContext';
import { CalendarClock, CalendarDays, CalendarX } from 'lucide-react';

const AppointmentsPage = () => {
  const { currentUser: user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('upcoming');
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [aiNotes, setAiNotes] = useState('');

  useEffect(() => {
    if (!user?.uid) return;

    const q = query(collection(db, 'appointments'), where('doctorId', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const appointmentsData = snapshot.docs.map(doc => {
        const data = doc.data();
        const timestamp = data.date;
        return {
          id: doc.id,
          ...data,
          date: timestamp?.toDate?.() || new Date() // fallback for invalid/missing date
        };
      });

      setAppointments(appointmentsData);
      console.log(user.uid)
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const now = new Date();
  const filteredAppointments = appointments.filter(app => {
    if (!app.date) return false;
    if (filter === 'upcoming') return isAfter(app.date, now) || isToday(app.date);
    if (filter === 'past') return isBefore(app.date, now) && !isToday(app.date);
    if (filter === 'today') return isToday(app.date);
    return true;
  });

  const handleStatusUpdate = async (appointmentId, status) => {
    try {
      await updateDoc(doc(db, 'appointments', appointmentId), {
        status,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error updating appointment status:', error);
    }
  };

  const generateAiNotes = (appointment) => {
    const reason = appointment.reason?.toLowerCase() || 'checkup';
    const mockAiResponse = `
**AI Assistant Notes for ${appointment.patientName || 'Patient'}**

- Patient history shows recurring ${reason} issues
- Last visit was ${Math.floor(Math.random() * 6)} months ago
- Suggested tests: Complete blood count, ${reason.includes('pain') ? 'X-ray' : 'Urinalysis'}
- Possible diagnoses: ${getRandomDiagnosis(reason)}
`;
    setAiNotes(mockAiResponse);
    setSelectedAppointment(appointment);
  };

  const getRandomDiagnosis = (reason) => {
    const options = {
      pain: ['Muscle strain', 'Inflammation', 'Nerve compression'],
      fever: ['Viral infection', 'Bacterial infection', 'Urinary tract infection'],
      checkup: ['All clear', 'Minor vitamin deficiency', 'Slight elevation in blood pressure']
    };
    return (options[reason] || ['Needs follow-up', 'Unclear symptoms', 'Monitor progress']).join(', ');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Your Appointments</h1>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Appointments List */}
        <div className="w-full md:w-1/2 lg:w-2/3">
          <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <div className="flex flex-wrap gap-2 mb-4">
              {[
                { label: 'Upcoming', value: 'upcoming', icon: <CalendarClock size={16} /> },
                { label: 'Today', value: 'today', icon: <CalendarDays size={16} /> },
                { label: 'Past', value: 'past', icon: <CalendarX size={16} /> }
              ].map(({ label, value, icon }) => (
                <button
                  key={value}
                  onClick={() => setFilter(value)}
                  className={`flex items-center gap-1 px-4 py-2 rounded-full text-sm font-medium ${
                    filter === value ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  {icon} {label}
                </button>
              ))}
            </div>

            {filteredAppointments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No {filter} appointments found
              </div>
            ) : (
              <div className="space-y-4">
                {filteredAppointments.map(appointment => (
                  <div
                    key={appointment.id}
                    className={`border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer ${
                      selectedAppointment?.id === appointment.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                    }`}
                    onClick={() => {
                      setSelectedAppointment(appointment);
                      setAiNotes('');
                    }}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-lg">{appointment.patientName || 'Unknown Patient'}</h3>
                        <p className="text-gray-600">{format(appointment.date, 'PPPp')}</p>
                        <p className="text-gray-800 mt-1">Reason: {appointment.reason || 'Not specified'}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        appointment.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                        appointment.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {appointment.status || 'pending'}
                      </span>
                    </div>
                    <div className="mt-3 flex gap-2 flex-wrap">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          generateAiNotes(appointment);
                        }}
                        className="text-xs bg-purple-100 text-purple-800 px-3 py-1 rounded-full hover:bg-purple-200"
                      >
                        AI Assist
                      </button>
                      {appointment.status === 'confirmed' && (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStatusUpdate(appointment.id, 'completed');
                            }}
                            className="text-xs bg-blue-100 text-blue-800 px-3 py-1 rounded-full hover:bg-blue-200"
                          >
                            Mark Complete
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStatusUpdate(appointment.id, 'cancelled');
                            }}
                            className="text-xs bg-red-100 text-red-800 px-3 py-1 rounded-full hover:bg-red-200"
                          >
                            Cancel
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Appointment Details and AI Panel */}
        <div className="w-full md:w-1/2 lg:w-1/3">
          {selectedAppointment ? (
            <div className="bg-white rounded-lg shadow-md p-4 sticky top-4">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Appointment Details</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-700">Patient</h3>
                  <p>{selectedAppointment.patientName || 'Unknown'}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-700">Date & Time</h3>
                  <p>{format(selectedAppointment.date, 'PPPp')}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-700">Reason</h3>
                  <p>{selectedAppointment.reason || 'Not specified'}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-700">Status</h3>
                  <p className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                    selectedAppointment.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                    selectedAppointment.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {selectedAppointment.status || 'pending'}
                  </p>
                </div>

                {aiNotes && (
                  <div className="mt-6">
                    <h3 className="font-semibold text-gray-700 mb-2">AI Assistant Notes</h3>
                    <div className="bg-gray-50 p-3 rounded-md text-sm whitespace-pre-wrap">
                      {aiNotes}
                    </div>
                    <div className="mt-2 text-xs text-gray-500">
                      <p>AI-generated suggestions based on patient history and symptoms</p>
                    </div>
                  </div>
                )}

                <div className="mt-6">
                  <button
                    onClick={() => generateAiNotes(selectedAppointment)}
                    className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 transition-colors"
                  >
                    Generate AI Notes
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <div className="text-gray-400 mb-4">
                <CalendarClock size={48} className="mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-700 mb-1">No appointment selected</h3>
              <p className="text-gray-500">Select an appointment from the list to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AppointmentsPage;
