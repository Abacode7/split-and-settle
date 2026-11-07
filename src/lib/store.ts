import { AppState, Split, Transaction, User } from "./types";
import { generateId } from "./utils";

const STORAGE_KEY = "split-and-settle";

const SEED_USERS: User[] = [
  {
    id: "user-tunde",
    name: "Tunde Adeyemi",
    phone: "08012345678",
    email: "tunde@example.com",
    bvn: "22233344455",
    kycStatus: "verified",
    createdAt: Date.now() - 86400000 * 7,
  },
  {
    id: "user-amaka",
    name: "Amaka Obi",
    phone: "08098765432",
    email: "amaka@example.com",
    bvn: "33344455566",
    kycStatus: "verified",
    createdAt: Date.now() - 86400000 * 5,
  },
  {
    id: "user-chidi",
    name: "Chidi Nwankwo",
    phone: "08055566677",
    email: "chidi@example.com",
    bvn: "44455566677",
    kycStatus: "verified",
    createdAt: Date.now() - 86400000 * 3,
  },
];

const SEED_SPLITS: Split[] = [
  {
    id: "split-1",
    title: "Weekend Trip to Lekki",
    description: "Transport + food + activities",
    totalAmount: 15000,
    currency: "NGN",
    createdBy: "user-tunde",
    splitMethod: "equal",
    participants: [
      { userId: "user-tunde", name: "Tunde Adeyemi", amount: 5000, status: "paid", paidAt: Date.now() - 86400000 * 2 },
      { userId: "user-amaka", name: "Amaka Obi", amount: 5000, status: "pending" },
      { userId: "user-chidi", name: "Chidi Nwankwo", amount: 5000, status: "pending" },
    ],
    status: "active",
    createdAt: Date.now() - 86400000 * 2,
  },
  {
    id: "split-2",
    title: "Jollof Rice Order",
    totalAmount: 8000,
    currency: "NGN",
    createdBy: "user-tunde",
    splitMethod: "equal",
    participants: [
      { userId: "user-tunde", name: "Tunde Adeyemi", amount: 4000, status: "paid", paidAt: Date.now() - 86400000 },
      { userId: "user-amaka", name: "Amaka Obi", amount: 4000, status: "paid", paidAt: Date.now() - 3600000 },
    ],
    status: "settled",
    createdAt: Date.now() - 86400000,
    settledAt: Date.now() - 3600000,
  },
];

const SEED_TRANSACTIONS: Transaction[] = [
  {
    id: "tx-1",
    splitId: "split-2",
    payerId: "user-amaka",
    receiverId: "user-tunde",
    amount: 4000,
    currency: "NGN",
    status: "success",
    amlFlagged: false,
    reference: "SS-TX001ABC",
    createdAt: Date.now() - 3600000,
  },
];

function getDefaultState(): AppState {
  return {
    users: SEED_USERS,
    splits: SEED_SPLITS,
    transactions: SEED_TRANSACTIONS,
    currentUserId: "user-tunde",
    onboarded: true,
  };
}

export function loadState(): AppState {
  if (typeof window === "undefined") return getDefaultState();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const defaultState = getDefaultState();
      saveState(defaultState);
      return defaultState;
    }
    return JSON.parse(raw) as AppState;
  } catch {
    const defaultState = getDefaultState();
    saveState(defaultState);
    return defaultState;
  }
}

export function saveState(state: AppState): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function resetState(): AppState {
  const defaultState = getDefaultState();
  saveState(defaultState);
  return defaultState;
}

export function addSplit(state: AppState, split: Split): AppState {
  const newState = { ...state, splits: [...state.splits, split] };
  saveState(newState);
  return newState;
}

export function updateSplit(state: AppState, splitId: string, updates: Partial<Split>): AppState {
  const newState = {
    ...state,
    splits: state.splits.map((s) => (s.id === splitId ? { ...s, ...updates } : s)),
  };
  saveState(newState);
  return newState;
}

export function addTransaction(state: AppState, tx: Transaction): AppState {
  const newState = { ...state, transactions: [...state.transactions, tx] };
  saveState(newState);
  return newState;
}

export function switchUser(state: AppState, userId: string): AppState {
  const newState = { ...state, currentUserId: userId };
  saveState(newState);
  return newState;
}
