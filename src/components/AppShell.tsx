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

const TAB_ICONS: Record<Tab, string> = {
  dashboard: "🏠",
  create: "➕",
  history: "📋",
  profile: "👤",
};

const TAB_LABELS: Record<Tab, string> = {
  dashboard: "Home",
  create: "Split",
  history: "History",
  profile: "Profile",
};

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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
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
    <div className="min-h-screen pb-20 bg-gray-50">
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}

      <div className="px-4 pt-6">
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

      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-white border-t border-gray-200 px-2 py-2">
        <div className="flex justify-around">
          {(Object.keys(TAB_ICONS) as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex flex-col items-center gap-1 px-3 py-1 rounded-lg transition-colors ${
                activeTab === tab
                  ? "text-primary-600"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <span className="text-xl">{TAB_ICONS[tab]}</span>
              <span className="text-[10px] font-medium">{TAB_LABELS[tab]}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
