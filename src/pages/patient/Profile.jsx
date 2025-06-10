import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { LogOut, Settings } from 'lucide-react';

export default function Profile() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const userSnap = await getDoc(userDocRef);
        setUser({ uid: firebaseUser.uid, email: firebaseUser.email, ...userSnap.data() });
      } else {
        navigate('/login');
      }
    });

    return () => unsubscribe();
  }, []);

  const handleEdit = () => {
    navigate('/edit-profile');
  };

  if (!user) return <div className="p-6 text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-8">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-md p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">User Profile</h1>
          <button
            onClick={() => auth.signOut()}
            className="text-red-500 hover:text-red-700 flex items-center gap-2"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>

        {/* Basic Info */}
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">{user.name}</h2>
          <p className="text-sm text-gray-600">{user.email}</p>
          <p className="text-sm text-gray-500">Country: {user.country}</p>
          <div className="grid grid-cols-2 gap-4 text-sm mt-2">
            <p>Age: <span className="font-medium">{user.age || 'N/A'}</span></p>
            <p>Gender: <span className="font-medium">{user.gender || 'N/A'}</span></p>
            <p>Blood Group: <span className="font-medium">{user.bloodGroup || 'N/A'}</span></p>
          </div>
        </div>

        {/* Health Score */}
        <div className="bg-indigo-100 rounded-xl p-4 mt-4">
          <h3 className="text-md font-medium text-indigo-700 mb-2">Health Insight</h3>
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-700">Health Score:</p>
            <span className="text-xl font-bold text-indigo-900">{user.healthScore ?? 'N/A'}/100</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Your health score is based on consultations, self-reported wellness, and habits.
          </p>
        </div>

        {/* Bio */}
        {user.bio && (
          <div>
            <h3 className="text-md font-semibold mt-6 mb-2">About Me</h3>
            <p className="text-sm text-gray-700">{user.bio}</p>
          </div>
        )}

        {/* Settings */}
        <div className="bg-gray-100 p-4 rounded-xl mt-6">
          <h3 className="text-md font-semibold mb-2 flex items-center gap-2">
            <Settings className="w-4 h-4" /> Settings
          </h3>
          <div className="text-sm space-y-1">
            <p>Notifications: <span className="font-medium">{user.notifications ? 'On' : 'Off'}</span></p>
            <p>Dark Mode: <span className="font-medium">{user.darkMode ? 'Enabled' : 'Disabled'}</span></p>
          </div>
        </div>

        {/* Edit Button */}
        <div className="mt-4 text-right">
          <button
            onClick={handleEdit}
            className="px-4 py-2 bg-indigo-600 text-white rounded-full text-sm hover:bg-indigo-700"
          >
            Edit Profile
          </button>
        </div>
      </div>
    </div>
  );
}
