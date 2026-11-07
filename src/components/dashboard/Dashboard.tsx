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
    <div>
      <div className="mb-6">
        <p className="text-sm text-gray-500">Welcome back,</p>
        <h1 className="text-2xl font-bold text-gray-900">{currentUser.name.split(" ")[0]} 👋</h1>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-red-50 rounded-xl p-3">
          <p className="text-[10px] font-medium text-red-400 uppercase tracking-wide">You Owe</p>
          <p className="text-lg font-bold text-red-600 mt-1">{formatCurrency(youOwe)}</p>
        </div>
        <div className="bg-primary-50 rounded-xl p-3">
          <p className="text-[10px] font-medium text-primary-400 uppercase tracking-wide">Owed to You</p>
          <p className="text-lg font-bold text-primary-600 mt-1">{formatCurrency(owedToYou)}</p>
        </div>
        <div className="bg-gray-100 rounded-xl p-3">
          <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wide">Settled</p>
          <p className="text-lg font-bold text-gray-700 mt-1">{formatCurrency(settledThisMonth)}</p>
        </div>
      </div>

      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Active Splits ({activeSplits.length})
        </h2>
        {activeSplits.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center border border-gray-100">
            <p className="text-gray-400 text-sm">No active splits yet</p>
            <p className="text-gray-300 text-xs mt-1">Create one from the Split tab</p>
          </div>
        ) : (
          <div className="space-y-3">
            {activeSplits.map((split) => {
              const paidCount = split.participants.filter((p) => p.status === "paid").length;
              const totalCount = split.participants.length;
              const isOrganizer = split.createdBy === currentUser.id;
              const myParticipant = split.participants.find((p) => p.userId === currentUser.id);

              return (
                <button
                  key={split.id}
                  onClick={() => setSelectedSplit(split)}
                  className="w-full bg-white rounded-xl p-4 border border-gray-100 text-left hover:border-primary-200 transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-gray-900 text-sm">{split.title}</h3>
                    <span className="text-xs font-medium text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full">
                      {isOrganizer ? "Organizer" : "Participant"}
                    </span>
                  </div>
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-lg font-bold text-gray-900">{formatCurrency(split.totalAmount)}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{paidCount}/{totalCount} paid</p>
                    </div>
                    {!isOrganizer && myParticipant?.status === "pending" && (
                      <span className="text-xs font-medium text-red-600 bg-red-50 px-2 py-1 rounded-full">
                        You owe {formatCurrency(myParticipant.amount)}
                      </span>
                    )}
                  </div>
                  <div className="mt-3 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary-500 rounded-full transition-all"
                      style={{ width: `${(paidCount / totalCount) * 100}%` }}
                    />
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {mySplits.filter((s) => s.status === "settled").length > 0 && (
        <div className="mt-6">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Recently Settled
          </h2>
          <div className="space-y-2">
            {mySplits
              .filter((s) => s.status === "settled")
              .slice(0, 3)
              .map((split) => (
                <button
                  key={split.id}
                  onClick={() => setSelectedSplit(split)}
                  className="w-full bg-white rounded-xl p-3 border border-gray-100 flex justify-between items-center text-left"
                >
                  <div>
                    <h3 className="font-medium text-gray-700 text-sm">{split.title}</h3>
                    <p className="text-xs text-gray-400">{formatCurrency(split.totalAmount)}</p>
                  </div>
                  <span className="text-xs font-medium text-primary-600 bg-primary-50 px-2 py-1 rounded-full">
                    Settled ✓
                  </span>
                </button>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
