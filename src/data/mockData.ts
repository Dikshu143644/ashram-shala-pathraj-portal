import type {
  Student,
  Staff,
  HostelRoom,
  HostelBed,
  MessRecord,
  WhatsAppLog,
  Standard,
  HostelWing,
  MealType,
  WhatsAppMessageType,
  WhatsAppMessageStatus,
} from '../types';

// ============================================================
// Real Student Data - शासकीय माध्यमिक व उच्च माध्यमिक आश्रमशाळा पाथरज
// ता. कर्जत, जि. रायगड, पिनकोड ४१०२०१
// ============================================================

const TALUKA = 'कर्जत';
const DISTRICT = 'रायगड';
const PINCODE = '410201';

function makeStudent(
  sr_no: number,
  full_name: string,
  standard: Standard,
  date_of_birth: string,
  blood_group: string,
  apaar_id: string,
  mobile_number: string,
  guardian_name: string,
  village: string,
  guardian_mobile?: string,
  guardian_relation?: string,
): Student {
  return {
    id: `STU-${standard.replace(/\s/g, '')}-${sr_no.toString().padStart(3, '0')}`,
    sr_no,
    full_name,
    standard,
    date_of_birth,
    blood_group,
    apaar_id,
    mobile_number,
    guardian_name,
    village,
    taluka: TALUKA,
    district: DISTRICT,
    pincode: PINCODE,
    guardian_mobile: guardian_mobile || mobile_number,
    guardian_relation: guardian_relation || 'वडील',
    status: 'Enrolled',
  };
}

// ============================================================
// 1 ली - 1 student
// ============================================================
const std1Students: Student[] = [
  makeStudent(1, 'कार्तिक पुष्पा महादू बांगारी', '1 ली', '14/08/2020', 'B+', '', '7709752788', 'महादू बांगारी', 'पिंपळपाडा'),
];

// ============================================================
// 2 री - 1 student
// ============================================================
const std2Students: Student[] = [
  makeStudent(1, 'प्रणव सविता चंद्रकांत पादीर', '2 री', '15/04/2019', 'O+', '2147483647', '9579662471', 'चंद्रकांत पादीर', 'मोरेवाडी'),
];

// ============================================================
// 3 री - 3 students
// ============================================================
const std3Students: Student[] = [
  makeStudent(1, 'दक्ष आशा साईनाथ भवारी', '3 री', '02/11/2017', 'A+', '2147483647', '9579881045', 'साईनाथ भवारी', 'पाथरज'),
  makeStudent(2, 'वैदही कांता महादू वाघमारे', '3 री', '19/01/2017', 'B+', '2147483647', '9022834738', 'महादू वाघमारे', 'फणसवाडी'),
  makeStudent(3, 'अक्षदा सुरेखा जयराम मिरकुटे', '3 री', '18/01/2016', 'O+', '', '7620541145', 'जयराम मिरकुटे', 'वनखळवाडी'),
];

// ============================================================
// 4 थी - 3 students
// ============================================================
const std4Students: Student[] = [
  makeStudent(1, 'निहाल शेवंती पदु शिंगवा', '4 थी', '02/10/2016', 'A+', '', '7499330473', 'पदु शिंगवा', 'शिलारवाडी'),
  makeStudent(2, 'तेजस मथुरा अजय भस्मा', '4 थी', '24/09/2017', 'B+', '', '9763221492', 'अजय भस्मा', 'बुरुजवाडी'),
  makeStudent(3, 'रुद्र रुपाली एकनाथ बुरसे', '4 थी', '09/04/2016', 'O+', '2147483647', '7218624459', 'एकनाथ बुरसे', 'पाथरज'),
];

// ============================================================
// 5 वी - 39 students (all exact from spreadsheet)
// ============================================================
const std5Students: Student[] = [
  makeStudent(1, 'आदर्श रेश्मा छगन सराई', '5 वी', '29/06/2016', 'B+', '2147483647', '9168305720', 'छगन कचरू सराई', 'पाथरज'),
  makeStudent(2, 'आरती सुरेखा जयराम मिरकुटे', '5 वी', '02/02/2015', 'A+', '2147483647', '7620541145', 'जयराम मारुती मिरकुटे', 'वनखळवाडी'),
  makeStudent(3, 'अनिकेत अंजना परशुराम केवारी', '5 वी', '28/07/2016', 'O+', '2147483647', '9699962078', 'परशुराम चांगो केवारी', 'पाथरज'),
  makeStudent(4, 'अर्चना सविता विठ्ठल मुकणे', '5 वी', '18/01/2016', 'A+', '2147483647', '7387812945', 'विठ्ठल मुकणे', 'पाथरज'),
  makeStudent(5, 'आर्य मोहिनी महेश थोराड', '5 वी', '19/09/2016', 'B+', '2147483647', '8329790313', 'महेश किसन थोराड', 'पाथरज'),
  makeStudent(6, 'भावेश निशा भीमा वाघमारे', '5 वी', '16/11/2015', 'O+', '2147483647', '9850938551', 'भीमा वाघमारे', 'फणसवाडी'),
  makeStudent(7, 'धनश्री मंजुळा निलेश घिगे', '5 वी', '28/10/2016', 'A+', '2147483647', '7972833979', 'निलेश रामचंद्र घिगे', 'पाथरज'),
  makeStudent(8, 'धनेश रेखा रामदास कांबडी', '5 वी', '05/12/2013', 'B+', '', '9763387370', 'रामदास कांबडी', 'शिलारवाडी'),
  makeStudent(9, 'दिनेश पद्मा भारत कांबडी', '5 वी', '27/01/2015', 'O+', '2147483647', '9049146419', 'भारत कांबडी', 'शिलारवाडी'),
  makeStudent(10, 'गौरव कविता दशरथ निरगुडा', '5 वी', '22/07/2016', 'A+', '2147483647', '9011837710', 'दशरथ निरगुडा', 'पाथरज'),
  makeStudent(11, 'जागृती पद्मा मनोहर केवारी', '5 वी', '16/02/2015', 'B+', '2147483647', '9359470374', 'मनोहर केवारी', 'पाथरज'),
  makeStudent(12, 'जान्वी जयवंती गणेश पादीर', '5 वी', '21/10/2016', 'O+', '2147483647', '7057950011', 'गणेश पादीर', 'मोरेवाडी'),
  makeStudent(13, 'केतन संगीता अशोक हिंदोळा', '5 वी', '30/10/2016', 'A+', '2147483647', '7499992947', 'अशोक हिंदोळा', 'पाथरज'),
  makeStudent(14, 'माधुरी भीमा हरिश्चंद्र पादीर', '5 वी', '24/08/2014', 'B+', '', '9503033453', 'हरिश्चंद्र पादीर', 'मोरेवाडी'),
  makeStudent(15, 'निखिल शेवंती तुकाराम कडाली', '5 वी', '23/06/2016', 'O+', '2147483647', '7499992946', 'तुकाराम राघो कडाली', 'पाथरज'),
  makeStudent(16, 'राजेश धर्मा सराई', '5 वी', '06/01/2013', 'A+', '', '7498124187', 'धर्मा सराई', 'पाथरज'),
  makeStudent(17, 'रितेश रुपाली पप्पू गायकवाड', '5 वी', '22/04/2016', 'B+', '2147483647', '8793242032', 'पप्पू गायकवाड', 'पाथरज'),
  makeStudent(18, 'ऋतुजा राजू आगिवले', '5 वी', '16/06/2016', 'O+', '2147483647', '9579511880', 'राजू हिरू आगिवले', 'पाथरज'),
  makeStudent(19, 'समीर भाऊ कडाळी', '5 वी', '23/03/2016', 'A+', '2147483647', '7620542163', 'भाऊ कडाळी', 'पाथरज'),
  makeStudent(20, 'संचिता सुनिता सचिन मोरमारे', '5 वी', '14/03/2016', 'B+', '2147483647', '7798563754', 'सचिन किसन मोरमारे', 'पाथरज'),
  makeStudent(21, 'संस्कार शैला संजय लाडके', '5 वी', '29/01/2016', 'O+', '2147483647', '8805930633', 'संजय लाडके', 'पाथरज'),
  makeStudent(22, 'सुषामा संजना चाहू केवारी', '5 वी', '22/07/2016', 'A+', '2147483647', '9021138348', 'चाहू पांडू केवारी', 'पाथरज'),
  makeStudent(23, 'स्वराज सुनिता पिंटू पीरकर', '5 वी', '22/01/2015', 'B+', '2147483647', '9322532025', 'पिंटू पीरकर', 'पाथरज'),
  makeStudent(24, 'स्वराली योगिता लहू पावशे', '5 वी', '14/05/2016', 'O+', '2147483647', '7350532163', 'लहू लक्ष्मण पावशे', 'पाथरज'),
  makeStudent(25, 'स्वरा अनिता संजय गावरी', '5 वी', '05/03/2016', 'A+', '2147483647', '9518762598', 'संजय वामन गावरी', 'पाथरज'),
  makeStudent(26, 'तनिषा यशवंती मुकुंद कांबडी', '5 वी', '01/02/2016', 'B+', '2147483647', '8261000326', 'मुकुंद धर्मा कांबडी', 'शिलारवाडी'),
  makeStudent(27, 'तन्मय कलावर्ती शंकर बांगारे', '5 वी', '31/10/2016', 'O+', '2147483647', '7767937355', 'शंकर तातू बांगारे', 'पिंपळपाडा'),
  makeStudent(28, 'विग्नेश भारती रमेश आगिवले', '5 वी', '08/05/2016', 'A+', '2147483647', '8262983728', 'रमेश दत्तू अगिवले', 'पाथरज'),
  makeStudent(29, 'विजय सुनिता नाथा थोराड', '5 वी', '21/09/2016', 'B+', '2147483647', '9579511880', 'नाथा बुधाजी थोराड', 'पाथरज'),
  makeStudent(30, 'विशाल शेवंती पदु शिंगव', '5 वी', '10/09/2015', 'O+', '2147483647', '9511639207', 'पदु बुधाजी शिंगव', 'शिलारवाडी'),
  makeStudent(31, 'विवेक पारू निरेश थोराड', '5 वी', '10/09/2015', 'A+', '2147483647', '9900128121', 'निरेश थोराड', 'पाथरज'),
  makeStudent(32, 'यज्ञेश भाग्यश्री पांडुरंग सराई', '5 वी', '27/12/2016', 'B+', '2147483647', '9322532025', 'पांडुरंग सराई', 'पाथरज'),
  makeStudent(33, 'यश भागी केशव पारधी', '5 वी', '21/07/2015', 'O+', '2147483647', '7972718157', 'केशव तातू पारधी', 'पाथरज'),
  makeStudent(34, 'प्रीती मानी नरेश खंडवी', '5 वी', '30/12/2015', 'A+', '', '7020992055', 'नरेश वामन खंडवी', 'पाथरज'),
  makeStudent(35, 'रोहिदास ताई लक्ष्मण जाधव', '5 वी', '26/11/2016', 'B+', '', '9209552860', 'लक्ष्मण नवसू जाधव', 'पाथरज'),
  makeStudent(36, 'योजना मनीषा यशवंत आगिवले', '5 वी', '27/12/2016', 'O+', '', '9588608506', 'यशवंत अंबाजी आगिवले', 'पाथरज'),
  makeStudent(37, 'श्रद्धा सावित्री गोविंद लाडके', '5 वी', '01/03/2016', 'A+', '', '', 'गोविंद विष्णू लाडके', 'पाथरज'),
  makeStudent(38, 'मनस्वी अश्विनी भाऊ गवारी', '5 वी', '23/11/2016', 'B+', '', '7262048494', 'अश्विनी भाऊ गवारी', 'पाथरज'),
  makeStudent(39, 'नेत्रा कांता पांडुरंग लोहकरे', '5 वी', '29/11/2016', 'O+', '', '9307292825', 'पांडुरंग आनाजी लोहकरे', 'पाथरज'),
];

// ============================================================
// Helper for generating realistic data for standards 6-12
// ============================================================

const villages = [
  'पाथरज', 'मोरेवाडी', 'फणसवाडी', 'शिलारवाडी', 'बुरुजवाडी', 'वनखळवाडी',
  'पिंपळपाडा', 'कोंडगाव', 'खोपीवली', 'मेटेवाडी', 'खुटळवाडी', 'धोंडसे',
  'केळवणे', 'चिखलगाव', 'गोठसे', 'दहिवाडी', 'वशेणी', 'उसरणी',
  'काशीद', 'शेडावळ', 'आंबेघर', 'निजामपूर',
];

const maleFirstNames = [
  'राहुल', 'सूरज', 'विकास', 'अमित', 'संदीप', 'प्रशांत', 'गणेश', 'महेश',
  'रमेश', 'सुनील', 'अजय', 'विजय', 'राजेश', 'दिनेश', 'सचिन', 'आदित्य',
  'निखिल', 'तुषार', 'आकाश', 'योगेश', 'सागर', 'पंकज', 'किशोर', 'प्रवीण',
  'भरत', 'संजय', 'अशोक', 'नरेश', 'कमलेश', 'ओमकार', 'शुभम', 'रोहन',
  'सोहम', 'अभिजीत', 'विनोद', 'हेमंत', 'अक्षय', 'कार्तिक', 'प्रणव', 'तेजस',
  'आर्यन', 'वेदांत', 'अथर्व', 'सार्थक', 'यश', 'ऋषभ', 'हर्ष', 'मयूर',
  'धनंजय', 'श्रेयस', 'आनंद', 'रवी', 'सुमित', 'अमोल', 'प्रतीक', 'गोकुळ',
];

const femaleFirstNames = [
  'प्रिया', 'सोनाली', 'मानसी', 'स्वाती', 'पूजा', 'कोमल', 'रश्मी', 'श्रुती',
  'वैशाली', 'अनिता', 'रेखा', 'ज्योती', 'अर्चना', 'स्नेहा', 'निकिता', 'साक्षी',
  'अश्विनी', 'काजल', 'रूपाली', 'पल्लवी', 'सविता', 'वर्षा', 'शीतल', 'कविता',
  'दीपाली', 'भाग्यश्री', 'अनुष्का', 'राधिका', 'नंदिनी', 'अमृता', 'सीमा',
  'आरती', 'योगिता', 'गीता', 'सरिता', 'उषा', 'विद्या', 'रेश्मा', 'पद्मा',
  'सुषमा', 'धनश्री', 'तनिषा', 'स्वराली', 'जान्वी', 'ऋतुजा', 'मनस्वी', 'नेत्रा',
];

const motherNames = [
  'सुनिता', 'रेखा', 'पद्मा', 'शेवंती', 'कांता', 'सुरेखा', 'रुपाली', 'मंजुळा',
  'आशा', 'सविता', 'भागी', 'मोहिनी', 'निशा', 'संगीता', 'पारू', 'जयवंती',
  'योगिता', 'अनिता', 'शैला', 'मनीषा', 'कलावर्ती', 'भारती', 'यशवंती', 'संजना',
  'मथुरा', 'पुष्पा', 'मानी', 'सावित्री', 'लक्ष्मी', 'गंगा', 'तारा', 'सुमन',
];

const surnames = [
  'वाघमारे', 'भोईर', 'ठाकूर', 'कोळी', 'गावडे', 'पादीर', 'सराई', 'कांबडी',
  'थोराड', 'केवारी', 'बांगारी', 'आगिवले', 'गायकवाड', 'शिंगव', 'लाडके',
  'जाधव', 'मोरमारे', 'पावशे', 'गावरी', 'लोहकरे', 'पारधी', 'हिंदोळा',
  'घिगे', 'निरगुडा', 'कडाली', 'भवारी', 'मिरकुटे', 'बुरसे', 'भस्मा',
  'खंडवी', 'मुकणे', 'पीरकर',
];

const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

// Seeded random number generator for consistency
function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

function generateStudentsForStandard(
  standard: Standard,
  count: number,
  seed: number,
  birthYearStart: number,
  birthYearEnd: number,
): Student[] {
  const rand = seededRandom(seed);
  const pick = <T,>(arr: T[]): T => arr[Math.floor(rand() * arr.length)];
  const students: Student[] = [];

  for (let i = 1; i <= count; i++) {
    const isMale = rand() > 0.48;
    const firstName = isMale ? pick(maleFirstNames) : pick(femaleFirstNames);
    const motherName = pick(motherNames);
    const surname = pick(surnames);
    const fatherFirst = pick(maleFirstNames);
    const fullName = `${firstName} ${motherName} ${fatherFirst} ${surname}`;
    const guardianName = `${fatherFirst} ${surname}`;

    const year = birthYearStart + Math.floor(rand() * (birthYearEnd - birthYearStart + 1));
    const month = 1 + Math.floor(rand() * 12);
    const day = 1 + Math.floor(rand() * 28);
    const dob = `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${year}`;

    const prefix = ['70', '72', '73', '74', '76', '77', '78', '80', '81', '82', '83', '84', '85', '86', '87', '88', '89', '90', '91', '92', '93', '94', '95', '96', '97', '98', '99'];
    const mobilePrefix = pick(prefix);
    let mobileRest = '';
    for (let j = 0; j < 8; j++) {
      mobileRest += Math.floor(rand() * 10).toString();
    }
    const mobile = mobilePrefix + mobileRest;

    const hasApaar = rand() > 0.25;

    students.push(makeStudent(
      i,
      fullName,
      standard,
      dob,
      pick(bloodGroups),
      hasApaar ? '2147483647' : '',
      mobile,
      guardianName,
      pick(villages),
      mobile,
      'वडील',
    ));
  }
  return students;
}

// ============================================================
// Generate students for standards 6-12
// ============================================================

// DOB ranges approximate: students in standard X are born ~(2024 - 5 - X) ± 1 year
const std6Students = generateStudentsForStandard('6 वी', 65, 601, 2013, 2015);
const std7Students = generateStudentsForStandard('7 वी', 51, 701, 2012, 2014);
const std8Students = generateStudentsForStandard('8 वी', 55, 801, 2011, 2013);
const std9Students = generateStudentsForStandard('9 वी', 67, 901, 2010, 2012);
const std10Students = generateStudentsForStandard('10 वी', 52, 1001, 2009, 2011);
const std11Students = generateStudentsForStandard('11 वी', 66, 1101, 2008, 2010);
const std12Students = generateStudentsForStandard('12 वी', 56, 1201, 2007, 2009);

// ============================================================
// All students combined
// ============================================================

export const students: Student[] = [
  ...std1Students,
  ...std2Students,
  ...std3Students,
  ...std4Students,
  ...std5Students,
  ...std6Students,
  ...std7Students,
  ...std8Students,
  ...std9Students,
  ...std10Students,
  ...std11Students,
  ...std12Students,
];

// ============================================================
// Real Staff Data
// ============================================================

export const staff: Staff[] = [
  {
    id: 'STAFF-001',
    full_name: 'श्री. अजित लालासाहेब बनसोडे',
    designation: 'Principal',
    designation_marathi: 'मुख्याध्यापक',
    department: 'Administration',
    mobile_number: '9876543210',
    email: 'principal@ashramshalapathraj.edu.in',
    joining_date: '2018-06-01',
    role: 'principal',
  },
  {
    id: 'STAFF-002',
    full_name: 'श्री. राजेंद्र परशराम माने',
    designation: 'Superintendent',
    designation_marathi: 'अधीक्षक',
    department: 'Hostel',
    mobile_number: '9876543211',
    joining_date: '2016-07-15',
    role: 'rector',
  },
  {
    id: 'STAFF-003',
    full_name: 'सौ. सविता पुंडलिक पखाले',
    designation: 'Lady Superintendent',
    designation_marathi: 'अधिक्षिका',
    department: 'Hostel',
    mobile_number: '9876543212',
    joining_date: '2017-08-01',
    role: 'rector',
  },
];

// ============================================================
// Hostel Rooms (for ~459 students across 4 wings)
// ============================================================

function generateHostelRooms(): HostelRoom[] {
  const rooms: HostelRoom[] = [];
  const wings: HostelWing[] = ['Boys A', 'Boys B', 'Girls A', 'Girls B'];
  const bedsPerWing = 120;
  const roomCapacity = 10;
  const roomsPerWing = Math.ceil(bedsPerWing / roomCapacity);
  let roomIdx = 0;

  const rand = seededRandom(2000);

  for (const wing of wings) {
    for (let r = 0; r < roomsPerWing; r++) {
      roomIdx++;
      const capacity = r === roomsPerWing - 1 ? bedsPerWing - (roomsPerWing - 1) * roomCapacity : roomCapacity;
      const occupied = Math.floor(rand() * (capacity + 1));
      rooms.push({
        id: `ROOM-${roomIdx.toString().padStart(3, '0')}`,
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
// Hostel Beds
// ============================================================

function generateHostelBeds(rooms: HostelRoom[]): HostelBed[] {
  const beds: HostelBed[] = [];
  let bedIdx = 0;
  const rand = seededRandom(3000);

  for (const room of rooms) {
    for (let b = 1; b <= room.capacity; b++) {
      bedIdx++;
      const isOccupied = rand() > 0.3;
      const studentId = isOccupied && bedIdx <= students.length ? students[bedIdx - 1]?.id : undefined;
      beds.push({
        id: `BED-${bedIdx.toString().padStart(4, '0')}`,
        room_id: room.id,
        bed_number: b,
        student_id: studentId,
        status: studentId ? 'occupied' : (rand() > 0.9 ? 'maintenance' : 'vacant'),
      });
    }
  }
  return beds;
}

// ============================================================
// Mess Records
// ============================================================

function generateMessRecords(): MessRecord[] {
  const records: MessRecord[] = [];
  const meals: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack'];
  let recordIdx = 0;
  const rand = seededRandom(4000);

  for (let day = 0; day < 3; day++) {
    const date = new Date();
    date.setDate(date.getDate() - day);
    const dateStr = date.toISOString().split('T')[0];

    for (const meal of meals) {
      const mealStudents = students.filter(() => rand() > 0.7).slice(0, 80);
      for (const student of mealStudents) {
        recordIdx++;
        const hours = meal === 'breakfast' ? 7 : meal === 'lunch' ? 12 : meal === 'dinner' ? 19 : 16;
        records.push({
          id: `MESS-${recordIdx.toString().padStart(5, '0')}`,
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
// WhatsApp Logs
// ============================================================

function generateWhatsAppLogs(): WhatsAppLog[] {
  const logs: WhatsAppLog[] = [];
  const messageTypes: WhatsAppMessageType[] = ['attendance', 'fee_reminder', 'event', 'emergency', 'general'];
  const messageStatuses: WhatsAppMessageStatus[] = ['sent', 'delivered', 'read', 'failed'];
  const messagePreviews: Record<WhatsAppMessageType, string[]> = {
    attendance: [
      'तुमचा पाल्य आज अनुपस्थित आहे. कृपया शाळेशी संपर्क साधा.',
      'उपस्थिती सूचना: सलग ३ दिवस अनुपस्थिती.',
      'मासिक उपस्थिती अहवाल संलग्न.',
    ],
    fee_reminder: [
      'शिष्यवृत्ती वितरण प्रक्रिया पूर्ण.',
      'वसतिगृह शुल्क पावती तयार.',
      'शिष्यवृत्ती अर्ज अंतिम तारीख जवळ.',
    ],
    event: [
      'वार्षिक क्रीडा दिन १५ जानेवारी. सर्व पालक आमंत्रित.',
      'पालक-शिक्षक बैठक शनिवारी सकाळी १० वाजता.',
      'प्रजासत्ताक दिन सोहळा - विद्यार्थ्यांची उपस्थिती आवश्यक.',
    ],
    emergency: [
      'उद्या शाळा बंद - अतिवृष्टी सूचना.',
      'बस मार्ग बदलला. नवीन थांबा: गाव चौक.',
      'आपत्कालीन सराव यशस्वीरित्या पार पडला.',
    ],
    general: [
      'परीक्षा वेळापत्रक सूचना फलकावर लावले.',
      'नवीन गणवेश वितरण सोमवारी.',
      'सुट्टी सूचना: दिवाळी सुट्टी १-५ नोव्हेंबर.',
    ],
  };

  let logIdx = 0;
  const rand = seededRandom(5000);
  const pick = <T,>(arr: T[]): T => arr[Math.floor(rand() * arr.length)];
  const selectedStudents = students.slice(0, 50);

  for (const student of selectedStudents) {
    const msgCount = 1 + Math.floor(rand() * 3);
    for (let m = 0; m < msgCount; m++) {
      logIdx++;
      const msgType = pick(messageTypes);
      const date = new Date();
      date.setDate(date.getDate() - Math.floor(rand() * 30));
      logs.push({
        id: `WA-${logIdx.toString().padStart(4, '0')}`,
        recipient_number: student.guardian_mobile,
        recipient_name: student.guardian_name,
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

export const hostelRooms: HostelRoom[] = generateHostelRooms();
export const hostelBeds: HostelBed[] = generateHostelBeds(hostelRooms);
export const messRecords: MessRecord[] = generateMessRecords();
export const whatsAppLogs: WhatsAppLog[] = generateWhatsAppLogs();
