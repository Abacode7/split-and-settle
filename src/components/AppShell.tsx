"use client";

import { useState, useCallback, useEffect } from "react";
import { AppState } from "@/lib/types";
import { loadState, saveState, resetState, switchUser } from "@/lib/store";
import Toast from "./Toast";
import Dashboard from "./dashboard/Dashboard";
import CreateSplit from "./create-split/CreateSplit";
import History from "./history/History";
import Profile from "./profile/Profile";
import Onboarding from "./onboarding/Onboarding";

type Tab = "dashboard" | "create" | "history" | "profile";

const TAB_LABELS: Record<Tab, string> = {
  dashboard: "Home",
  create: "Split",
  history: "History",
  profile: "Profile",
};

function TabIcon({ tab, active }: { tab: Tab; active: boolean }) {
  const cls = `w-5 h-5 transition-colors ${active ? "text-primary-600" : "text-surface-400"}`;
  switch (tab) {
    case "dashboard":
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 2.5 : 2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      );
    case "create":
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 2.5 : 2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
      );
    case "history":
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 2.5 : 2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    case "profile":
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 2.5 : 2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      );
  }
}

export default function AppShell() {
  const [state, setState] = useState<AppState | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "warning" | "info" } | null>(null);

  useEffect(() => {
    setState(loadState());
  }, []);

  const showToast = useCallback((message: string, type: "success" | "error" | "warning" | "info" = "info") => {
    setToast({ message, type });
  }, []);

  const updateState = useCallback((newState: AppState) => {
    setState(newState);
    saveState(newState);
  }, []);

  if (!state) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="relative">
          <div className="w-10 h-10 rounded-full border-[3px] border-primary-100 border-t-primary-600 animate-spin" />
        </div>
      </div>
    );
  }

  if (!state.onboarded) {
    return (
      <Onboarding
        state={state}
        onComplete={(updatedState) => updateState({ ...updatedState, onboarded: true })}
      />
    );
  }

  const currentUser = state.users.find((u) => u.id === state.currentUserId)!;

  return (
    <div className="min-h-screen pb-24 relative z-10 noise">
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}

      <div className="px-5 pt-6">
        {activeTab === "dashboard" && (
          <Dashboard state={state} currentUser={currentUser} updateState={updateState} showToast={showToast} />
        )}
        {activeTab === "create" && (
          <CreateSplit
            state={state}
            currentUser={currentUser}
            updateState={updateState}
            showToast={showToast}
            onCreated={() => setActiveTab("dashboard")}
          />
        )}
        {activeTab === "history" && (
          <History state={state} currentUser={currentUser} />
        )}
        {activeTab === "profile" && (
          <Profile
            state={state}
            currentUser={currentUser}
            onSwitchUser={(userId) => updateState(switchUser(state, userId))}
            onReset={() => setState(resetState())}
            showToast={showToast}
          />
        )}
      </div>

      {/* Premium tab bar */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] tab-bar px-3 pt-2 pb-6">
        <div className="flex justify-around">
          {(Object.keys(TAB_LABELS) as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex flex-col items-center gap-1 px-4 py-1.5 rounded-xl transition-all duration-300 ${
                activeTab === tab
                  ? "tab-active"
                  : "hover:bg-surface-100"
              }`}
            >
              <TabIcon tab={tab} active={activeTab === tab} />
              <span className={`text-[10px] font-semibold tracking-wide transition-colors ${
                activeTab === tab ? "text-primary-600" : "text-surface-400"
              }`}>
                {TAB_LABELS[tab]}
              </span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
