import { db } from '../firebase';
import { 
  collection, 
  addDoc, 
  getDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  query, 
  where, 
  orderBy,
  Timestamp
} from 'firebase/firestore';
import { getCurrentUserProfile } from './authService';

const leavesCollection = collection(db, 'leaves');

// Create leave application
export const createLeave = async (applicantId, leaveData) => {
  const { date, reason, lecturesOnLeave } = leaveData;
  
  const docRef = await addDoc(leavesCollection, {
    applicantId,
    date, // expects string 'YYYY-MM-DD'
    reason,
    lecturesOnLeave: lecturesOnLeave.map(l => ({ ...l, covered: false, coveredById: null })),
    status: 'pending',
    createdAt: new Date().toISOString()
  });

  return await getLeaveById(docRef.id);
};

// Get current user's leave applications
export const getMyLeaves = async (userId) => {
  const q = query(
    leavesCollection, 
    where('applicantId', '==', userId)
  );
  
  const snapshot = await getDocs(q);
  const leaves = [];
  
  for (const docSnap of snapshot.docs) {
    const leave = { _id: docSnap.id, ...docSnap.data() };
    
    // Populate applicant
    const applicant = await getCurrentUserProfile(leave.applicantId);
    leave.applicant = applicant;
    
    // Populate coveredBy for each lecture
    for (let i = 0; i < leave.lecturesOnLeave.length; i++) {
      if (leave.lecturesOnLeave[i].coveredById) {
        const coveredBy = await getCurrentUserProfile(leave.lecturesOnLeave[i].coveredById);
        leave.lecturesOnLeave[i].coveredBy = coveredBy;
      }
    }
    
    leaves.push(leave);
  }
  
  // Sort by createdAt desc locally (since Firestore needs index for composite query)
  return leaves.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

// Get specific leave application
export const getLeaveById = async (leaveId) => {
  const docRef = doc(db, 'leaves', leaveId);
  const docSnap = await getDoc(docRef);
  
  if (!docSnap.exists()) {
    throw new Error('Leave application not found');
  }
  
  const leave = { _id: docSnap.id, ...docSnap.data() };
  
  // Populate applicant
  const applicant = await getCurrentUserProfile(leave.applicantId);
  leave.applicant = applicant;
  
  // Populate coveredBy for each lecture
  for (let i = 0; i < leave.lecturesOnLeave.length; i++) {
    if (leave.lecturesOnLeave[i].coveredById) {
      const coveredBy = await getCurrentUserProfile(leave.lecturesOnLeave[i].coveredById);
      leave.lecturesOnLeave[i].coveredBy = coveredBy;
    }
  }
  
  return leave;
};

// Cancel leave application
export const cancelLeave = async (leaveId, userId) => {
  const leave = await getLeaveById(leaveId);
  
  if (leave.applicantId !== userId) {
    throw new Error('Unauthorized');
  }
  
  const docRef = doc(db, 'leaves', leaveId);
  await updateDoc(docRef, { status: 'cancelled' });
  
  return await getLeaveById(leaveId);
};
