"use client";
import { AppState, User, Split } from "@/lib/types";

interface Props {
  split: Split;
  state: AppState;
  currentUser: User;
  updateState: (state: AppState) => void;
  showToast: (msg: string, type?: "success" | "error" | "warning" | "info") => void;
  onBack: () => void;
}

export default function SplitDetail({ split, onBack }: Props) {
  return (
    <div>
      <button onClick={onBack} className="text-sm text-primary-600 mb-4">← Back</button>
      <h2 className="text-xl font-bold">{split.title}</h2>
      <p className="text-gray-400 mt-2">Split detail coming soon</p>
    </div>
  );
}
