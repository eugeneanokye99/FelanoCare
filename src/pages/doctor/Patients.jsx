import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { collection, query, where, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { User, HeartPulse, ClipboardList, Phone, Mail, Calendar, Activity, Pill, ChevronDown, Search, Frown, Smile, Meh } from 'lucide-react';
import toast from 'react-hot-toast';

const DoctorPatients = () => {
  const { currentUser, userData } = useAuth();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientRecords, setPatientRecords] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [healthStatusFilter, setHealthStatusFilter] = useState('all');

  // Fetch patients assigned to this doctor
  useEffect(() => {
    if (!currentUser) return;
  
    const q = query(
      collection(db, 'users'),
      where('userType', '==', 'patient')
    );
  
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const patientsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPatients(patientsData);
      setLoading(false);
    });
  
    return () => unsubscribe();
  }, [currentUser]);
  

  // Fetch patient records when a patient is selected
  useEffect(() => {
    if (!selectedPatient) return;

    const fetchPatientRecords = async () => {
      try {
        const recordsQuery = query(
          collection(db, 'medicalRecords'),
          where('patientId', '==', selectedPatient.id)
        );
        
        const unsubscribe = onSnapshot(recordsQuery, (snapshot) => {
          const recordsData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            date: doc.data().date?.toDate()
          }));
          setPatientRecords(recordsData.sort((a, b) => b.date - a.date));
        });

        return unsubscribe;
      } catch (error) {
        console.error("Error fetching patient records: ", error);
        toast.error("Failed to load patient records");
      }
    };

    fetchPatientRecords();
  }, [selectedPatient]);

  const filteredPatients = patients
    .filter(patient => 
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.email.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(patient => {
      if (healthStatusFilter === 'all') return true;
      if (healthStatusFilter === 'critical') return patient.healthStatus === 'critical';
      if (healthStatusFilter === 'stable') return patient.healthStatus === 'stable';
      if (healthStatusFilter === 'recovering') return patient.healthStatus === 'recovering';
      return true;
    });

  const getStatusIcon = (status) => {
    switch (status) {
      case 'critical':
        return <Frown className="text-red-500" size={18} />;
      case 'stable':
        return <Smile className="text-green-500" size={18} />;
      case 'recovering':
        return <Meh className="text-yellow-500" size={18} />;
      default:
        return <Meh className="text-gray-500" size={18} />;
    }
  };

  const getLatestVitals = () => {
    if (!selectedPatient || !patientRecords.length) return null;
    const vitalsRecord = patientRecords.find(record => record.type === 'vitals');
    return vitalsRecord ? vitalsRecord.data : null;
  };

  const getCurrentMedications = () => {
    if (!selectedPatient || !patientRecords.length) return [];
    const prescriptions = patientRecords.filter(record => record.type === 'prescription');
    return prescriptions.flatMap(pres => pres.medications);
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
              <User className="mr-2" size={20} />
              Patient Management
            </h1>
          </div>

          {/* Content */}
          <div className="px-6 py-6">
            {/* Filters and Search */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setHealthStatusFilter('all')}
                  className={`px-4 py-2 rounded-md text-sm font-medium flex items-center ${healthStatusFilter === 'all' ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-100 text-gray-700'}`}
                >
                  All Patients
                </button>
                <button
                  onClick={() => setHealthStatusFilter('critical')}
                  className={`px-4 py-2 rounded-md text-sm font-medium flex items-center ${healthStatusFilter === 'critical' ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-100 text-gray-700'}`}
                >
                  <Frown className="mr-2" size={16} />
                  Critical
                </button>
                <button
                  onClick={() => setHealthStatusFilter('stable')}
                  className={`px-4 py-2 rounded-md text-sm font-medium flex items-center ${healthStatusFilter === 'stable' ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-100 text-gray-700'}`}
                >
                  <Smile className="mr-2" size={16} />
                  Stable
                </button>
                <button
                  onClick={() => setHealthStatusFilter('recovering')}
                  className={`px-4 py-2 rounded-md text-sm font-medium flex items-center ${healthStatusFilter === 'recovering' ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-100 text-gray-700'}`}
                >
                  <Meh className="mr-2" size={16} />
                  Recovering
                </button>
              </div>

              <div className="relative w-full md:w-64">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search patients..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Patients List */}
            <div className="flex flex-col md:flex-row gap-6">
              {/* Patients List */}
              <div className="w-full md:w-1/3">
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  {filteredPatients.length === 0 ? (
                    <div className="text-center py-12">
                      <User className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No patients found</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        {searchTerm 
                          ? "No patients match your search."
                          : "You don't have any patients assigned yet."}
                      </p>
                    </div>
                  ) : (
                    <ul className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
                      {filteredPatients.map((patient) => (
                        <li 
                          key={patient.id}
                          className={`px-4 py-4 hover:bg-gray-50 cursor-pointer ${selectedPatient?.id === patient.id ? 'bg-indigo-50' : ''}`}
                          onClick={() => setSelectedPatient(patient)}
                        >
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 mr-3">
                              <User size={18} />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {patient.fullName}
                                </p>
                                {patient.healthStatus && getStatusIcon(patient.healthStatus)}
                              </div>
                              <p className="text-sm text-gray-500 truncate">
                                {patient.gender}, {patient.age} years
                              </p>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              {/* Patient Details */}
              {selectedPatient ? (
                <div className="w-full md:w-2/3">
                  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    {/* Patient Header */}
                    <div className="bg-gray-50 px-4 py-4 border-b border-gray-200">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 mr-3">
                          <User size={20} />
                        </div>
                        <div>
                          <h2 className="text-lg font-medium text-gray-900">{selectedPatient.fullName}</h2>
                          <div className="flex items-center mt-1">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              selectedPatient.healthStatus === 'critical' ? 'bg-red-100 text-red-800' :
                              selectedPatient.healthStatus === 'stable' ? 'bg-green-100 text-green-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {selectedPatient.healthStatus || 'No status'}
                            </span>
                            <span className="ml-2 text-sm text-gray-500">
                              {selectedPatient.gender}, {selectedPatient.age} years
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Tabs */}
                    <div className="border-b border-gray-200">
                      <nav className="-mb-px flex">
                        <button
                          onClick={() => setActiveTab('overview')}
                          className={`whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm ${activeTab === 'overview' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                        >
                          Overview
                        </button>
                        <button
                          onClick={() => setActiveTab('records')}
                          className={`whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm ${activeTab === 'records' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                        >
                          Medical Records
                        </button>
                        <button
                          onClick={() => setActiveTab('contact')}
                          className={`whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm ${activeTab === 'contact' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                        >
                          Contact
                        </button>
                      </nav>
                    </div>

                    {/* Tab Content */}
                    <div className="p-4">
                      {activeTab === 'overview' && (
                        <div className="space-y-6">
                          {/* Health Summary */}
                          <div>
                            <h3 className="text-lg font-medium text-gray-900 flex items-center">
                              <HeartPulse className="mr-2" size={18} />
                              Health Summary
                            </h3>
                            {getLatestVitals() ? (
                              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-white p-4 rounded-lg border border-gray-200">
                                  <p className="text-sm text-gray-500">Blood Pressure</p>
                                  <p className="text-xl font-semibold">
                                    {getLatestVitals().bloodPressure || '--/--'}
                                  </p>
                                </div>
                                <div className="bg-white p-4 rounded-lg border border-gray-200">
                                  <p className="text-sm text-gray-500">Heart Rate</p>
                                  <p className="text-xl font-semibold">
                                    {getLatestVitals().heartRate ? `${getLatestVitals().heartRate} bpm` : '--'}
                                  </p>
                                </div>
                                <div className="bg-white p-4 rounded-lg border border-gray-200">
                                  <p className="text-sm text-gray-500">Temperature</p>
                                  <p className="text-xl font-semibold">
                                    {getLatestVitals().temperature ? `${getLatestVitals().temperature} °F` : '--'}
                                  </p>
                                </div>
                              </div>
                            ) : (
                              <p className="mt-2 text-sm text-gray-500">No vitals recorded yet</p>
                            )}
                          </div>

                          {/* Current Medications */}
                          <div>
                            <h3 className="text-lg font-medium text-gray-900 flex items-center">
                              <Pill className="mr-2" size={18} />
                              Current Medications
                            </h3>
                            {getCurrentMedications().length > 0 ? (
                              <div className="mt-4 space-y-2">
                                {getCurrentMedications().map((med, index) => (
                                  <div key={index} className="bg-white p-3 rounded-lg border border-gray-200">
                                    <div className="flex items-center justify-between">
                                      <div>
                                        <p className="font-medium">{med.name}</p>
                                        <p className="text-sm text-gray-500">
                                          {med.dosage}, {med.frequency}
                                        </p>
                                      </div>
                                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                        Active
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="mt-2 text-sm text-gray-500">No current medications</p>
                            )}
                          </div>

                          {/* Recent Appointments */}
                          <div>
                            <h3 className="text-lg font-medium text-gray-900 flex items-center">
                              <Calendar className="mr-2" size={18} />
                              Recent Appointments
                            </h3>
                            {patientRecords.filter(r => r.type === 'appointment').length > 0 ? (
                              <div className="mt-4 space-y-2">
                                {patientRecords
                                  .filter(r => r.type === 'appointment')
                                  .slice(0, 3)
                                  .map((appointment, index) => (
                                    <div key={index} className="bg-white p-3 rounded-lg border border-gray-200">
                                      <div className="flex items-center justify-between">
                                        <div>
                                          <p className="font-medium">{appointment.reason}</p>
                                          <p className="text-sm text-gray-500">
                                            {appointment.date?.toLocaleDateString() || 'Unknown date'}
                                          </p>
                                        </div>
                                        <span className={`text-xs px-2 py-1 rounded-full ${
                                          appointment.status === 'completed' ? 'bg-green-100 text-green-800' :
                                          appointment.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                          'bg-yellow-100 text-yellow-800'
                                        }`}>
                                          {appointment.status}
                                        </span>
                                      </div>
                                    </div>
                                  ))}
                              </div>
                            ) : (
                              <p className="mt-2 text-sm text-gray-500">No recent appointments</p>
                            )}
                          </div>
                        </div>
                      )}

                      {activeTab === 'records' && (
                        <div>
                          <h3 className="text-lg font-medium text-gray-900 flex items-center">
                            <ClipboardList className="mr-2" size={18} />
                            Medical Records
                          </h3>
                          {patientRecords.length > 0 ? (
                            <div className="mt-4 space-y-4">
                              {patientRecords.map((record) => (
                                <div key={record.id} className="bg-white p-4 rounded-lg border border-gray-200">
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <p className="font-medium capitalize">{record.type}</p>
                                      <p className="text-sm text-gray-500">
                                        {record.date?.toLocaleDateString() || 'Unknown date'}
                                      </p>
                                    </div>
                                    <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full">
                                      {record.category || 'General'}
                                    </span>
                                  </div>
                                  {record.notes && (
                                    <div className="mt-2">
                                      <p className="text-sm text-gray-700">{record.notes}</p>
                                    </div>
                                  )}
                                  {record.type === 'vitals' && (
                                    <div className="mt-3 grid grid-cols-3 gap-2 text-sm">
                                      <div>
                                        <span className="text-gray-500">BP: </span>
                                        <span>{record.data.bloodPressure || '--/--'}</span>
                                      </div>
                                      <div>
                                        <span className="text-gray-500">HR: </span>
                                        <span>{record.data.heartRate || '--'} bpm</span>
                                      </div>
                                      <div>
                                        <span className="text-gray-500">Temp: </span>
                                        <span>{record.data.temperature || '--'} °F</span>
                                      </div>
                                    </div>
                                  )}
                                  {record.type === 'prescription' && (
                                    <div className="mt-3 space-y-2">
                                      {record.medications.map((med, idx) => (
                                        <div key={idx} className="flex items-center text-sm">
                                          <Pill className="mr-2 text-gray-400" size={14} />
                                          <span className="font-medium">{med.name}</span>
                                          <span className="mx-2 text-gray-300">|</span>
                                          <span className="text-gray-500">{med.dosage}, {med.frequency}</span>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="mt-2 text-sm text-gray-500">No medical records found</p>
                          )}
                        </div>
                      )}

                      {activeTab === 'contact' && (
                        <div>
                          <h3 className="text-lg font-medium text-gray-900 flex items-center">
                            <Mail className="mr-2" size={18} />
                            Contact Information
                          </h3>
                          <div className="mt-6 space-y-4">
                            <div className="flex items-start">
                              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 mr-3">
                                <Mail size={16} />
                              </div>
                              <div>
                                <h4 className="text-sm font-medium text-gray-500">Email</h4>
                                <p className="text-sm text-gray-900 mt-1">{selectedPatient.email}</p>
                                <button className="mt-2 text-sm text-indigo-600 hover:text-indigo-800">
                                  Send Message
                                </button>
                              </div>
                            </div>

                            <div className="flex items-start">
                              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 mr-3">
                                <Phone size={16} />
                              </div>
                              <div>
                                <h4 className="text-sm font-medium text-gray-500">Phone</h4>
                                <p className="text-sm text-gray-900 mt-1">{selectedPatient.phone || 'Not provided'}</p>
                                {selectedPatient.phone && (
                                  <button className="mt-2 text-sm text-indigo-600 hover:text-indigo-800">
                                    Call Patient
                                  </button>
                                )}
                              </div>
                            </div>

                            <div className="flex items-start">
                              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 mr-3">
                                <User size={16} />
                              </div>
                              <div>
                                <h4 className="text-sm font-medium text-gray-500">Emergency Contact</h4>
                                <p className="text-sm text-gray-900 mt-1">
                                  {selectedPatient.emergencyContact?.name || 'Not provided'}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {selectedPatient.emergencyContact?.relationship || ''}
                                  {selectedPatient.emergencyContact?.phone ? ` • ${selectedPatient.emergencyContact.phone}` : ''}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="w-full md:w-2/3 flex items-center justify-center bg-white border border-gray-200 rounded-lg p-12">
                  <div className="text-center">
                    <User className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No patient selected</h3>
                    <p className="mt-1 text-sm text-gray-500">Select a patient from the list to view details</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorPatients;