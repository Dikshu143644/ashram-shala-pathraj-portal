export const schoolOverview = {
  name_en: 'Shashkeey Madhyamik v Uchh Madhyamik Ashram Shala Pathraj',
  name_mr: 'शासकीय माध्यमिक व उच्च माध्यमिक आश्रमशाळा पाथराज',
  taluka: 'Pathraj',
  district: 'Raigad',
  state: 'Maharashtra',
  department: 'Tribal Development Department (Adivasi Vikas Vibhag)',
  department_mr: 'आदिवासी विकास विभाग',
  established: 1985,
  description_en: `A government residential school under the Tribal Development Department, 
    Maharashtra, providing free education from Standard 1st to 12th (Marathi medium for 1-10, 
    Arts & Science streams for 11-12) to tribal students from Raigad district and surrounding areas.`,
  description_mr: `महाराष्ट्र शासनाच्या आदिवासी विकास विभागांतर्गत चालविली जाणारी शासकीय निवासी शाळा, 
    इयत्ता १ ली ते १२ वी (१ ली ते १० वी मराठी माध्यम + ११ वी-१२ वी कला व विज्ञान शाखा) 
    रायगड जिल्ह्यातील आदिवासी विद्यार्थ्यांना मोफत शिक्षण प्रदान करते.`,
};

export const capacityInfo = {
  total_students: '520-600',
  standards: '1st to 12th',
  medium: 'Marathi (1st-10th), English/Marathi (11th-12th)',
  streams_11_12: ['Arts', 'Science'],
  hostel_capacity: 520,
  hostel_wings: ['Boys Wing A', 'Boys Wing B', 'Girls Wing A', 'Girls Wing B'],
  beds_per_wing: 130,
  staff_strength: '38-45',
  staff_breakdown: {
    principal: 1,
    teachers: 22,
    clerks: 2,
    hostel_rectors: 3,
    support_mess: 6,
    other_support: 7,
  },
};

export const moduleDescriptions = {
  admission_portal: {
    title_en: 'Admission Portal',
    title_mr: 'प्रवेश पोर्टल',
    description: `Handles new student admissions with Aadhaar verification, document upload, 
      tribal certificate validation, and application tracking. Supports status workflow: 
      Submitted > Verified > Approved > Enrolled.`,
    features: [
      'Online application form with Aadhaar integration',
      'Document upload and verification',
      'Tribal caste certificate validation',
      'Application status tracking',
      'Automated SMS/WhatsApp notifications to parents',
      'Bulk approval workflow for administration',
    ],
  },
  class_teacher_portal: {
    title_en: 'Class Teacher Portal',
    title_mr: 'वर्गशिक्षक पोर्टल',
    description: `Daily attendance tracking, student performance overview, 
      and parent communication tools for class teachers.`,
    features: [
      'Daily attendance marking with biometric/manual option',
      'Student performance dashboard',
      'Parent communication via WhatsApp',
      'Homework and assignment tracking',
      'Exam result entry and report card generation',
      'Student behavior notes',
    ],
  },
  hostel_management: {
    title_en: 'Hostel Management',
    title_mr: 'वसतिगृह व्यवस्थापन',
    description: `Manages hostel room/bed allocation, mess attendance, 
      leave tracking, and rector oversight across 4 wings.`,
    features: [
      'Room and bed allocation (4 wings, 520 beds)',
      'Mess attendance tracking (breakfast, lunch, dinner, snack)',
      'Student leave request and approval',
      'Night attendance verification',
      'Maintenance request logging',
      'Wing-wise occupancy dashboard',
    ],
  },
  whatsapp_hub: {
    title_en: 'WhatsApp Communication Hub',
    title_mr: 'व्हॉट्सअॅप संवाद केंद्र',
    description: `Centralized WhatsApp messaging system for parent notifications, 
      attendance alerts, fee reminders, and emergency communications.`,
    features: [
      'Template-based message broadcasting',
      'Automated attendance alerts',
      'Fee reminder scheduling',
      'Event notifications',
      'Emergency broadcast system',
      'Delivery status tracking',
    ],
  },
  clerk_portal: {
    title_en: 'Clerk/Lipik Portal',
    title_mr: 'लिपिक पोर्टल',
    description: `Administrative functions including scholarship processing, 
      GR (Government Resolution) compliance, and report generation.`,
    features: [
      'Scholarship application processing',
      'Student record management',
      'Government report generation (U-DISE, tribal dept)',
      'Fee receipt generation',
      'Staff attendance logging',
      'Inventory management',
    ],
  },
  super_admin: {
    title_en: 'Super Admin Center',
    title_mr: 'सुपर अॅडमिन केंद्र',
    description: `System-wide administration with analytics dashboard, 
      user management, and AI-powered insights.`,
    features: [
      'System-wide analytics dashboard',
      'User role and permission management',
      'Audit trail and activity logs',
      'AI-powered insights and predictions',
      'Data export and backup',
      'Configuration management',
    ],
  },
};

export const roleMatrix = {
  principal: {
    label_en: 'Principal',
    label_mr: 'मुख्याध्यापक',
    access: ['All modules', 'Analytics', 'Staff management', 'Approval authority'],
  },
  teacher: {
    label_en: 'Class Teacher',
    label_mr: 'वर्गशिक्षक',
    access: ['Class Teacher Portal', 'Student records (own class)', 'Attendance', 'WhatsApp (own class)'],
  },
  clerk: {
    label_en: 'Lipik (Clerk)',
    label_mr: 'लिपिक',
    access: ['Clerk Portal', 'Admission data entry', 'Reports', 'Scholarship processing'],
  },
  rector: {
    label_en: 'Hostel Rector',
    label_mr: 'वसतिगृह रेक्टर',
    access: ['Hostel Management', 'Mess records', 'Leave approval', 'Night attendance'],
  },
  support: {
    label_en: 'Support Staff',
    label_mr: 'सहाय्यक कर्मचारी',
    access: ['Limited view', 'Own attendance'],
  },
  mess_staff: {
    label_en: 'Mess Staff',
    label_mr: 'भोजनालय कर्मचारी',
    access: ['Mess attendance marking', 'Menu management'],
  },
};

export const apiEndpoints = {
  students: {
    list: 'GET /api/students',
    detail: 'GET /api/students/:id',
    create: 'POST /api/students',
    update: 'PUT /api/students/:id',
    delete: 'DELETE /api/students/:id',
  },
  staff: {
    list: 'GET /api/staff',
    detail: 'GET /api/staff/:id',
  },
  hostel: {
    rooms: 'GET /api/hostel/rooms',
    beds: 'GET /api/hostel/beds',
    allocate: 'POST /api/hostel/allocate',
  },
  mess: {
    records: 'GET /api/mess/records',
    mark: 'POST /api/mess/mark',
  },
  whatsapp: {
    logs: 'GET /api/whatsapp/logs',
    send: 'POST /api/whatsapp/send',
  },
  ai: {
    chat: 'POST /api/ai-chat',
  },
};
