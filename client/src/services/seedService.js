import { auth, db } from '../firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, collection, getDocs } from 'firebase/firestore';

const sampleTeachers = [
  {
    name: 'Prof. Rajesh Kumar',
    email: 'rajesh@college.edu',
    password: 'password123',
    department: 'Computer Science',
    timetable: {
      monday: [
        { slot: 1, subject: 'Data Structures' },
        { slot: 3, subject: 'Algorithms' },
        { slot: 5, subject: 'DS Lab' },
        { slot: 6, subject: 'DS Lab' }
      ],
      tuesday: [
        { slot: 2, subject: 'Data Structures' },
        { slot: 4, subject: 'Algorithms' },
        { slot: 7, subject: 'Programming in C' }
      ],
      wednesday: [
        { slot: 1, subject: 'Algorithms' },
        { slot: 3, subject: 'Data Structures' },
        { slot: 5, subject: 'Programming in C' }
      ],
      thursday: [
        { slot: 2, subject: 'Data Structures' },
        { slot: 4, subject: 'Algorithms' },
        { slot: 6, subject: 'DS Lab' }
      ],
      friday: [
        { slot: 1, subject: 'Programming in C' },
        { slot: 3, subject: 'Data Structures' },
        { slot: 8, subject: 'Algorithms' }
      ],
      saturday: [
        { slot: 1, subject: 'Data Structures' },
        { slot: 2, subject: 'Algorithms' }
      ]
    }
  },
  {
    name: 'Prof. Priya Sharma',
    email: 'priya@college.edu',
    password: 'password123',
    department: 'Computer Science',
    timetable: {
      monday: [{ slot: 2, subject: 'Database Management' }, { slot: 4, subject: 'Software Engineering' }],
      tuesday: [{ slot: 1, subject: 'Database Management' }, { slot: 3, subject: 'Software Engineering' }],
      wednesday: [{ slot: 2, subject: 'Software Engineering' }, { slot: 4, subject: 'Database Management' }],
      thursday: [{ slot: 1, subject: 'Web Development' }, { slot: 3, subject: 'Database Management' }],
      friday: [{ slot: 2, subject: 'Database Management' }, { slot: 4, subject: 'Software Engineering' }],
      saturday: [{ slot: 3, subject: 'Software Engineering' }]
    }
  },
  {
    name: 'Prof. Amit Patel',
    email: 'amit@college.edu',
    password: 'password123',
    department: 'Computer Science',
    timetable: {
      monday: [{ slot: 1, subject: 'Operating Systems' }, { slot: 3, subject: 'Computer Networks' }],
      tuesday: [{ slot: 2, subject: 'Operating Systems' }, { slot: 5, subject: 'Computer Networks' }],
      wednesday: [{ slot: 1, subject: 'Computer Networks' }, { slot: 4, subject: 'Operating Systems' }],
      thursday: [{ slot: 3, subject: 'Computer Networks' }, { slot: 5, subject: 'Operating Systems' }],
      friday: [{ slot: 1, subject: 'Operating Systems' }, { slot: 4, subject: 'Computer Networks' }],
      saturday: [{ slot: 1, subject: 'Operating Systems' }, { slot: 4, subject: 'Computer Networks' }]
    }
  }
];

export const seedDatabase = async () => {
  console.log('Checking if seeding is needed...');
  try {
    const usersRef = collection(db, 'users');
    const snap = await getDocs(usersRef);
    if (!snap.empty) {
      console.log('Database already has users. Skipping seed.');
      return false;
    }

    console.log('Seeding Database with sample teachers...');
    for (const teacher of sampleTeachers) {
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, teacher.email, teacher.password);
        const user = userCredential.user;
        
        await setDoc(doc(db, 'users', user.uid), {
          _id: user.uid,
          name: teacher.name,
          email: teacher.email,
          department: teacher.department,
          timetable: teacher.timetable,
          createdAt: new Date()
        });
        console.log(`Created: ${teacher.name}`);
      } catch (err) {
        console.error(`Failed to create ${teacher.email}:`, err.message);
      }
    }
    
    // Sign out after seeding so the user can login properly
    await auth.signOut();
    return true;
  } catch (error) {
    console.error("Seeding Error:", error);
    return false;
  }
};
