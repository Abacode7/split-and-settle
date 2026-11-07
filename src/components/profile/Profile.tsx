"use client";

import { AppState, User } from "@/lib/types";

interface Props {
  state: AppState;
  currentUser: User;
  onSwitchUser: (userId: string) => void;
  onReset: () => void;
  showToast: (msg: string, type?: "success" | "error" | "warning" | "info") => void;
}

export default function Profile({ state, currentUser, onSwitchUser, onReset, showToast }: Props) {
  const kycStyles = {
    verified: "bg-primary-50 text-primary-700",
    pending: "bg-amber-50 text-amber-700",
    failed: "bg-red-50 text-red-700",
  };

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-6">Profile</h1>

      <div className="bg-white rounded-xl border border-gray-100 p-4 mb-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 rounded-full bg-primary-100 flex items-center justify-center text-xl font-bold text-primary-600">
            {currentUser.name[0]}
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">{currentUser.name}</h2>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${kycStyles[currentUser.kycStatus]}`}>
              KYC: {currentUser.kycStatus}
            </span>
          </div>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between py-2 border-b border-gray-50">
            <span className="text-gray-400">Phone</span>
            <span className="text-gray-700">{currentUser.phone}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-50">
            <span className="text-gray-400">Email</span>
            <span className="text-gray-700">{currentUser.email}</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-gray-400">BVN</span>
            <span className="text-gray-700">***{currentUser.bvn.slice(-4)}</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-4 mb-6">
        <h3 className="text-xs font-semibold text-gray-400 uppercase mb-3">Demo: Switch Profile</h3>
        <p className="text-xs text-gray-500 mb-3">
          Switch between users to see different perspectives during your demo.
        </p>
        <div className="space-y-2">
          {state.users.map((user) => (
            <button
              key={user.id}
              onClick={() => {
                onSwitchUser(user.id);
                showToast(`Switched to ${user.name}`, "info");
              }}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-colors ${
                user.id === currentUser.id
                  ? "border-primary-500 bg-primary-50"
                  : "border-gray-100 hover:border-gray-200"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-sm font-semibold text-primary-600">
                  {user.name[0]}
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-gray-900">{user.name}</p>
                  <p className="text-[10px] text-gray-400">
                    {user.id === "user-tunde" && "Organizer persona"}
                    {user.id === "user-amaka" && "Participant persona"}
                    {user.id === "user-chidi" && "Edge case persona"}
                  </p>
                </div>
              </div>
              {user.id === currentUser.id && (
                <span className="text-xs text-primary-600 font-medium">Active</span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <button
          onClick={() => {
            onReset();
            showToast("Demo data reset to defaults", "success");
          }}
          className="w-full bg-red-50 text-red-600 py-3 rounded-xl font-medium text-sm hover:bg-red-100 transition-colors"
        >
          Reset Demo Data
        </button>

        <div className="text-center text-xs text-gray-400 mt-4">
          <p>Split & Settle MVP v1.0</p>
          <p className="mt-1">Built for Product Dive Capstone Defense</p>
        </div>
      </div>
    </div>
  );
}
