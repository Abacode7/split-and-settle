"use client";
import { AppState, User } from "@/lib/types";

interface Props {
  state: AppState;
  currentUser: User;
  updateState: (state: AppState) => void;
  showToast: (msg: string, type?: "success" | "error" | "warning" | "info") => void;
  onCreated: () => void;
}

export default function CreateSplit(_props: Props) {
  return <div><h2 className="text-xl font-bold">Create Split</h2><p className="text-gray-400 mt-2">Coming soon</p></div>;
}
