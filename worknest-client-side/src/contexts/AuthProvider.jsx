import { useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from "firebase/auth";
import { auth } from "../firebase/firebase.init";
import axios from "axios";

const googleProvider = new GoogleAuthProvider();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Function to sync user to database
  const syncUserToDatabase = async (firebaseUser) => {
    if (!firebaseUser) return;

    try {
      // Check if user exists in database
      const response = await axios.get(`http://localhost:3000/users/${firebaseUser.uid}`);
      console.log("User exists in database:", response.data);
    } catch (error) {
      // If user doesn't exist (404), create them
      if (error.response?.status === 404) {
        try {
          console.log("Creating user in database...");
          const createResponse = await axios.post('http://localhost:3000/users', {
            uid: firebaseUser.uid,
            name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
            email: firebaseUser.email,
            photoURL: firebaseUser.photoURL || null,
            role: 'employee',
            profileCompleted: false,
            isActive: true
          });
          console.log("User created successfully:", createResponse.data);
        } catch (createError) {
          console.error("Error creating user in database:", createError);
        }
      } else {
        console.error("Error checking user:", error);
      }
    }
  };

  const createUser = async (email, password) => {
    setLoading(true);
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      // Sync to database after creation
      await syncUserToDatabase(result.user);
      return result;
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const signInUser = async (email, password) => {
    setLoading(true);
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      // Sync to database after sign in (in case user was created outside this flow)
      await syncUserToDatabase(result.user);
      return result;
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const googleSignIn = async () => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      // Sync to database after Google sign in
      await syncUserToDatabase(result.user);
      return result;
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const signOutUser = () => {
    setLoading(true);
    return signOut(auth);
  };

  const updateUser = (updatedData) => {
    return updateProfile(auth.currentUser, updatedData);
  };

  useEffect(() => {
    const unSubscribe = onAuthStateChanged(auth, async (currentUser) => {
      console.log("Auth state changed:", currentUser?.email);
      
      if (currentUser) {
        // Sync user to database when auth state changes
        await syncUserToDatabase(currentUser);
      }
      
      setUser(currentUser);
      setLoading(false);
    });

    return () => unSubscribe();
  }, []);

  const userInfo = {
    user,
    loading,
    setUser,
    createUser,
    signInUser,
    googleSignIn,
    signOutUser,
    updateUser,
  };

  return (
    <AuthContext.Provider value={userInfo}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;