import { auth, db } from '../firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut 
} from 'firebase/auth';
import { doc, setDoc, getDoc, collection, getDocs, updateDoc, query, where } from 'firebase/firestore';

// Register User
export const registerUser = async (userData) => {
  const { name, email, password, department, timetable } = userData;
  
  // 1. Create user in Firebase Auth
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  // 2. Create user document in Firestore
  const userDocRef = doc(db, 'users', user.uid);
  const newUserData = {
    _id: user.uid,
    name,
    email,
    department,
    timetable,
    createdAt: new Date()
  };

  await setDoc(userDocRef, newUserData);
  return newUserData;
};

// Login User
export const loginUser = async (email, password) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;
  
  const userDocRef = doc(db, 'users', user.uid);
  const userDoc = await getDoc(userDocRef);
  
  if (userDoc.exists()) {
    return userDoc.data();
  } else {
    throw new Error('User profile not found in database');
  }
};

// Logout User
export const logoutUser = async () => {
  await signOut(auth);
};

// Get Current User Profile
export const getCurrentUserProfile = async (uid) => {
  if (!uid) return null;
  const userDocRef = doc(db, 'users', uid);
  const userDoc = await getDoc(userDocRef);
  
  if (userDoc.exists()) {
    return userDoc.data();
  }
  return null;
};

// Update Timetable
export const updateTimetable = async (uid, timetable) => {
  const userDocRef = doc(db, 'users', uid);
  await updateDoc(userDocRef, { timetable });
  
  const userDoc = await getDoc(userDocRef);
  return userDoc.data();
};

// Get All Teachers (except current)
export const getAllTeachersInfo = async (currentUid) => {
  const usersRef = collection(db, 'users');
  const snapshot = await getDocs(usersRef);
  
  const teachers = [];
  snapshot.forEach(doc => {
    if (doc.id !== currentUid) {
      teachers.push(doc.data());
    }
  });
  
  return teachers;
};
