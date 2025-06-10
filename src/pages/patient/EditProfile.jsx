import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import toast from 'react-hot-toast';

export default function EditProfile() {
  const [formData, setFormData] = useState({
    name: '',
    country: '',
    age: '',
    gender: '',
    bloodGroup: '',
    bio: '',
    notifications: false,
    darkMode: false,
    healthScore: ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      const user = auth.currentUser;
      if (!user) return navigate('/login');

      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setFormData({ ...formData, ...docSnap.data() });
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const user = auth.currentUser;
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, formData);

      toast.success('Profile updated successfully');
      navigate('/profile');
    } catch (error) {
      console.error(error);
      toast.error('Update failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto bg-white p-6 rounded-2xl shadow-md">
        <h1 className="text-2xl font-bold mb-6">Edit Profile</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleChange}
              className="input"
              required
            />
            <input
              type="text"
              name="country"
              placeholder="Country"
              value={formData.country}
              onChange={handleChange}
              className="input"
            />
            <input
              type="number"
              name="age"
              placeholder="Age"
              value={formData.age}
              onChange={handleChange}
              className="input"
            />
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="input"
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
            <input
              type="text"
              name="bloodGroup"
              placeholder="Blood Group (e.g. O+)"
              value={formData.bloodGroup}
              onChange={handleChange}
              className="input"
            />
            <input
              type="number"
              name="healthScore"
              placeholder="Health Score (0-100)"
              value={formData.healthScore}
              onChange={handleChange}
              className="input"
              max={100}
              min={0}
            />
          </div>

          <textarea
            name="bio"
            placeholder="Write a short bio..."
            value={formData.bio}
            onChange={handleChange}
            className="input h-24 resize-none"
          />

          <div className="flex items-center space-x-6">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="notifications"
                checked={formData.notifications}
                onChange={handleChange}
              />
              <span className="text-sm">Enable Notifications</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="darkMode"
                checked={formData.darkMode}
                onChange={handleChange}
              />
              <span className="text-sm">Dark Mode</span>
            </label>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-full text-sm"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
