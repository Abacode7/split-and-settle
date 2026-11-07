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

const STATUS_STYLES: Record<string, string> = {
  paid: "bg-primary-50 text-primary-700",
  pending: "bg-amber-50 text-amber-700",
  failed: "bg-red-50 text-red-700",
  flagged: "bg-amber-50 text-amber-700",
};

export default function SplitDetail({ split: initialSplit, state, currentUser, updateState, showToast, onBack }: Props) {
  const [showPayment, setShowPayment] = useState(false);

  const split = state.splits.find((s) => s.id === initialSplit.id) || initialSplit;

  const isOrganizer = split.createdBy === currentUser.id;
  const myParticipant = split.participants.find((p) => p.userId === currentUser.id);
  const paidCount = split.participants.filter((p) => p.status === "paid").length;
  const totalCount = split.participants.length;
  const paidAmount = split.participants.filter((p) => p.status === "paid").reduce((s, p) => s + p.amount, 0);

  return (
    <div>
      <button onClick={onBack} className="text-sm text-primary-600 mb-4">&larr; Back</button>

      <div className="mb-6">
        <div className="flex justify-between items-start">
          <h1 className="text-xl font-bold text-gray-900">{split.title}</h1>
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${
            split.status === "settled" ? "bg-primary-50 text-primary-700" :
            split.status === "disputed" ? "bg-red-50 text-red-700" :
            "bg-blue-50 text-blue-700"
          }`}>
            {split.status === "settled" ? "Settled ✓" : split.status === "disputed" ? "Disputed ⚠" : "Active"}
          </span>
        </div>
        {split.description && <p className="text-sm text-gray-500 mt-1">{split.description}</p>}
        <p className="text-xs text-gray-400 mt-1">{formatDate(split.createdAt)}</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-4 mb-4">
        <p className="text-2xl font-bold text-gray-900">{formatCurrency(split.totalAmount)}</p>
        <div className="flex justify-between items-center mt-2">
          <p className="text-xs text-gray-500">{paidCount}/{totalCount} paid ({formatCurrency(paidAmount)} collected)</p>
          <p className="text-xs text-gray-500 capitalize">{split.splitMethod} split</p>
        </div>
        <div className="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-primary-500 rounded-full transition-all" style={{ width: `${(paidCount / totalCount) * 100}%` }} />
        </div>
      </div>

      {!isOrganizer && myParticipant?.status === "pending" && split.status === "active" && (
        <button onClick={() => setShowPayment(true)} className="w-full bg-primary-600 text-white py-3.5 rounded-xl font-semibold mb-4 hover:bg-primary-700 transition-colors">
          Pay {formatCurrency(myParticipant.amount)} Now
        </button>
      )}

      <div className="bg-white rounded-xl border border-gray-100 divide-y divide-gray-50">
        <div className="px-4 py-3">
          <h3 className="text-xs font-semibold text-gray-400 uppercase">Participants</h3>
        </div>
        {split.participants.map((p) => (
          <div key={p.userId} className="px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-sm font-semibold text-primary-600">
                {p.name[0]}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {p.name} {p.userId === split.createdBy && <span className="text-xs text-gray-400">(organizer)</span>}
                </p>
                {p.paidAt && <p className="text-[10px] text-gray-400">{formatDate(p.paidAt)}</p>}
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-900">{formatCurrency(p.amount)}</p>
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${STATUS_STYLES[p.status]}`}>
                {p.status}
              </span>
            </div>
          </div>
        ))}
      </div>

      {isOrganizer && split.status === "active" && (
        <div className="mt-4 space-y-2">
          <button onClick={() => showToast("Reminder sent to all pending participants!", "success")} className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-medium text-sm hover:bg-gray-200 transition-colors">
            Send Reminder to All
          </button>
          <button
            onClick={() => {
              const newState = updateSplit(state, split.id, { status: "disputed" });
              updateState(newState);
              showToast("Split marked as disputed.", "warning");
            }}
            className="w-full text-red-500 py-2 text-sm font-medium"
          >
            Mark as Disputed
          </button>
        </div>
      )}

      {isOrganizer && split.status === "settled" && (
        <div className="mt-4 bg-primary-50 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-primary-700 mb-2">Reconciliation</h3>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Total expected</span>
            <span className="font-semibold text-gray-900">{formatCurrency(split.totalAmount)}</span>
          </div>
          <div className="flex justify-between text-sm mt-1">
            <span className="text-gray-600">Total received</span>
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
