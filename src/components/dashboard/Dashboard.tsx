"use client";

import { useState } from "react";
import { AppState, User, Split } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import SplitDetail from "../split-detail/SplitDetail";

interface Props {
  state: AppState;
  currentUser: User;
  updateState: (state: AppState) => void;
  showToast: (msg: string, type?: "success" | "error" | "warning" | "info") => void;
}

export default function Dashboard({ state, currentUser, updateState, showToast }: Props) {
  const [selectedSplit, setSelectedSplit] = useState<Split | null>(null);

  const mySplits = state.splits.filter((s) =>
    s.participants.some((p) => p.userId === currentUser.id)
  );

  const activeSplits = mySplits.filter((s) => s.status === "active");

  const youOwe = mySplits.reduce((sum, s) => {
    if (s.createdBy !== currentUser.id) {
      const participant = s.participants.find((p) => p.userId === currentUser.id);
      if (participant && participant.status === "pending") return sum + participant.amount;
    }
    return sum;
  }, 0);

  const owedToYou = mySplits.reduce((sum, s) => {
    if (s.createdBy === currentUser.id) {
      return sum + s.participants
        .filter((p) => p.userId !== currentUser.id && p.status === "pending")
        .reduce((pSum, p) => pSum + p.amount, 0);
    }
    return sum;
  }, 0);

  const settledThisMonth = state.transactions
    .filter((t) => t.status === "success" && t.createdAt > Date.now() - 30 * 86400000)
    .reduce((sum, t) => sum + t.amount, 0);

  if (selectedSplit) {
    return (
      <SplitDetail
        split={selectedSplit}
        state={state}
        currentUser={currentUser}
        updateState={updateState}
        showToast={showToast}
        onBack={() => setSelectedSplit(null)}
      />
    );
  }

  return (
    <div className="pb-8">
      {/* Header */}
      <div className="mb-8 animate-fade-up">
        <p className="section-label mb-1">Welcome back</p>
        <h1 className="text-3xl font-display font-bold text-surface-900 leading-tight">
          {currentUser.name.split(" ")[0]}
        </h1>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-3 gap-3 mb-8 animate-fade-up-1">
        {/* You Owe */}
        <div className="stat-card bg-gradient-to-br from-red-500 to-red-600 text-white rounded-2xl p-4 relative overflow-hidden">
          <div className="relative z-10">
            <div className="mb-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M12 19V5M5 12l7-7 7 7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <p className="text-[10px] font-display font-bold uppercase tracking-wider opacity-90">You Owe</p>
            <p className="text-xl font-display font-bold mt-0.5 leading-none">{formatCurrency(youOwe)}</p>
          </div>
        </div>

        {/* Owed to You */}
        <div className="stat-card bg-gradient-to-br from-primary-500 to-primary-700 text-white rounded-2xl p-4 relative overflow-hidden">
          <div className="relative z-10">
            <div className="mb-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M12 5v14M19 12l-7 7-7-7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <p className="text-[10px] font-display font-bold uppercase tracking-wider opacity-90">Incoming</p>
            <p className="text-xl font-display font-bold mt-0.5 leading-none">{formatCurrency(owedToYou)}</p>
          </div>
        </div>

        {/* Settled */}
        <div className="stat-card bg-gradient-to-br from-surface-700 to-surface-900 text-white rounded-2xl p-4 relative overflow-hidden">
          <div className="relative z-10">
            <div className="mb-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M20 6L9 17l-5-5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <p className="text-[10px] font-display font-bold uppercase tracking-wider opacity-90">Settled</p>
            <p className="text-xl font-display font-bold mt-0.5 leading-none">{formatCurrency(settledThisMonth)}</p>
          </div>
        </div>
      </div>

      {/* Active Splits */}
      <div className="mb-8 animate-fade-up-2">
        <p className="section-label mb-3">Active Splits ({activeSplits.length})</p>

        {activeSplits.length === 0 ? (
          <div className="glass-card rounded-2xl p-8 text-center">
            <div className="w-12 h-12 rounded-full bg-primary-50 flex items-center justify-center mx-auto mb-3">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M12 5v14M5 12h14" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </div>
            <p className="font-body font-medium text-surface-500 text-sm">No active splits yet</p>
            <p className="font-body text-surface-300 text-xs mt-1">Create one from the Split tab</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {activeSplits.map((split) => {
              const paidCount = split.participants.filter((p) => p.status === "paid").length;
              const totalCount = split.participants.length;
              const isOrganizer = split.createdBy === currentUser.id;
              const myParticipant = split.participants.find((p) => p.userId === currentUser.id);
              const progressPct = totalCount > 0 ? (paidCount / totalCount) * 100 : 0;
              const firstLetter = split.title.charAt(0).toUpperCase();

              return (
                <button
                  key={split.id}
                  onClick={() => setSelectedSplit(split)}
                  className="glass-card rounded-2xl p-4 text-left w-full"
                >
                  <div className="flex items-start gap-3 mb-3">
                    {/* Avatar */}
                    <div className="avatar w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-sm font-display font-bold">
                      {firstLetter}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-2">
                        <h3 className="font-display font-bold text-surface-900 text-sm truncate leading-snug">
                          {split.title}
                        </h3>
                        <span
                          className={`status-badge shrink-0 ${
                            isOrganizer
                              ? "bg-primary-50 text-primary-700"
                              : "bg-surface-100 text-surface-500"
                          }`}
                        >
                          {isOrganizer ? "Organizer" : "Member"}
                        </span>
                      </div>

                      <div className="flex justify-between items-end mt-1">
                        <div>
                          <p className="text-xl font-display font-bold text-surface-900 leading-none">
                            {formatCurrency(split.totalAmount)}
                          </p>
                          <p className="text-[11px] font-body text-surface-400 mt-0.5">
                            {paidCount}/{totalCount} paid
                          </p>
                        </div>
                        {!isOrganizer && myParticipant?.status === "pending" && (
                          <span className="status-badge bg-red-50 text-red-600 shrink-0">
                            Owes {formatCurrency(myParticipant.amount)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="progress-bar">
                    <div
                      className="progress-bar-fill"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Recently Settled */}
      {mySplits.filter((s) => s.status === "settled").length > 0 && (
        <div className="animate-fade-up-3">
          <p className="section-label mb-3">Recently Settled</p>
          <div className="flex flex-col gap-3">
            {mySplits
              .filter((s) => s.status === "settled")
              .slice(0, 3)
              .map((split) => (
                <button
                  key={split.id}
                  onClick={() => setSelectedSplit(split)}
                  className="glass-card rounded-2xl p-4 flex justify-between items-center text-left w-full"
                >
                  <div className="flex items-center gap-3">
                    {/* Green checkmark in rounded square */}
                    <div className="w-9 h-9 rounded-xl bg-primary-50 flex items-center justify-center shrink-0">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <path d="M20 6L9 17l-5-5" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-display font-semibold text-surface-700 text-sm leading-snug">
                        {split.title}
                      </h3>
                      <p className="text-xs font-body text-surface-400 mt-0.5">
                        {formatCurrency(split.totalAmount)}
                      </p>
                    </div>
                  </div>
                  <span className="status-badge bg-primary-50 text-primary-700">
                    Settled
                  </span>
                </button>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
