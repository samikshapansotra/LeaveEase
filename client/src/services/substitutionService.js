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
  writeBatch
} from 'firebase/firestore';
import { getCurrentUserProfile, getAllTeachersInfo } from './authService';
import { getLeaveById } from './leaveService';

const substitutionsCollection = collection(db, 'substitutionRequests');

// Send substitution request
export const sendSubstitutionRequest = async (requestData) => {
  const { leaveApplicationId, fromTeacherId, toTeacherId, lectureSlot, subject, date } = requestData;

  // Check if a request already exists
  const q1 = query(
    substitutionsCollection,
    where('leaveApplicationId', '==', leaveApplicationId),
    where('toTeacherId', '==', toTeacherId),
    where('lectureSlot', '==', lectureSlot),
    where('status', 'in', ['pending', 'accepted'])
  );
  
  const existingReqs = await getDocs(q1);
  if (!existingReqs.empty) {
    throw new Error('A request already exists for this teacher and slot');
  }

  // Check if slot is already covered
  const q2 = query(
    substitutionsCollection,
    where('leaveApplicationId', '==', leaveApplicationId),
    where('lectureSlot', '==', lectureSlot),
    where('status', '==', 'accepted')
  );
  
  const acceptedReqs = await getDocs(q2);
  if (!acceptedReqs.empty) {
    throw new Error('This lecture slot is already covered');
  }

  const docRef = await addDoc(substitutionsCollection, {
    leaveApplicationId,
    fromTeacherId,
    toTeacherId,
    lectureSlot,
    subject,
    date, // 'YYYY-MM-DD'
    status: 'pending',
    rejectionReason: '',
    createdAt: new Date().toISOString()
  });

  return await getRequestById(docRef.id);
};

// Get request by ID (helper)
export const getRequestById = async (requestId) => {
  const docRef = doc(db, 'substitutionRequests', requestId);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return null;
  
  const req = { _id: docSnap.id, ...docSnap.data() };
  req.fromTeacher = await getCurrentUserProfile(req.fromTeacherId);
  req.toTeacher = await getCurrentUserProfile(req.toTeacherId);
  return req;
};

// Get incoming requests
export const getIncomingRequests = async (userId) => {
  const q = query(
    substitutionsCollection,
    where('toTeacherId', '==', userId)
  );
  
  const snapshot = await getDocs(q);
  const requests = [];
  
  for (const docSnap of snapshot.docs) {
    const req = { _id: docSnap.id, ...docSnap.data() };
    req.fromTeacher = await getCurrentUserProfile(req.fromTeacherId);
    req.toTeacher = await getCurrentUserProfile(req.toTeacherId);
    requests.push(req);
  }
  
  return requests.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

// Get outgoing requests for a specific leave
export const getOutgoingRequests = async (leaveId, userId) => {
  const q = query(
    substitutionsCollection,
    where('leaveApplicationId', '==', leaveId),
    where('fromTeacherId', '==', userId)
  );
  
  const snapshot = await getDocs(q);
  const requests = [];
  
  for (const docSnap of snapshot.docs) {
    const req = { _id: docSnap.id, ...docSnap.data() };
    req.fromTeacher = await getCurrentUserProfile(req.fromTeacherId);
    req.toTeacher = await getCurrentUserProfile(req.toTeacherId);
    requests.push(req);
  }
  
  return requests.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

// Accept substitution request
export const acceptRequest = async (requestId, userId) => {
  const request = await getRequestById(requestId);
  
  if (!request || request.toTeacherId !== userId || request.status !== 'pending') {
    throw new Error('Request not found or already processed');
  }

  // Check if slot already covered
  const q = query(
    substitutionsCollection,
    where('leaveApplicationId', '==', request.leaveApplicationId),
    where('lectureSlot', '==', request.lectureSlot),
    where('status', '==', 'accepted')
  );
  
  const alreadyCovered = await getDocs(q);
  if (!alreadyCovered.empty) {
    // Reject this one automatically
    const docRef = doc(db, 'substitutionRequests', requestId);
    await updateDoc(docRef, { 
      status: 'rejected',
      rejectionReason: 'Slot already covered by another teacher'
    });
    throw new Error('This slot has already been covered by another teacher');
  }

  // Update request status
  const requestRef = doc(db, 'substitutionRequests', requestId);
  await updateDoc(requestRef, { status: 'accepted' });

  // Update Leave Application
  const leaveRef = doc(db, 'leaves', request.leaveApplicationId);
  const leaveSnap = await getDoc(leaveRef);
  
  if (leaveSnap.exists()) {
    const leaveData = leaveSnap.data();
    const lectures = leaveData.lecturesOnLeave;
    
    // Update the specific lecture
    const updatedLectures = lectures.map(l => {
      if (l.slot === request.lectureSlot) {
        return { ...l, covered: true, coveredById: userId };
      }
      return l;
    });
    
    // Calc new status
    const totalLectures = updatedLectures.length;
    const coveredLectures = updatedLectures.filter(l => l.covered).length;
    
    let newStatus = 'pending';
    if (coveredLectures === totalLectures) newStatus = 'fully_covered';
    else if (coveredLectures > 0) newStatus = 'partially_covered';
    
    await updateDoc(leaveRef, {
      lecturesOnLeave: updatedLectures,
      status: newStatus
    });
  }

  // Reject other pending requests for the same slot
  const pendingQ = query(
    substitutionsCollection,
    where('leaveApplicationId', '==', request.leaveApplicationId),
    where('lectureSlot', '==', request.lectureSlot),
    where('status', '==', 'pending')
  );
  
  const pendingSnap = await getDocs(pendingQ);
  const batch = writeBatch(db);
  
  pendingSnap.docs.forEach(d => {
    if (d.id !== requestId) {
      batch.update(d.ref, { 
        status: 'rejected',
        rejectionReason: 'Slot covered by another teacher'
      });
    }
  });
  
  await batch.commit();

  return await getRequestById(requestId);
};

// Reject substitution request
export const rejectRequest = async (requestId, userId, reason) => {
  const request = await getRequestById(requestId);
  
  if (!request || request.toTeacherId !== userId || request.status !== 'pending') {
    throw new Error('Request not found or already processed');
  }

  const docRef = doc(db, 'substitutionRequests', requestId);
  await updateDoc(docRef, { 
    status: 'rejected',
    rejectionReason: reason || 'No reason provided'
  });

  return await getRequestById(requestId);
};

// Get Available Teachers
export const getAvailableTeachers = async (dateStr, slot, currentUserId) => {
  if (!dateStr || !slot) {
    throw new Error('Date and slot are required');
  }

  const leaveDate = new Date(dateStr + 'T00:00:00');
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const dayName = days[leaveDate.getDay()];
  const slotNum = parseInt(slot);

  // Get all teachers except current
  const allTeachers = await getAllTeachersInfo(currentUserId);

  // Filter those who don't have a lecture at this time
  const availableTeachers = allTeachers.filter(teacher => {
    const daySchedule = teacher.timetable?.[dayName] || [];
    const hasLecture = daySchedule.some(l => l.slot === slotNum);
    return !hasLecture;
  });

  // Filter out those who have already accepted a substitution
  const q = query(
    substitutionsCollection,
    where('date', '==', dateStr),
    where('lectureSlot', '==', slotNum),
    where('status', '==', 'accepted')
  );
  
  const busySubs = await getDocs(q);
  const busyTeacherIds = busySubs.docs.map(d => d.data().toTeacherId);

  return availableTeachers.filter(t => !busyTeacherIds.includes(t._id));
};
