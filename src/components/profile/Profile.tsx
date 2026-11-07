"use client";

import { AppState, User } from "@/lib/types";

interface Props {
  state: AppState;
  currentUser: User;
  onSwitchUser: (userId: string) => void;
  onReset: () => void;
  onShowOnboarding: () => void;
  showToast: (msg: string, type?: "success" | "error" | "warning" | "info") => void;
}

const KYC_STYLES: Record<string, string> = {
  verified: "bg-primary-50 text-primary-700",
  pending: "bg-accent-50 text-accent-700",
  failed: "bg-red-50 text-red-600",
};

export default function Profile({ state, currentUser, onSwitchUser, onReset, onShowOnboarding, showToast }: Props) {
  return (
    <div className="animate-fade-in">
      {/* Page title */}
      <h1 className="font-display font-bold text-xl text-surface-900 mb-6">Profile</h1>

      {/* User card */}
      <div className="glass-card rounded-2xl p-5 mb-5 animate-fade-up">
        <div className="flex items-center gap-4 mb-4">
          <div className="avatar w-16 h-16 text-2xl">
            {currentUser.name[0]}
          </div>
          <div>
            <h2 className="font-display font-bold text-lg text-surface-900">{currentUser.name}</h2>
            <span className={`status-badge mt-1 ${KYC_STYLES[currentUser.kycStatus]}`}>
              KYC: {currentUser.kycStatus}
            </span>
          </div>
        </div>

        <div className="space-y-0 text-sm">
          <div className="flex justify-between py-2.5 border-b border-surface-100">
            <span className="text-surface-400">Phone</span>
            <span className="text-surface-800 font-medium">{currentUser.phone}</span>
          </div>
          <div className="flex justify-between py-2.5 border-b border-surface-100">
            <span className="text-surface-400">Email</span>
            <span className="text-surface-800 font-medium">{currentUser.email}</span>
          </div>
          <div className="flex justify-between py-2.5">
            <span className="text-surface-400">BVN</span>
            <span className="text-surface-800 font-medium">***{currentUser.bvn.slice(-4)}</span>
          </div>
        </div>
      </div>

      {/* Demo switcher */}
      <div className="glass-card rounded-2xl p-5 mb-5 animate-fade-up">
        <h3 className="section-label mb-1">Demo: Switch Profile</h3>
        <p className="text-xs text-surface-500 mb-4">
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
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all ${
                user.id === currentUser.id
                  ? "border-primary-500 bg-primary-50 shadow-glow"
                  : "border-surface-200 hover:border-surface-300"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="avatar w-9 h-9 text-xs">
                  {user.name[0]}
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-surface-900">{user.name}</p>
                  <p className="text-[10px] text-surface-400">
                    {user.id === "user-tunde" && "Organizer persona"}
                    {user.id === "user-amaka" && "Participant persona"}
                    {user.id === "user-chidi" && "Edge case persona"}
                  </p>
                </div>
              </div>
              {user.id === currentUser.id && (
                <span className="text-xs text-primary-600 font-semibold">Active</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Demo actions & footer */}
      <div className="space-y-3 animate-fade-up">
        <button
          onClick={onShowOnboarding}
          className="glass-card py-3.5 rounded-2xl font-semibold text-sm text-primary-600 w-full transition-colors hover:bg-primary-50"
        >
          Replay Onboarding / KYC Flow
        </button>
        <button
          onClick={() => {
            onReset();
            showToast("Demo data reset to defaults", "success");
          }}
          className="bg-red-50 text-red-600 py-3.5 rounded-2xl font-semibold text-sm hover:bg-red-100 border border-red-100 w-full transition-colors"
        >
          Reset Demo Data
        </button>

        <div className="text-center text-xs text-surface-400 pb-2">
          <p>Split &amp; Settle MVP v1.0</p>
          <p className="mt-1">Built for Product Dive Capstone Defense</p>
        </div>
      </div>
    </div>
  );
}
