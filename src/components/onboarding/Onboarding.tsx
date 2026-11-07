"use client";
import { AppState } from "@/lib/types";

interface Props {
  state: AppState;
  onComplete: (state: AppState) => void;
}

export default function Onboarding({ state, onComplete }: Props) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-primary-600 mb-4">Split &amp; Settle</h1>
        <p className="text-gray-500 mb-6">Welcome! Let&apos;s get you set up.</p>
        <button onClick={() => onComplete(state)} className="bg-primary-600 text-white px-6 py-3 rounded-xl font-medium">
          Get Started (placeholder)
        </button>
      </div>
    </div>
  );
}
