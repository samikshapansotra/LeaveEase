import { localCollection } from '../utils/localDb';

const usersCollection = localCollection('users');

const rawFaculty = [
  { id: 'T01', name: 'Er. Bhavneet Singh', initials: 'BS' },
  { id: 'T02', name: 'Er. Bikramjit Singh', initials: 'BJS' },
  { id: 'T03', name: 'Er. Navjot Kaur', initials: 'NK' },
  { id: 'T04', name: 'Er. Gurjinderpal Singh', initials: 'GPS' },
  { id: 'T05', name: 'Er. Gurleen Kaur', initials: 'GK' },
  { id: 'T06', name: 'Er. Shivani', initials: 'S' },
  { id: 'T07', name: 'Er. Kanwaldeep', initials: 'K' },
  { id: 'T08', name: 'Er. Sandeep Kaur', initials: 'SK' },
  { id: 'T09', name: 'Er. Gurwinder Singh', initials: 'GWS' },
  { id: 'T10', name: 'Er. Gurmeet Singh', initials: 'GMS' },
  { id: 'T11', name: 'Er. Satinderbir Kaur', initials: 'SBK' },
  { id: 'T12', name: 'Er. Nisha', initials: 'N' },
  { id: 'T13', name: 'Er. Akash Gill', initials: 'AG' },
  { id: 'T14', name: 'Er. Nikhil', initials: 'NKH' },
  { id: 'T15', name: 'Er. Sanjogdeep Singh', initials: 'SS' },
  { id: 'T16', name: 'Er. Manpreet Kaur', initials: 'MK' }
];

const freeSlotsData = {
  monday: {
    1: ["T01","T04","T07","T08","T11","T14","T15"],
    2: ["T01","T02","T03","T04","T05","T08","T09","T10","T12","T13","T15"],
    3: ["T06","T07","T11","T14","T16","T08"],
    4: ["T01","T02","T03","T04","T06","T09","T12","T13","T16"],
    5: ["T01","T02","T03","T04","T06","T11","T12","T13","T14","T15","T16"],
    6: ["T01","T02","T03","T04","T05","T08","T09","T10","T11","T12","T13","T14"],
    7: ["T04","T05","T06","T07","T09","T10","T12","T15"],
    8: ["T01","T05","T07","T08","T09","T10","T15"]
  },
  tuesday: {
    1: ["T03","T04","T05","T07","T08","T09","T10","T12","T13"],
    2: ["T02","T06","T07","T11","T14","T16","T13","T15"],
    3: ["T01","T04","T05","T08","T09","T10","T12","T14","T15"],
    4: ["T01","T02","T05","T06","T07","T08","T09","T10","T11","T12","T15","T16"],
    5: ["T01","T02","T04","T06","T10","T11"],
    6: ["T01","T02","T03","T04","T05","T06","T07","T09","T12","T13","T14","T15"],
    7: ["T01","T02","T03","T04","T05","T06","T07","T08","T09","T10","T11","T12","T13","T14","T15","T16"],
    8: ["T01","T02","T03","T04","T05","T06","T07","T08","T09","T10","T11","T12","T13","T14","T15","T16"]
  },
  wednesday: {
    1: ["T01","T02","T03","T06","T09","T10","T16"],
    2: ["T02","T04","T05","T06","T07","T08","T11","T13","T15","T14","T16"],
    3: ["T01","T03","T05","T08","T10","T12"],
    4: ["T01","T03","T05","T08","T10","T12","T13","T14"],
    5: ["T04","T05","T06","T07","T09","T13","T11","T16"],
    6: ["T01","T02","T04","T05","T08","T09","T12"],
    7: ["T01","T03","T10","T13","T08","T14","T15","T16"],
    8: ["T01","T03","T05","T08","T11","T12","T14","T16"]
  },
  thursday: {
    1: ["T01","T02","T06","T11","T12","T13","T15"],
    2: ["T03","T04","T07","T09","T10","T11","T15","T16"],
    3: ["T01","T02","T03","T06","T08","T10"],
    4: ["T01","T06","T08","T09","T10","T11","T14","T15"],
    5: ["T01","T02","T04","T06","T09","T11","T14","T15"],
    6: ["T01","T02","T03","T07","T08","T09","T12","T13","T15","T16"],
    7: ["T02","T03","T05","T06","T07","T10","T11","T12","T14"],
    8: ["T01","T02","T03","T04","T05","T06","T07","T09","T10","T12"]
  },
  friday: {
    1: ["T01","T03","T04","T06","T07","T11","T13","T14","T16"],
    2: ["T03","T05","T08","T09","T10","T12"],
    3: ["T01","T04","T06","T07","T08","T11","T13","T14","T16"],
    4: ["T01","T02","T04","T05","T07","T08","T13","T15","T16"],
    5: ["T01","T04","T05","T06","T07","T08","T11","T16"],
    6: ["T01","T02","T03","T04","T06","T08","T11","T15","T16"],
    7: ["T01","T07","T09","T11","T12","T13","T14","T15","T16"],
    8: ["T02","T03","T04","T07","T10","T12","T14"]
  }
};

const sampleTeachers = rawFaculty.map(f => {
  const timetable = {
    monday: [], tuesday: [], wednesday: [], thursday: [], friday: []
  };

  ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'].forEach(day => {
    [1, 2, 3, 4, 5, 6, 7, 8].forEach(slot => {
      const isFree = freeSlotsData[day][slot].includes(f.id);
      if (!isFree) {
        timetable[day].push({ slot, subject: 'Class' }); 
      }
    });
  });

  return {
    name: `${f.initials} (${f.id})`,
    email: `${f.id.toLowerCase()}@college.edu`,
    password: 'password123',
    department: 'Computer Science',
    role: 'teacher',
    profileSetup: true,
    timetable
  };
});

const adminUser = {
  name: 'Dr. Admin',
  email: 'admin@college.edu',
  password: 'admin123',
  department: 'Computer Science',
  role: 'admin',
  profileSetup: true,
  timetable: {
    monday: [], tuesday: [], wednesday: [],
    thursday: [], friday: []
  }
};

export const seedDatabase = async () => {
  console.log('Checking database and seeding real-world data...');
  try {
    const existingUsers = usersCollection.getAll();
    
    // Check if Tuesday 7 or 8 is incorrectly assigned to ANY teacher
    let needsTuesdayFix = false;
    for (const u of existingUsers) {
      if (u.timetable?.tuesday?.some(s => s.slot === 7 || s.slot === 8)) {
        needsTuesdayFix = true;
        break;
      }
    }
    
    if (needsTuesdayFix || existingUsers.length === 0) {
      console.log('Migrating: clearing old data to ensure Tuesday 7 & 8 are entirely free...');
      usersCollection.setAll([]);
      const leavesCollection = localCollection('leaves');
      const subsCollection = localCollection('substitutionRequests');
      leavesCollection.setAll([]);
      subsCollection.setAll([]);

      // Seed admin
      const savedAdmin = usersCollection.add({
        ...adminUser,
        createdAt: new Date().toISOString()
      });
      console.log(`Created admin: ${adminUser.name}`);

      // Seed teachers
      for (const teacher of sampleTeachers) {
        usersCollection.add({
          name: teacher.name,
          email: teacher.email,
          password: teacher.password,
          department: teacher.department,
          role: teacher.role,
          profileSetup: teacher.profileSetup,
          timetable: teacher.timetable,
          createdAt: new Date().toISOString()
        });
        console.log(`Created teacher: ${teacher.name}`);
      }

      // We explicitly NO LONGER seed dummy leaves. 
      // The old fake leaves caused contradictions with the actual free slots.

      // Auto-login as admin
      localStorage.setItem('currentUser', JSON.stringify({ uid: savedAdmin._id }));
      console.log('Auto-logged in as admin. No fake data added.');
      
      // Force reload to reflect new clean data
      window.location.reload();
      
    } else {
      console.log('Database already seeded with real-world T-ID data.');
      
      const authData = localStorage.getItem('currentUser');
      if (!authData) {
        const admin = existingUsers.find(u => u.role === 'admin');
        if (admin) {
          localStorage.setItem('currentUser', JSON.stringify({ uid: admin._id }));
          console.log('Auto-logged in as admin.');
        }
      }
    }
    return true;
  } catch (error) {
    console.error("Seeding Error:", error);
    return false;
  }
};

