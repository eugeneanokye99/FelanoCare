import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { collection, query, where, onSnapshot, addDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { ClipboardList, Pill, User, Search, PlusCircle, CheckCircle, XCircle, ChevronDown, AlertCircle, ShoppingCart } from 'lucide-react';
import toast from 'react-hot-toast';

const DoctorPrescriptions = () => {
  const { currentUser, userData } = useAuth();
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('active');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [medicines, setMedicines] = useState([]);
  const [newPrescription, setNewPrescription] = useState({
    patientId: '',
    patientName: '',
    medicines: [],
    instructions: '',
    status: 'active'
  });
  const [showNewForm, setShowNewForm] = useState(false);
  const [medicineSearch, setMedicineSearch] = useState('');
  const [availableMedicines, setAvailableMedicines] = useState([]);
  const [showMedicineDropdown, setShowMedicineDropdown] = useState(false);

  // Fetch prescriptions
  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, 'prescriptions'),
      where('doctorId', '==', currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const prescriptionsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate()
      }));
      setPrescriptions(prescriptionsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  // Fetch medicines inventory
  useEffect(() => {
    const q = query(collection(db, 'medicines'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const medicinesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setAvailableMedicines(medicinesData);
    });

    return () => unsubscribe();
  }, []);

  const filteredPrescriptions = prescriptions
    .filter(pres => {
      if (filter === 'active') return pres.status === 'active';
      if (filter === 'fulfilled') return pres.status === 'fulfilled';
      if (filter === 'expired') return pres.status === 'expired';
      return true;
    })
    .filter(pres => 
      pres.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pres.medicines.some(med => med.name.toLowerCase().includes(searchTerm.toLowerCase()))
    );

  const handleAddMedicine = (medicine) => {
    setNewPrescription(prev => ({
      ...prev,
      medicines: [...prev.medicines, {
        id: medicine.id,
        name: medicine.name,
        dosage: '1 tablet',
        frequency: 'once daily',
        duration: '7 days',
        price: medicine.price || 0 // Include price if available
      }]
    }));
    setMedicineSearch('');
    setShowMedicineDropdown(false);
  };

  const handleRemoveMedicine = (index) => {
    setNewPrescription(prev => ({
      ...prev,
      medicines: prev.medicines.filter((_, i) => i !== index)
    }));
  };

  const handleSubmitPrescription = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!newPrescription.patientName.trim()) {
      toast.error('Please enter a patient name');
      return;
    }
    
    if (newPrescription.medicines.length === 0) {
      toast.error('Please add at least one medicine');
      return;
    }

    try {
      // Create prescription object
      const prescriptionData = {
        ...newPrescription,
        patientId: newPrescription.patientId || `temp-${Date.now()}`, // Generate temp ID if not provided
        doctorId: currentUser.uid,
        doctorName: userData?.name || 'Dr. Unknown',
        createdAt: new Date(),
        status: 'active'
      };

      // Add to Firestore
      const docRef = await addDoc(collection(db, 'prescriptions'), prescriptionData);
      
      toast.success('Prescription created successfully!');
      
      // Reset form
      setNewPrescription({
        patientId: '',
        patientName: '',
        medicines: [],
        instructions: '',
        status: 'active'
      });
      setShowNewForm(false);
      
      // Log success
      console.log('Prescription created with ID: ', docRef.id);
    } catch (error) {
      console.error('Error creating prescription:', error);
      toast.error('Failed to create prescription: ' + error.message);
    }
  };

  const handleUpdateStatus = async (prescriptionId, status) => {
    try {
      await updateDoc(doc(db, 'prescriptions', prescriptionId), {
        status: status,
        updatedAt: new Date()
      });
      toast.success(`Prescription marked as ${status}`);
    } catch (error) {
      console.error("Error updating prescription status: ", error);
      toast.error("Failed to update prescription");
    }
  };

  const filteredMedicines = availableMedicines.filter(med =>
    med.name.toLowerCase().includes(medicineSearch.toLowerCase()) &&
    !newPrescription.medicines.some(m => m.id === med.id)
  );

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
              <ClipboardList className="mr-2" size={20} />
              Prescription Management
            </h1>
          </div>

          {/* Content */}
          <div className="px-6 py-6">
            {/* Filters and Actions */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setFilter('active')}
                  className={`px-4 py-2 rounded-md text-sm font-medium flex items-center ${filter === 'active' ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-100 text-gray-700'}`}
                >
                  <Pill className="mr-2" size={16} />
                  Active
                </button>
                <button
                  onClick={() => setFilter('fulfilled')}
                  className={`px-4 py-2 rounded-md text-sm font-medium flex items-center ${filter === 'fulfilled' ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-100 text-gray-700'}`}
                >
                  <CheckCircle className="mr-2" size={16} />
                  Fulfilled
                </button>
                <button
                  onClick={() => setFilter('expired')}
                  className={`px-4 py-2 rounded-md text-sm font-medium flex items-center ${filter === 'expired' ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-100 text-gray-700'}`}
                >
                  <XCircle className="mr-2" size={16} />
                  Expired
                </button>
              </div>

              <div className="flex gap-3">
                <div className="relative w-full md:w-64">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search prescriptions..."
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <button
                  onClick={() => setShowNewForm(true)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium flex items-center hover:bg-indigo-700"
                >
                  <PlusCircle className="mr-2" size={16} />
                  New Prescription
                </button>
              </div>
            </div>

            {/* New Prescription Form */}
            {showNewForm && (
              <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4 mb-6">
                <h2 className="text-lg font-medium text-indigo-800 mb-4 flex items-center">
                  <ClipboardList className="mr-2" size={18} />
                  Create New Prescription
                </h2>

                <form onSubmit={handleSubmitPrescription}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Patient Name</label>
                      <input
                        type="text"
                        placeholder="Enter patient name"
                        className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        value={newPrescription.patientName}
                        onChange={(e) => setNewPrescription(prev => ({
                          ...prev,
                          patientName: e.target.value,
                          patientId: e.target.value.toLowerCase().replace(/\s+/g, '-') // Generate simple ID from name
                        }))}
                        required
                      />
                    </div>

                    <div className="relative">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Add Medicine</label>
                      <div className="flex">
                        <input
                          type="text"
                          placeholder="Search medicines..."
                          className="w-full px-4 py-2 border border-gray-300 rounded-l-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          value={medicineSearch}
                          onChange={(e) => setMedicineSearch(e.target.value)}
                          onFocus={() => setShowMedicineDropdown(true)}
                        />
                        <button
                          type="button"
                          onClick={() => setShowMedicineDropdown(!showMedicineDropdown)}
                          className="px-3 bg-gray-100 border-t border-r border-b border-gray-300 rounded-r-md"
                        >
                          <ChevronDown className="h-5 w-5 text-gray-400" />
                        </button>
                      </div>

                      {showMedicineDropdown && (
                        <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 focus:outline-none max-h-60 overflow-auto">
                          {filteredMedicines.length > 0 ? (
                            filteredMedicines.map((medicine) => (
                              <div
                                key={medicine.id}
                                onClick={() => handleAddMedicine(medicine)}
                                className="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer"
                              >
                                <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 mr-3">
                                  <Pill size={14} />
                                </div>
                                <div>
                                  <p className="text-sm font-medium">{medicine.name}</p>
                                  {medicine.price && (
                                    <p className="text-xs text-gray-500">Price: GHS {medicine.price.toFixed(2)}</p>
                                  )}
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="px-4 py-2 text-sm text-gray-500">
                              No medicines found
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Added Medicines */}
                  {newPrescription.medicines.length > 0 && (
                    <div className="mb-4">
                      <h3 className="text-sm font-medium text-gray-700 mb-2">Prescribed Medicines</h3>
                      <div className="space-y-2">
                        {newPrescription.medicines.map((medicine, index) => (
                          <div key={index} className="flex items-center justify-between bg-white p-3 rounded-md border border-gray-200">
                            <div className="flex items-center">
                              <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 mr-3">
                                <Pill size={14} />
                              </div>
                              <div>
                                <p className="text-sm font-medium">{medicine.name}</p>
                                <p className="text-xs text-gray-500">
                                  {medicine.dosage}, {medicine.frequency}, {medicine.duration}
                                </p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveMedicine(index)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <XCircle size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Instructions</label>
                    <textarea
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Additional instructions for the patient..."
                      value={newPrescription.instructions}
                      onChange={(e) => setNewPrescription(prev => ({
                        ...prev,
                        instructions: e.target.value
                      }))}
                    />
                  </div>

                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setShowNewForm(false)}
                      className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 flex items-center"
                    >
                      <ClipboardList className="mr-2" size={16} />
                      Create Prescription
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Prescriptions List */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              {filteredPrescriptions.length === 0 ? (
                <div className="text-center py-12">
                  <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No prescriptions found</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {filter === 'active' 
                      ? "You don't have any active prescriptions."
                      : `No ${filter} prescriptions match your search.`}
                  </p>
                </div>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {filteredPrescriptions.map((prescription) => (
                    <li 
                      key={prescription.id}
                      className={`px-4 py-4 hover:bg-gray-50 cursor-pointer ${selectedPrescription?.id === prescription.id ? 'bg-indigo-50' : ''}`}
                      onClick={() => setSelectedPrescription(prescription)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center min-w-0">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 mr-3">
                            <User size={18} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium text-indigo-600 truncate">
                                {prescription.patientName}
                              </p>
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                prescription.status === 'active' ? 'bg-green-100 text-green-800' :
                                prescription.status === 'fulfilled' ? 'bg-blue-100 text-blue-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {prescription.status}
                              </span>
                            </div>
                            <p className="text-sm text-gray-500 truncate">
                              <Pill className="inline mr-1" size={14} />
                              {prescription.medicines.length} medicine(s) prescribed
                            </p>
                          </div>
                        </div>
                        <div className="ml-4 flex-shrink-0 flex flex-col items-end">
                          <p className="text-sm font-medium text-gray-900">
                            {prescription.createdAt?.toLocaleDateString() || 'Unknown date'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {prescription.medicines.length > 0 && (
                              <span className="inline-flex items-center">
                                <ShoppingCart className="mr-1" size={12} />
                                GHS {prescription.medicines.reduce((acc, med) => acc + (med.price || 0), 0).toFixed(2)}
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Prescription Details Sidebar */}
          {selectedPrescription && (
            <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Prescription Details</h2>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 mr-3">
                    <User size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">{selectedPrescription.patientName}</h3>
                    <p className="text-sm text-gray-500">Patient</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 mr-3">
                    <ClipboardList size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">
                      {selectedPrescription.createdAt?.toLocaleDateString() || 'Unknown date'}
                    </h3>
                    <p className="text-sm text-gray-500">Date prescribed</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Prescribed Medicines</h3>
                  <div className="space-y-2">
                    {selectedPrescription.medicines.map((medicine, index) => (
                      <div key={index} className="bg-white p-3 rounded-md border border-gray-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 mr-3">
                              <Pill size={14} />
                            </div>
                            <div>
                              <p className="text-sm font-medium">{medicine.name}</p>
                              <p className="text-xs text-gray-500">
                                {medicine.dosage}, {medicine.frequency}, {medicine.duration}
                              </p>
                              {medicine.price && (
                                <p className="text-xs text-indigo-600 mt-1">
                                  Price: GHS {medicine.price.toFixed(2)}
                                </p>
                              )}
                            </div>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            selectedPrescription.status === 'active' ? 'bg-green-100 text-green-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {selectedPrescription.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {selectedPrescription.instructions && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-1">Doctor's Instructions</h3>
                    <p className="text-sm text-gray-600 bg-white p-3 rounded-md border border-gray-200">
                      {selectedPrescription.instructions}
                    </p>
                  </div>
                )}

                <div className="pt-4 border-t border-gray-200">
                  <div className="flex justify-between space-x-3">
                    {selectedPrescription.status === 'active' && (
                      <>
                        <button
                          onClick={() => handleUpdateStatus(selectedPrescription.id, 'fulfilled')}
                          className="flex-1 bg-indigo-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex items-center justify-center"
                        >
                          <CheckCircle className="mr-2" size={16} />
                          Mark as Fulfilled
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(selectedPrescription.id, 'expired')}
                          className="flex-1 bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex items-center justify-center"
                        >
                          <XCircle className="mr-2" size={16} />
                          Mark as Expired
                        </button>
                      </>
                    )}
                    {selectedPrescription.status === 'fulfilled' && (
                      <div className="w-full text-center py-2 text-sm text-blue-600 font-medium">
                        This prescription has been fulfilled
                      </div>
                    )}
                    {selectedPrescription.status === 'expired' && (
                      <div className="w-full text-center py-2 text-sm text-red-600 font-medium">
                        This prescription has expired
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

export default DoctorPrescriptions;