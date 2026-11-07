export type KycStatus = "pending" | "verified" | "failed";
export type ParticipantStatus = "pending" | "paid" | "failed" | "flagged";
export type SplitStatus = "active" | "settled" | "disputed";
export type SplitMethod = "equal" | "custom" | "percentage";
export type TransactionStatus = "success" | "failed" | "held";

export interface User {
  id: string;
  name: string;
  phone: string;
  email: string;
  bvn: string;
  kycStatus: KycStatus;
  kycFailReason?: string;
  createdAt: number;
}

export interface Participant {
  userId: string;
  name: string;
  amount: number;
  status: ParticipantStatus;
  paidAt?: number;
  transactionRef?: string;
}

export interface Split {
  id: string;
  title: string;
  description?: string;
  totalAmount: number;
  currency: "NGN";
  createdBy: string;
  splitMethod: SplitMethod;
  participants: Participant[];
  status: SplitStatus;
  createdAt: number;
  settledAt?: number;
}

export interface Transaction {
  id: string;
  splitId: string;
  payerId: string;
  receiverId: string;
  amount: number;
  currency: "NGN";
  status: TransactionStatus;
  failReason?: string;
  amlFlagged: boolean;
  reference: string;
  createdAt: number;
}

export interface AppState {
  users: User[];
  splits: Split[];
  transactions: Transaction[];
  currentUserId: string;
  onboarded: boolean;
}
