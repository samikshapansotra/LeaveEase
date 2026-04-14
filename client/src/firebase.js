import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// TODO: Replace with your actual Firebase project configuration
// 1. Go to console.firebase.google.com
// 2. Create a project
// 3. Add a Web App and copy the config here
// 4. Enable Authentication (Email/Password)
// 5. Create a Firestore Database
const firebaseConfig = {
  apiKey: "AIzaSyA3VvcSAiDmC3nTV8pYTFWgBRixwSIWUsk",
  authDomain: "leaveease-178f3.firebaseapp.com",
  projectId: "leaveease-178f3",
  storageBucket: "leaveease-178f3.firebasestorage.app",
  messagingSenderId: "41814483160",
  appId: "1:41814483160:web:6287c1e026088a168c77ad",
  measurementId: "G-ZDTPZ69V6R"
};

let app, auth, db;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
} catch (error) {
  console.error("Firebase initialization failed:", error);
}

export { auth, db };
