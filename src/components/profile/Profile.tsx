"use client";
import { AppState, User } from "@/lib/types";

interface Props {
  state: AppState;
  currentUser: User;
  onSwitchUser: (userId: string) => void;
  onReset: () => void;
  showToast: (msg: string, type?: "success" | "error" | "warning" | "info") => void;
}

export default function Profile({ currentUser }: Props) {
  return <div><h2 className="text-xl font-bold">Profile</h2><p className="text-gray-400 mt-2">{currentUser.name}</p></div>;
}
