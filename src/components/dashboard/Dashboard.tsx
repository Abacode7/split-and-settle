"use client";
import { AppState, User } from "@/lib/types";

interface Props {
  state: AppState;
  currentUser: User;
  updateState: (state: AppState) => void;
  showToast: (msg: string, type?: "success" | "error" | "warning" | "info") => void;
}

export default function Dashboard({ currentUser }: Props) {
  return <div><h2 className="text-xl font-bold">Hi, {currentUser.name.split(" ")[0]}</h2><p className="text-gray-400 mt-2">Dashboard coming soon</p></div>;
}
