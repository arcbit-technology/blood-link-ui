export type BloodGroup =
  | "A+"
  | "A-"
  | "B+"
  | "B-"
  | "AB+"
  | "AB-"
  | "O+"
  | "O-";

export type Gender = "male" | "female" | "other";

export type Division =
  | "Dhaka"
  | "Chattogram"
  | "Khulna"
  | "Rajshahi"
  | "Sylhet"
  | "Rangpur"
  | "Barisal"
  | "Mymensingh";

export type RequestStatus = "pending" | "accepted" | "rejected" | "completed";

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  gender: Gender;
  address: string;
  district: string;
  division: Division;
  bloodGroup: BloodGroup;
  age: number;
  occupation: string;
  lastDonationDate?: string;
  hidePersonalInfo: boolean;
  createdAt: string;
  role: "SUPERADMIN" | "ADMIN" | "MANAGER" | "USERROLE";
}

export interface DonationRequest {
  id: string;
  requesterId: string;
  requesterName: string;
  donorId?: string;
  donorName?: string;
  bloodGroup: BloodGroup;
  urgency: "normal" | "urgent" | "emergency";
  hospitalName: string;
  address: string;
  district: string;
  division: Division;
  contactPhone: string;
  patientName: string;
  reason: string;
  unitsNeeded: number;
  requiredDate: string;
  status: RequestStatus;
  isAdminRequest: boolean;
  createdAt: string;
}

export interface DonationPost {
  id: string;
  authorId: string;
  authorName: string;
  bloodGroup: BloodGroup;
  title: string;
  description: string;
  hospitalName: string;
  address: string;
  district: string;
  division: Division;
  requiredDate: string;
  interestedUsers: string[];
  status: "open" | "fulfilled" | "closed";
  createdAt: string;
}

export interface DonationHistory {
  id: string;
  donorId: string;
  donorName: string;
  recipientId: string;
  recipientName: string;
  bloodGroup: BloodGroup;
  donationDate: string;
  hospitalName: string;
  units: number;
}
