import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, updateDoc, doc } from 'firebase/firestore';
import { db, auth } from '../../firebase';
import { useAuth } from '../../contexts/AuthContext'
import { Calendar, Clock, User, Stethoscope, ChevronDown, CheckCircle, XCircle, ClipboardList, AlertCircle, Search } from 'lucide-react';
import toast from 'react-hot-toast';

const DoctorAppointments = () => {
  const { currentUser: user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('today');
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'appointments'),
      where('doctorId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const appointmentsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date.toDate()
      }));
      setAppointments(appointmentsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const filteredAppointments = appointments
    .filter(app => {
      const now = new Date();
      if (filter === 'upcoming') return app.date > now || isSameDay(app.date, now);
      if (filter === 'past') return app.date < now && !isSameDay(app.date, now);
      if (filter === 'today') return isSameDay(app.date, now);
      return true;
    })
    .filter(app => 
      app.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.reason.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const handleStatusUpdate = async (appointmentId, status) => {
    try {
      await updateDoc(doc(db, 'appointments', appointmentId), {
        status: status,
        updatedAt: new Date()
      });
      toast.success(`Appointment marked as ${status}`);
    } catch (error) {
      console.error("Error updating appointment status: ", error);
      toast.error("Failed to update appointment");
    }
  };

  const isSameDay = (date1, date2) => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {/* Header */}
          <div className="bg-indigo-600 px-6 py-4">
            <h1 className="text-xl font-semibold text-white flex items-center">
              <Calendar className="mr-2" size={20} />
              Your Appointments
            </h1>
          </div>

          {/* Content */}
          <div className="px-6 py-6">
            {/* Filters and Search */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setFilter('today')}
                  className={`px-4 py-2 rounded-md text-sm font-medium flex items-center ${filter === 'today' ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-100 text-gray-700'}`}
                >
                  <Clock className="mr-2" size={16} />
                  Today
                </button>
                <button
                  onClick={() => setFilter('upcoming')}
                  className={`px-4 py-2 rounded-md text-sm font-medium flex items-center ${filter === 'upcoming' ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-100 text-gray-700'}`}
                >
                  <Calendar className="mr-2" size={16} />
                  Upcoming
                </button>
                <button
                  onClick={() => setFilter('past')}
                  className={`px-4 py-2 rounded-md text-sm font-medium flex items-center ${filter === 'past' ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-100 text-gray-700'}`}
                >
                  <ClipboardList className="mr-2" size={16} />
                  Past
                </button>
              </div>

              <div className="relative w-full md:w-64">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search appointments..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Appointments List */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              {filteredAppointments.length === 0 ? (
                <div className="text-center py-12">
                  <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No appointments found</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {filter === 'today' 
                      ? "You don't have any appointments scheduled for today."
                      : `No ${filter} appointments match your search.`}
                  </p>
                </div>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {filteredAppointments.map((appointment) => (
                    <li 
                      key={appointment.id}
                      className={`px-4 py-4 hover:bg-gray-50 cursor-pointer ${selectedAppointment?.id === appointment.id ? 'bg-indigo-50' : ''}`}
                      onClick={() => setSelectedAppointment(appointment)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center min-w-0">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 mr-3">
                            <User size={18} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium text-indigo-600 truncate">
                                {appointment.patientName}
                              </p>
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                appointment.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                                appointment.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                                appointment.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                'bg-yellow-100 text-yellow-800'
                              }`}>
                                {appointment.status}
                              </span>
                            </div>
                            <p className="text-sm text-gray-500 truncate">
                              <Stethoscope className="inline mr-1" size={14} />
                              {appointment.reason}
                            </p>
                          </div>
                        </div>
                        <div className="ml-4 flex-shrink-0 flex flex-col items-end">
                          <p className="text-sm font-medium text-gray-900">
                            {formatTime(appointment.date)}
                          </p>
                          <p className="text-xs text-gray-500">
                            {appointment.date.toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Appointment Details Sidebar */}
          {selectedAppointment && (
            <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Appointment Details</h2>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 mr-3">
                    <User size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">{selectedAppointment.patientName}</h3>
                    <p className="text-sm text-gray-500">Patient</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 mr-3">
                    <Stethoscope size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">{selectedAppointment.reason}</h3>
                    <p className="text-sm text-gray-500">Reason for visit</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 mr-3">
                    <Clock size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">
                      {selectedAppointment.date.toLocaleDateString()} at {formatTime(selectedAppointment.date)}
                    </h3>
                    <p className="text-sm text-gray-500">Appointment time</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <div className="flex justify-between space-x-3">
                    {selectedAppointment.status === 'confirmed' && (
                      <>
                        <button
                          onClick={() => handleStatusUpdate(selectedAppointment.id, 'completed')}
                          className="flex-1 bg-indigo-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex items-center justify-center"
                        >
                          <CheckCircle className="mr-2" size={16} />
                          Mark Complete
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(selectedAppointment.id, 'cancelled')}
                          className="flex-1 bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex items-center justify-center"
                        >
                          <XCircle className="mr-2" size={16} />
                          Cancel
                        </button>
                      </>
                    )}
                    {selectedAppointment.status === 'completed' && (
                      <div className="w-full text-center py-2 text-sm text-green-600 font-medium">
                        This appointment has been completed
                      </div>
                    )}
                    {selectedAppointment.status === 'cancelled' && (
                      <div className="w-full text-center py-2 text-sm text-red-600 font-medium">
                        This appointment was cancelled
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorAppointments;