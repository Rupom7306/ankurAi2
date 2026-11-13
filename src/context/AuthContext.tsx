import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebase';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  registerUser: (name: string, email: string, password: string) => Promise<void>;
  loginUser: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logoutUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen for Firebase Auth state changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Register with Name, Email & Password
  const registerUser = async (name: string, email: string, password: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Update display name
    if (name) {
      await updateProfile(user, { displayName: name });
    }

    // Non-blocking sync to Firestore profile
    setDoc(doc(db, 'users', user.uid), {
      uid: user.uid,
      displayName: name,
      email: user.email,
      createdAt: new Date().toISOString(),
      role: 'farmer',
    }, { merge: true }).catch(() => {});

    setCurrentUser({ ...user, displayName: name } as User);
  };

  // Login with Email & Password
  const loginUser = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  // Login with Google
  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    const user = userCredential.user;

    // Non-blocking sync to Firestore profile
    setDoc(doc(db, 'users', user.uid), {
      uid: user.uid,
      displayName: user.displayName || user.email?.split('@')[0],
      email: user.email,
      photoURL: user.photoURL,
      createdAt: new Date().toISOString(),
      role: 'farmer',
    }, { merge: true }).catch(() => {});

    setCurrentUser(user);
  };

  // Sign out
  const logoutUser = async () => {
    await signOut(auth);
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider value={{ currentUser, loading, registerUser, loginUser, loginWithGoogle, logoutUser }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
