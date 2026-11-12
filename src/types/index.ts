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
  upazila?: string;
  photo?: string;
  bloodGroup: BloodGroup;
  age: number;
  occupation: string;
  lastDonationDate?: string;
  hidePersonalInfo: boolean;
  createdAt: string;
  role: "SUPERADMIN" | "ADMIN" | "MANAGER" | "USERROLE";
  isVerified?: boolean;
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
  urgency?: "normal" | "urgent" | "emergency";
  unitsNeeded?: number;
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

// ---------------------------------------------------------------------
// Blood banks
// ---------------------------------------------------------------------

export type BloodBankStatus = "pending" | "approved" | "rejected" | "suspended";
export type BankRole = "admin" | "officer" | "member";
export type MemberStatus = "pending" | "active" | "rejected" | "left" | "removed";

export interface BloodBank {
  id: number;
  name: string;
  description: string;
  division: string;
  district: string;
  upazila: string;
  address: string;
  contactPhone: string;
  logo: string;
  cover: string;
  status: BloodBankStatus;
  adminId: number;
  adminName: string;
  createdBy: number;
  createdByName: string;
  reviewedAt?: string;
  rejectionReason?: string;
  memberCount: number;
  donationCount: number;
  totalPoints: number;
  createdAt: string;
}

export interface BankMember {
  id: number;
  bloodBankId: number;
  userId: number;
  firstName: string;
  lastName: string;
  bloodGroup: string;
  phone?: string;
  upazila: string;
  role: BankRole;
  position: string;
  status: MemberStatus;
  points: number;
  donationCount: number;
  donatedAt?: string;
  photo?: string;
  joinedAt?: string;
  createdAt: string;
}

export interface MyBloodBank {
  membership: BankMember | null;
  bank: BloodBank | null;
  pendingRequest: BloodBank | null;
}

// ---------------------------------------------------------------------
// Gamification
// ---------------------------------------------------------------------

export interface Badge {
  id: number;
  code: string;
  name: string;
  description: string;
  icon: string;
  kind: "milestone" | "periodic" | "special";
  threshold: number;
}

export interface UserBadge extends Badge {
  bloodBankId?: number;
  period?: string;
  awardedAt: string;
}

export interface Level {
  name: "bronze" | "silver" | "gold" | "platinum";
  minPoints: number;
}

export interface PointTransaction {
  id: number;
  points: number;
  reason: "donation" | "first_donation" | "emergency_bonus" | "bank_founder";
  refType?: string;
  refId?: number;
  createdAt: string;
}

export interface GamificationProfile {
  userId: number;
  points: number;
  donationCount: number;
  level: Level;
  nextLevel: Level | null;
  rank: number;
  badges: UserBadge[];
  allBadges: Badge[];
  recent: PointTransaction[];
}

export interface LeaderboardEntry {
  rank: number;
  userId: number;
  firstName: string;
  lastName: string;
  photo?: string;
  bloodGroup: string;
  district: string;
  upazila: string;
  points: number;
  donations: number;
  bloodBankId?: number;
  bloodBankName?: string;
}

export interface InterestedDonor {
  userId: number;
  firstName: string;
  lastName: string;
  bloodGroup: string;
  phone: string;
  photo?: string;
  district: string;
  upazila: string;
  donatedAt?: string;
  points: number;
  donationCount: number;
  bloodBankName?: string;
  eligible: boolean;
  confirmed: boolean;
  interestedAt: string;
}

export interface DonationConfirmation {
  historyId: number;
  donorId: number;
  pointsAwarded: number;
  totalPoints: number;
  newBadges: Badge[];
}

// ---------------------------------------------------------------------
// Chat
// ---------------------------------------------------------------------

export interface ChatUser {
  id: number;
  firstName: string;
  lastName: string;
  photo?: string;
}

export interface ChatMessage {
  id: number;
  conversationId: number;
  senderId: number;
  senderName: string;
  senderPhoto?: string;
  body: string;
  createdAt: string;
  /** Set on optimistic messages until the server echoes them back. */
  clientId?: string;
  pending?: boolean;
  failed?: boolean;
}

export interface Conversation {
  id: number;
  type: "bank" | "direct";
  bloodBankId?: number;
  bloodBankName?: string;
  postId?: number;
  postTitle?: string;
  otherUser?: ChatUser;
  lastMessage: ChatMessage | null;
  unreadCount: number;
  lastMessageAt: string | null;
  createdAt: string;
}

export interface AppNotification {
  kind: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
}

/** Server -> client websocket event. */
export interface SocketEvent {
  type: "message" | "typing" | "read" | "notification" | "error" | "pong";
  conversationId?: number;
  message?: ChatMessage;
  userId?: number;
  messageId?: number;
  clientId?: string;
  notification?: AppNotification;
  error?: string;
}
