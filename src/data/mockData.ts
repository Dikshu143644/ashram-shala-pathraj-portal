import type {
  Student,
  Staff,
  HostelRoom,
  HostelBed,
  MessRecord,
  WhatsAppLog,
  Standard,
  CasteCategory,
  StudentStatus,
  HostelWing,
  MealType,
  WhatsAppMessageType,
  WhatsAppMessageStatus,
} from '../types';

// ============================================================
// Name arrays for generating realistic Marathi tribal names
// ============================================================

const maleFirstNames = [
  'राहुल', 'सूरज', 'विकास', 'अमित', 'संदीप', 'प्रशांत', 'गणेश', 'महेश',
  'रमेश', 'सुनील', 'अजय', 'विजय', 'राजेश', 'दिनेश', 'मनोज', 'सचिन',
  'नितीन', 'अनिल', 'तुषार', 'आकाश', 'योगेश', 'हर्षद', 'सागर', 'पंकज',
  'किशोर', 'जयेश', 'प्रवीण', 'भरत', 'मिलिंद', 'संजय', 'अशोक', 'नरेश',
  'सतीश', 'कमलेश', 'देवेंद्र', 'धनंजय', 'ओमकार', 'शुभम', 'आदित्य', 'रोहन',
  'सोहम', 'वैभव', 'अभिजीत', 'सुमित', 'प्रतीक', 'निखिल', 'अमोल', 'विनोद',
  'गोकुळ', 'हेमंत',
];

const femaleFirstNames = [
  'प्रिया', 'सोनाली', 'मानसी', 'स्वाती', 'पूजा', 'कोमल', 'रश्मी', 'श्रुती',
  'वैशाली', 'सुनिता', 'अनिता', 'रेखा', 'ज्योती', 'माधवी', 'अर्चना', 'स्नेहा',
  'प्रतिभा', 'सुप्रिया', 'निकिता', 'साक्षी', 'अश्विनी', 'मेघा', 'काजल', 'रूपाली',
  'हर्षदा', 'पल्लवी', 'सविता', 'ममता', 'रंजना', 'वर्षा', 'शीतल', 'कविता',
  'दीपाली', 'भाग्यश्री', 'गौरी', 'अनुष्का', 'राधिका', 'नंदिनी', 'अमृता', 'सीमा',
  'आरती', 'योगिता', 'माया', 'कल्पना', 'गीता', 'सरिता', 'शोभा', 'उषा',
  'लता', 'विद्या',
];

const lastNames = [
  'वाघमारे', 'भोईर', 'पाटील', 'ठाकूर', 'कोळी', 'गावडे', 'वाळके', 'मुरुड',
  'खांडवी', 'डोंगरे', 'भगत', 'तारे', 'चव्हाण', 'पवार', 'जाधव', 'शिंदे',
  'सोनार', 'ढोलकर', 'काटकर', 'राऊत', 'गोंड', 'माने', 'बागुल', 'निकम',
  'गायकवाड', 'कांबळे', 'सुर्वे', 'पाटणकर', 'मोकाशी', 'धनगर', 'वारली',
  'बारसे', 'मुंडे', 'थोरात', 'देशमुख', 'कदम', 'साळवे', 'वाघ', 'गर्जे', 'भिल',
];

const parentFirstNamesMale = [
  'रामदास', 'शंकर', 'बाबूराव', 'दत्तात्रय', 'मारुती', 'पांडुरंग', 'विठ्ठल',
  'नामदेव', 'तुकाराम', 'सदाशिव', 'दामोदर', 'वसंत', 'हरिभाऊ', 'गोविंद',
  'बालाजी', 'केशव', 'ज्ञानेश्वर', 'भिमराव', 'रघुनाथ', 'सोपान',
];

const parentFirstNamesFemale = [
  'सरस्वती', 'लक्ष्मी', 'गंगाबाई', 'कमला', 'शकुंतला', 'इंदिरा', 'सुलोचना',
  'मंगला', 'जिजाबाई', 'यशोदा', 'भागीरथी', 'अनुसूया', 'पार्वती', 'सावित्री',
  'द्रौपदी', 'रुक्मिणी', 'तारा', 'सुमित्रा', 'कौसल्या', 'मीना',
];

const tribalSubcastes: CasteCategory[] = ['ST', 'ST', 'ST', 'ST'];
const tribalTags = ['Katkari', 'Thakar', 'Mahadev Koli', 'Gond'];

const standards: Standard[] = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th', '11th', '12th'];
const statuses: StudentStatus[] = ['Submitted', 'Verified', 'Approved', 'Enrolled'];

// ============================================================
// Utility functions
// ============================================================

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

const rand = seededRandom(42);

function pick<T>(arr: T[]): T {
  return arr[Math.floor(rand() * arr.length)];
}

function uuid(index: number): string {
  const hex = index.toString(16).padStart(8, '0');
  return `${hex}-0000-4000-8000-${(index * 7 + 1000).toString(16).padStart(12, '0')}`;
}

function generateMobile(): string {
  const prefixes = ['70', '72', '73', '74', '76', '77', '78', '80', '81', '82', '83', '84', '85', '86', '87', '88', '89', '90', '91', '92', '93', '94', '95', '96', '97', '98', '99'];
  const prefix = pick(prefixes);
  let rest = '';
  for (let i = 0; i < 8; i++) {
    rest += Math.floor(rand() * 10).toString();
  }
  return prefix + rest;
}

function generateDate(yearStart: number, yearEnd: number): string {
  const year = yearStart + Math.floor(rand() * (yearEnd - yearStart));
  const month = 1 + Math.floor(rand() * 12);
  const day = 1 + Math.floor(rand() * 28);
  return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
}

// ============================================================
// Generate 520 Students
// ============================================================

function generateStudents(): Student[] {
  const students: Student[] = [];
  const studentsPerStandard = [48, 48, 46, 46, 44, 44, 44, 44, 40, 40, 38, 38];
  let studentIndex = 0;

  for (let stdIdx = 0; stdIdx < 12; stdIdx++) {
    const std = standards[stdIdx];
    const count = studentsPerStandard[stdIdx];

    for (let i = 0; i < count; i++) {
      studentIndex++;
      const gender: 'Male' | 'Female' = rand() > 0.5 ? 'Male' : 'Female';
      const firstName = gender === 'Male' ? pick(maleFirstNames) : pick(femaleFirstNames);
      const lastName = pick(lastNames);
      const parentFirst = gender === 'Male' ? pick(parentFirstNamesMale) : pick(parentFirstNamesFemale);

      const tribalIdx = Math.floor(rand() * 4);
      const wing: HostelWing | undefined = (() => {
        if (gender === 'Male') return rand() > 0.5 ? 'Boys A' : 'Boys B';
        return rand() > 0.5 ? 'Girls A' : 'Girls B';
      })();

      const stream = (std === '11th' || std === '12th') ? (rand() > 0.5 ? 'Arts' as const : 'Science' as const) : undefined;

      students.push({
        id: uuid(studentIndex),
        application_no: `ASP-2024-${studentIndex.toString().padStart(4, '0')}`,
        full_name: `${firstName} ${parentFirst} ${lastName}`,
        standard: std,
        stream,
        caste_category: tribalSubcastes[tribalIdx],
        aadhaar_verified: rand() > 0.3,
        mobile_number: generateMobile(),
        parent_name: `${parentFirst} ${lastName}`,
        status: pick(statuses),
        created_at: generateDate(2023, 2025) + 'T' + `${Math.floor(rand() * 24).toString().padStart(2, '0')}:${Math.floor(rand() * 60).toString().padStart(2, '0')}:00.000Z`,
        gender,
        hostel_wing: wing,
        bed_number: studentIndex,
      });
    }
  }
  return students;
}

// ============================================================
// Generate 42 Staff Members
// ============================================================

const teacherSubjects = [
  'Mathematics', 'Science', 'English', 'Marathi', 'Hindi', 'Social Science',
  'Geography', 'History', 'Biology', 'Physics', 'Chemistry', 'Physical Education',
  'Computer Science', 'Art', 'Music',
];

const teacherSubjectsMarathi = [
  'गणित', 'विज्ञान', 'इंग्रजी', 'मराठी', 'हिंदी', 'सामाजिक शास्त्र',
  'भूगोल', 'इतिहास', 'जीवशास्त्र', 'भौतिकशास्त्र', 'रसायनशास्त्र', 'शारीरिक शिक्षण',
  'संगणक शास्त्र', 'कला', 'संगीत',
];

function generateStaff(): Staff[] {
  const staff: Staff[] = [];
  let staffIdx = 0;

  // Principal
  staffIdx++;
  staff.push({
    id: uuid(1000 + staffIdx),
    full_name: 'डॉ. सुरेश रामचंद्र पाटील',
    designation: 'Principal',
    designation_marathi: 'मुख्याध्यापक',
    department: 'Administration',
    mobile_number: generateMobile(),
    email: 'principal@ashramshalapathraj.edu.in',
    joining_date: '2015-06-01',
    role: 'principal',
  });

  // 22 Teachers
  for (let i = 0; i < 22; i++) {
    staffIdx++;
    const gender = rand() > 0.5 ? 'Male' : 'Female';
    const firstName = gender === 'Male' ? pick(maleFirstNames) : pick(femaleFirstNames);
    const lastName = pick(lastNames);
    const subjectIdx = i % teacherSubjects.length;
    staff.push({
      id: uuid(1000 + staffIdx),
      full_name: `${firstName} ${lastName}`,
      designation: `Teacher - ${teacherSubjects[subjectIdx]}`,
      designation_marathi: `शिक्षक - ${teacherSubjectsMarathi[subjectIdx]}`,
      department: teacherSubjects[subjectIdx],
      mobile_number: generateMobile(),
      email: `teacher${i + 1}@ashramshalapathraj.edu.in`,
      joining_date: generateDate(2010, 2023),
      role: 'teacher',
    });
  }

  // 2 Lipik Clerks
  for (let i = 0; i < 2; i++) {
    staffIdx++;
    const firstName = pick(rand() > 0.5 ? maleFirstNames : femaleFirstNames);
    const lastName = pick(lastNames);
    staff.push({
      id: uuid(1000 + staffIdx),
      full_name: `${firstName} ${lastName}`,
      designation: 'Lipik (Clerk)',
      designation_marathi: 'लिपिक',
      department: 'Administration',
      mobile_number: generateMobile(),
      email: `clerk${i + 1}@ashramshalapathraj.edu.in`,
      joining_date: generateDate(2012, 2022),
      role: 'clerk',
    });
  }

  // 3 Hostel Rectors
  const rectorWings = ['Boys Wing A & B', 'Girls Wing A', 'Girls Wing B'];
  for (let i = 0; i < 3; i++) {
    staffIdx++;
    const gender = i === 0 ? 'Male' : 'Female';
    const firstName = gender === 'Male' ? pick(maleFirstNames) : pick(femaleFirstNames);
    const lastName = pick(lastNames);
    staff.push({
      id: uuid(1000 + staffIdx),
      full_name: `${firstName} ${lastName}`,
      designation: `Hostel Rector - ${rectorWings[i]}`,
      designation_marathi: `वसतिगृह रेक्टर - ${rectorWings[i]}`,
      department: 'Hostel',
      mobile_number: generateMobile(),
      joining_date: generateDate(2014, 2022),
      role: 'rector',
    });
  }

  // 6 Support/Mess Staff
  const supportRoles = [
    { en: 'Head Cook', mr: 'मुख्य स्वयंपाकी' },
    { en: 'Assistant Cook', mr: 'सहाय्यक स्वयंपाकी' },
    { en: 'Mess Helper', mr: 'भोजनालय सहाय्यक' },
    { en: 'Security Guard', mr: 'सुरक्षा रक्षक' },
    { en: 'Peon', mr: 'शिपाई' },
    { en: 'Sweeper', mr: 'सफाई कर्मचारी' },
  ];
  for (let i = 0; i < 6; i++) {
    staffIdx++;
    const firstName = pick(rand() > 0.5 ? maleFirstNames : femaleFirstNames);
    const lastName = pick(lastNames);
    staff.push({
      id: uuid(1000 + staffIdx),
      full_name: `${firstName} ${lastName}`,
      designation: supportRoles[i].en,
      designation_marathi: supportRoles[i].mr,
      department: i < 3 ? 'Mess' : 'Support',
      mobile_number: generateMobile(),
      joining_date: generateDate(2016, 2023),
      role: i < 3 ? 'mess_staff' : 'support',
    });
  }

  // 7 additional support staff to reach 42
  const extraRoles = [
    { en: 'Gardener', mr: 'माळी' },
    { en: 'Driver', mr: 'चालक' },
    { en: 'Lab Assistant', mr: 'प्रयोगशाळा सहाय्यक' },
    { en: 'Library Assistant', mr: 'ग्रंथालय सहाय्यक' },
    { en: 'Electrician', mr: 'विद्युत तंत्रज्ञ' },
    { en: 'Plumber', mr: 'नळ कारागीर' },
    { en: 'Watchman', mr: 'चौकीदार' },
  ];
  for (let i = 0; i < 7; i++) {
    staffIdx++;
    const firstName = pick(rand() > 0.5 ? maleFirstNames : femaleFirstNames);
    const lastName = pick(lastNames);
    staff.push({
      id: uuid(1000 + staffIdx),
      full_name: `${firstName} ${lastName}`,
      designation: extraRoles[i].en,
      designation_marathi: extraRoles[i].mr,
      department: 'Support',
      mobile_number: generateMobile(),
      joining_date: generateDate(2015, 2024),
      role: 'support',
    });
  }

  return staff;
}

// ============================================================
// Generate Hostel Rooms (520 beds across 4 wings)
// ============================================================

function generateHostelRooms(): HostelRoom[] {
  const rooms: HostelRoom[] = [];
  const wings: HostelWing[] = ['Boys A', 'Boys B', 'Girls A', 'Girls B'];
  const bedsPerWing = 130; // 130 * 4 = 520
  const roomCapacity = 10;
  const roomsPerWing = Math.ceil(bedsPerWing / roomCapacity);
  let roomIdx = 0;

  for (const wing of wings) {
    for (let r = 0; r < roomsPerWing; r++) {
      roomIdx++;
      const capacity = r === roomsPerWing - 1 ? bedsPerWing - (roomsPerWing - 1) * roomCapacity : roomCapacity;
      const occupied = Math.floor(rand() * (capacity + 1));
      rooms.push({
        id: uuid(2000 + roomIdx),
        wing,
        room_number: `${wing.replace(' ', '')}-${(r + 1).toString().padStart(2, '0')}`,
        capacity,
        occupied,
      });
    }
  }
  return rooms;
}

// ============================================================
// Generate Hostel Beds
// ============================================================

function generateHostelBeds(rooms: HostelRoom[], students: Student[]): HostelBed[] {
  const beds: HostelBed[] = [];
  let bedIdx = 0;
  const studentsByWing: Record<string, Student[]> = {
    'Boys A': [],
    'Boys B': [],
    'Girls A': [],
    'Girls B': [],
  };

  for (const s of students) {
    if (s.hostel_wing) {
      studentsByWing[s.hostel_wing].push(s);
    }
  }

  for (const room of rooms) {
    const wingStudents = studentsByWing[room.wing];
    for (let b = 1; b <= room.capacity; b++) {
      bedIdx++;
      const student = wingStudents.shift();
      beds.push({
        id: uuid(5000 + bedIdx),
        room_id: room.id,
        bed_number: b,
        student_id: student?.id,
        status: student ? 'occupied' : (rand() > 0.9 ? 'maintenance' : 'vacant'),
      });
    }
  }
  return beds;
}

// ============================================================
// Generate Mess Records (recent 7 days)
// ============================================================

function generateMessRecords(students: Student[]): MessRecord[] {
  const records: MessRecord[] = [];
  const meals: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack'];
  let recordIdx = 0;

  // Generate records for last 3 days for a subset of students
  for (let day = 0; day < 3; day++) {
    const date = new Date();
    date.setDate(date.getDate() - day);
    const dateStr = date.toISOString().split('T')[0];

    // Random subset of students for each meal
    for (const meal of meals) {
      const mealStudents = students.filter(() => rand() > 0.7).slice(0, 80);
      for (const student of mealStudents) {
        recordIdx++;
        const hours = meal === 'breakfast' ? 7 : meal === 'lunch' ? 12 : meal === 'dinner' ? 19 : 16;
        records.push({
          id: uuid(3000 + recordIdx),
          student_id: student.id,
          student_name: student.full_name,
          meal_type: meal,
          date: dateStr,
          verified: rand() > 0.1,
          timestamp: `${dateStr}T${hours.toString().padStart(2, '0')}:${Math.floor(rand() * 60).toString().padStart(2, '0')}:00.000Z`,
        });
      }
    }
  }
  return records;
}

// ============================================================
// Generate WhatsApp Logs
// ============================================================

function generateWhatsAppLogs(students: Student[]): WhatsAppLog[] {
  const logs: WhatsAppLog[] = [];
  const messageTypes: WhatsAppMessageType[] = ['attendance', 'fee_reminder', 'event', 'emergency', 'general'];
  const messageStatuses: WhatsAppMessageStatus[] = ['sent', 'delivered', 'read', 'failed'];
  const messagePreviews: Record<WhatsAppMessageType, string[]> = {
    attendance: [
      'Your ward was absent today. Please contact school.',
      'Attendance alert: 3 consecutive absences noted.',
      'Monthly attendance report attached.',
    ],
    fee_reminder: [
      'Fee payment due by 15th. Please pay at office.',
      'Scholarship disbursement processed.',
      'Hostel fee receipt generated.',
    ],
    event: [
      'Annual Sports Day on 15th Jan. All parents welcome.',
      'PTM scheduled for Saturday 10 AM.',
      'Republic Day celebration - students required.',
    ],
    emergency: [
      'School closed tomorrow due to heavy rain alert.',
      'Bus route changed. New pickup point: Village Chowk.',
      'Emergency drill conducted successfully.',
    ],
    general: [
      'Exam timetable shared. Check notice board.',
      'New uniform distribution on Monday.',
      'Holiday announcement: Diwali vacation 1-5 Nov.',
    ],
  };

  let logIdx = 0;
  const selectedStudents = students.slice(0, 50);

  for (const student of selectedStudents) {
    const msgCount = 1 + Math.floor(rand() * 3);
    for (let m = 0; m < msgCount; m++) {
      logIdx++;
      const msgType = pick(messageTypes);
      const date = new Date();
      date.setDate(date.getDate() - Math.floor(rand() * 30));
      logs.push({
        id: uuid(4000 + logIdx),
        recipient_number: student.mobile_number,
        recipient_name: student.parent_name,
        message_type: msgType,
        message_preview: pick(messagePreviews[msgType]),
        status: pick(messageStatuses),
        sent_at: date.toISOString(),
      });
    }
  }
  return logs;
}

// ============================================================
// Export generated data
// ============================================================

export const students: Student[] = generateStudents();
export const staff: Staff[] = generateStaff();
export const hostelRooms: HostelRoom[] = generateHostelRooms();
export const hostelBeds: HostelBed[] = generateHostelBeds(hostelRooms, students);
export const messRecords: MessRecord[] = generateMessRecords(students);
export const whatsAppLogs: WhatsAppLog[] = generateWhatsAppLogs(students);

// Utility: tribal tag lookup (appended as metadata)
export const tribalTagMap: Record<string, string> = {};
students.forEach((s, idx) => {
  tribalTagMap[s.id] = tribalTags[idx % tribalTags.length];
});
