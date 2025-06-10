import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../firebase';
import { Calendar, Clock, User, Stethoscope, ChevronDown, CheckCircle } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import toast from 'react-hot-toast';

export default function AppointmentBooking() {
  const { currentUser, userData } = useAuth();
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState('');
  const [reason, setReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableTimes, setAvailableTimes] = useState([]);
  const [isDoctorDropdownOpen, setIsDoctorDropdownOpen] = useState(false);

  // Fetch all doctors from Firestore
  useEffect(() => {
    const fetchDoctors = async () => {
      setIsLoading(true);
      try {
        const q = query(collection(db, 'users'), where('userType', '==', 'doctor'));
        const querySnapshot = await getDocs(q);
        const doctorsList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setDoctors(doctorsList);
      } catch (error) {
        console.error('Error fetching doctors:', error);
        toast.error('Failed to load doctors list');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  // Generate available times (every 30 minutes from 9AM to 5PM)
  useEffect(() => {
    if (selectedDoctor) {
      const times = [];
      for (let hour = 9; hour <= 17; hour++) {
        times.push(`${hour}:00`);
        if (hour < 17) {
          times.push(`${hour}:30`);
        }
      }
      setAvailableTimes(times);
    }
  }, [selectedDoctor]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDoctor || !date || !time || !reason) {
      toast.error('Please fill all fields');
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading('Booking your appointment...');

    try {
      await addDoc(collection(db, 'appointments'), {
        patientId: currentUser.uid,
        patientName: userData?.name || 'Unknown',
        doctorId: selectedDoctor.id,
        doctorName: selectedDoctor.name,
        date: date.toISOString(),
        time,
        reason,
        status: 'pending',
        createdAt: new Date().toISOString()
      });

      toast.success('Appointment booked successfully!', { id: toastId });
      // Reset form
      setSelectedDoctor(null);
      setDate(new Date());
      setTime('');
      setReason('');
    } catch (error) {
      console.error('Error booking appointment:', error);
      toast.error('Failed to book appointment', { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter out weekends
  const isWeekday = (date) => {
    const day = date.getDay();
    return day !== 0 && day !== 6;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {/* Header */}
          <div className="bg-indigo-600 px-6 py-4">
            <h1 className="text-xl font-semibold text-white flex items-center">
              <Stethoscope className="mr-2" size={20} />
              Book a Medical Appointment
            </h1>
          </div>

          {/* Form */}
          <div className="px-6 py-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Doctor Selection */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Doctor
                </label>
                <button
                  type="button"
                  onClick={() => setIsDoctorDropdownOpen(!isDoctorDropdownOpen)}
                  className="w-full flex justify-between items-center px-4 py-3 bg-white border border-gray-300 rounded-md shadow-sm text-left focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  {selectedDoctor ? (
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 mr-3">
                        <User size={18} />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{selectedDoctor.name}</p>
                        <p className="text-xs text-gray-500">{selectedDoctor.specialization || 'General Practitioner'}</p>
                      </div>
                    </div>
                  ) : (
                    <span className="text-gray-500">Select a doctor</span>
                  )}
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                </button>

                {isDoctorDropdownOpen && (
                  <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 focus:outline-none max-h-60 overflow-auto">
                    {doctors.length > 0 ? (
                      doctors.map((doctor) => (
                        <div
                          key={doctor.id}
                          onClick={() => {
                            setSelectedDoctor(doctor);
                            setIsDoctorDropdownOpen(false);
                          }}
                          className="flex items-center px-4 py-3 hover:bg-gray-100 cursor-pointer"
                        >
                          <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 mr-3">
                            <User size={18} />
                          </div>
                          <div>
                            <p className="text-sm font-medium">{doctor.name}</p>
                            <p className="text-xs text-gray-500">
                              {doctor.specialization || 'General Practitioner'}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="px-4 py-3 text-sm text-gray-500">
                        {isLoading ? 'Loading doctors...' : 'No doctors available'}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Date Picker */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Appointment Date
                </label>
                <div className="relative">
                  <DatePicker
                    selected={date}
                    onChange={(date) => setDate(date)}
                    minDate={new Date()}
                    filterDate={isWeekday}
                    className="w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholderText="Select a date"
                  />
                  <Calendar className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
                </div>
              </div>

              {/* Time Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Appointment Time
                </label>
                <div className="relative">
                  <select
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none"
                    required
                    disabled={!selectedDoctor}
                  >
                    <option value="">Select a time</option>
                    {availableTimes.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                  <Clock className="absolute right-3 top-3 h-5 w-5 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Reason for Visit */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reason for Visit
                </label>
                <textarea
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Briefly describe the reason for your visit"
                  required
                />
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-70"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Booking...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="mr-2" size={18} />
                      Confirm Appointment
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Additional Info */}
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-900 mb-2">Important Notes</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Appointments must be booked at least 24 hours in advance</li>
              <li>• Standard consultation duration is 30 minutes</li>
              <li>• You will receive a confirmation email with appointment details</li>
              <li>• Cancellations require 12 hours notice</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}