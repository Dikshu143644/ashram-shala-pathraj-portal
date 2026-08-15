export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export type StudentStatus = 'Enrolled';

export type Role = 'principal' | 'teacher' | 'clerk' | 'rector' | 'support' | 'mess_staff';

export type Standard = '1 ली' | '2 री' | '3 री' | '4 थी' | '5 वी' | '6 वी' | '7 वी' | '8 वी' | '9 वी' | '10 वी' | '11 वी' | '12 वी';

export type HostelWing = 'Boys A' | 'Boys B' | 'Girls A' | 'Girls B';

export type BedStatus = 'occupied' | 'vacant' | 'maintenance';

export type WhatsAppMessageStatus = 'sent' | 'delivered' | 'read' | 'failed';

export type WhatsAppMessageType = 'attendance' | 'fee_reminder' | 'event' | 'emergency' | 'general';

export interface Student {
  id: string;
  sr_no: number;
  full_name: string;
  standard: Standard;
  date_of_birth: string;
  blood_group: string;
  apaar_id: string;
  mobile_number: string;
  guardian_name: string;
  village: string;
  taluka: string;
  district: string;
  pincode: string;
  guardian_mobile: string;
  guardian_relation: string;
  status: StudentStatus;
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
