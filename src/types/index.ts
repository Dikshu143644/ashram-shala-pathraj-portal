export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export type StudentStatus = 'Submitted' | 'Verified' | 'Approved' | 'Enrolled' | 'Rejected';

export type Role = 'principal' | 'teacher' | 'clerk' | 'rector' | 'support' | 'mess_staff';

export type CasteCategory = 'ST' | 'SC' | 'OBC' | 'NT' | 'SBC' | 'General';

export type Standard = '1st' | '2nd' | '3rd' | '4th' | '5th' | '6th' | '7th' | '8th' | '9th' | '10th' | '11th' | '12th';

export type HostelWing = 'Boys A' | 'Boys B' | 'Girls A' | 'Girls B';

export type BedStatus = 'occupied' | 'vacant' | 'maintenance';

export type WhatsAppMessageStatus = 'sent' | 'delivered' | 'read' | 'failed';

export type WhatsAppMessageType = 'attendance' | 'fee_reminder' | 'event' | 'emergency' | 'general';

export interface Student {
  id: string;
  application_no: string;
  full_name: string;
  standard: Standard;
  stream?: 'Arts' | 'Science';
  caste_category: CasteCategory;
  aadhaar_verified: boolean;
  mobile_number: string;
  parent_name: string;
  status: StudentStatus;
  created_at: string;
  gender: 'Male' | 'Female';
  hostel_wing?: HostelWing;
  bed_number?: number;
}

export interface Staff {
  id: string;
  full_name: string;
  designation: string;
  designation_marathi: string;
  department: string;
  mobile_number: string;
  email?: string;
  joining_date: string;
  role: Role;
}

export interface HostelRoom {
  id: string;
  wing: HostelWing;
  room_number: string;
  capacity: number;
  occupied: number;
}

export interface HostelBed {
  id: string;
  room_id: string;
  bed_number: number;
  student_id?: string;
  status: BedStatus;
}

export interface MessRecord {
  id: string;
  student_id: string;
  student_name: string;
  meal_type: MealType;
  date: string;
  verified: boolean;
  timestamp: string;
}

export interface WhatsAppLog {
  id: string;
  recipient_number: string;
  recipient_name: string;
  message_type: WhatsAppMessageType;
  message_preview: string;
  status: WhatsAppMessageStatus;
  sent_at: string;
}
