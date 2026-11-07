"use client";

import { useState } from "react";
import { AppState, User, Split } from "@/lib/types";
import { updateSplit } from "@/lib/store";
import { formatCurrency, formatDate } from "@/lib/utils";
import PaymentModal from "../payment/PaymentModal";

interface Props {
  split: Split;
  state: AppState;
  currentUser: User;
  updateState: (state: AppState) => void;
  showToast: (msg: string, type?: "success" | "error" | "warning" | "info") => void;
  onBack: () => void;
}

const PARTICIPANT_STATUS_STYLES: Record<string, string> = {
  paid: "bg-primary-50 text-primary-700",
  pending: "bg-accent-50 text-accent-700",
  failed: "bg-red-50 text-red-600",
  flagged: "bg-accent-50 text-accent-700",
};

export default function SplitDetail({ split: initialSplit, state, currentUser, updateState, showToast, onBack }: Props) {
  const [showPayment, setShowPayment] = useState(false);

  const split = state.splits.find((s) => s.id === initialSplit.id) || initialSplit;

  const isOrganizer = split.createdBy === currentUser.id;
  const myParticipant = split.participants.find((p) => p.userId === currentUser.id);
  const paidCount = split.participants.filter((p) => p.status === "paid").length;
  const totalCount = split.participants.length;
  const paidAmount = split.participants.filter((p) => p.status === "paid").reduce((s, p) => s + p.amount, 0);
  const progressPct = totalCount > 0 ? (paidCount / totalCount) * 100 : 0;

  return (
    <div className="animate-fade-in">
      {/* Back button */}
      <button
        onClick={onBack}
        className="text-sm text-primary-600 font-semibold flex items-center gap-1 mb-5 hover:text-primary-700 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </button>

      {/* Title row */}
      <div className="flex justify-between items-start mb-6 animate-fade-up">
        <div>
          <h1 className="font-display text-xl font-bold text-surface-900">{split.title}</h1>
          {split.description && (
            <p className="text-sm text-surface-500 mt-1">{split.description}</p>
          )}
          <p className="text-xs text-surface-400 mt-1">{formatDate(split.createdAt)}</p>
        </div>
        <span
          className={`status-badge ${
            split.status === "settled"
              ? "bg-primary-50 text-primary-700"
              : split.status === "disputed"
              ? "bg-red-50 text-red-600"
              : "bg-accent-50 text-accent-700"
          }`}
        >
          {split.status === "settled" ? "Settled" : split.status === "disputed" ? "Disputed" : "Active"}
        </span>
      </div>

      {/* Amount card */}
      <div className="glass-card rounded-2xl p-5 mb-4 animate-fade-up">
        <p className="font-display text-2xl font-bold text-surface-900">{formatCurrency(split.totalAmount)}</p>
        <div className="flex justify-between items-center mt-2">
          <p className="text-xs text-surface-500">
            {paidCount}/{totalCount} paid &middot; {formatCurrency(paidAmount)} collected
          </p>
          <p className="text-xs text-surface-400 capitalize">{split.splitMethod} split</p>
        </div>
        <div className="progress-bar mt-3 h-2">
          <div
            className="progress-bar-fill h-2"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Pay Now button */}
      {!isOrganizer && myParticipant?.status === "pending" && split.status === "active" && (
        <button
          onClick={() => setShowPayment(true)}
          className="btn-primary w-full text-base mb-4 animate-fade-up"
        >
          Pay {formatCurrency(myParticipant.amount)} Now
        </button>
      )}

      {/* Participants list */}
      <div className="glass-card rounded-2xl divide-y divide-surface-100 mb-4 animate-fade-up">
        <div className="px-4 py-3">
          <h3 className="section-label">Participants</h3>
        </div>
        {split.participants.map((p) => (
          <div key={p.userId} className="px-4 py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="avatar w-9 h-9 text-xs">
                {p.name[0]}
              </div>
              <div>
                <p className="text-sm font-medium text-surface-900">
                  {p.name}{" "}
                  {p.userId === split.createdBy && (
                    <span className="text-xs text-surface-400 font-normal">(organizer)</span>
                  )}
                </p>
                {p.paidAt && (
                  <p className="text-[10px] text-surface-400">{formatDate(p.paidAt)}</p>
                )}
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-surface-900">{formatCurrency(p.amount)}</p>
              <span className={`status-badge mt-0.5 ${PARTICIPANT_STATUS_STYLES[p.status]}`}>
                {p.status}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Organizer actions */}
      {isOrganizer && split.status === "active" && (
        <div className="mt-4 space-y-2 animate-fade-up">
          <button
            onClick={() => showToast("Reminder sent to all pending participants!", "success")}
            className="glass-card rounded-2xl w-full py-3.5 text-sm font-semibold text-surface-700 hover:text-surface-900 transition-colors"
          >
            Send Reminder to All
          </button>
          <button
            onClick={() => {
              const newState = updateSplit(state, split.id, { status: "disputed" });
              updateState(newState);
              showToast("Split marked as disputed.", "warning");
            }}
            className="w-full text-red-500 py-2 text-sm font-medium hover:text-red-600 transition-colors"
          >
            Mark as Disputed
          </button>
        </div>
      )}

      {/* Reconciliation */}
      {isOrganizer && split.status === "settled" && (
        <div className="mt-4 bg-gradient-to-br from-primary-50 to-primary-100 rounded-2xl p-4 border border-primary-200 animate-fade-up">
          <h3 className="text-sm font-semibold text-primary-700 mb-3">Reconciliation</h3>
          <div className="flex justify-between text-sm mb-1.5">
            <span className="text-surface-600">Total expected</span>
            <span className="font-semibold text-surface-900">{formatCurrency(split.totalAmount)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-surface-600">Total received</span>
            <span className="font-semibold text-primary-700">{formatCurrency(paidAmount)}</span>
          </div>
        </div>
      )}

      {showPayment && (
        <PaymentModal
          split={split}
          state={state}
          currentUser={currentUser}
          updateState={updateState}
          showToast={showToast}
          onClose={() => setShowPayment(false)}
        />
      )}
    </div>
  );
}
