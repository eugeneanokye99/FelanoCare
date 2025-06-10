import { createContext, useContext, useState, useEffect } from 'react';
import { 
  auth, 
  db,
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile
} from '../firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sign up function
  async function signup(email, password, name, userType, licenseNumber = null) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update user profile with display name
      await updateProfile(userCredential.user, {
        displayName: name
      });

      // Create user document in Firestore
      const userDocRef = doc(db, 'users', userCredential.user.uid);
      await setDoc(userDocRef, {
        uid: userCredential.user.uid,
        name,
        email,
        userType,
        licenseNumber: userType === 'doctor' ? licenseNumber : null,
        createdAt: new Date()
      });

      return userCredential;
    } catch (error) {
      throw error;
    }
  }

  // Login function
  async function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  // Logout function
  async function logout() {
    return signOut(auth);
  }

  // Password reset function
  async function resetPassword(email) {
    return sendPasswordResetEmail(auth, email);
  }

  // Fetch user data from Firestore
  async function fetchUserData(uid) {
    try {
      if (!uid) throw new Error("UID is undefined");
      const docRef = doc(db, 'users', uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return docSnap.data();
      }
      return null;
    } catch (error) {
      console.error("Error fetching Firestore user data:", error);
      throw error; // still throw to handle upstream
    }
  }
  

  // Update user profile
  async function updateUserProfile(updates) {
    try {
      // Update in Firebase Auth
      if (updates.displayName || updates.photoURL) {
        await updateProfile(auth.currentUser, {
          displayName: updates.displayName || auth.currentUser.displayName,
          photoURL: updates.photoURL || auth.currentUser.photoURL
        });
      }

      // Update in Firestore
      const userDocRef = doc(db, 'users', auth.currentUser.uid);
      await setDoc(userDocRef, updates, { merge: true });

      // Refresh user data
      const updatedData = await fetchUserData(auth.currentUser.uid);
      setUserData(updatedData);
    } catch (error) {
      throw error;
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          setUserData(userDoc.exists() ? userDoc.data() : null);
        } catch (e) {
          console.error('Failed to fetch user data', e);
          setUserData(null);
        }
      } else {
        setUserData(null);
      }
      setLoading(false); // <- critical
    });
  
    return unsubscribe;
  }, []);
  

  const value = {
    currentUser,
    userData,
    signup,
    login,
    logout,
    resetPassword,
    updateUserProfile,
    fetchUserData
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}