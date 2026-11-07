"use client";

import { useState } from "react";
import { AppState, User, TransactionStatus } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/utils";

interface Props {
  state: AppState;
  currentUser: User;
}

type Filter = "all" | TransactionStatus;

const FILTER_LABELS: Record<Filter, string> = {
  all: "All",
  success: "Successful",
  failed: "Failed",
  held: "Held",
};

export default function History({ state, currentUser }: Props) {
  const [filter, setFilter] = useState<Filter>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const myTransactions = state.transactions.filter(
    (t) => t.payerId === currentUser.id || t.receiverId === currentUser.id
  );

  const filtered =
    filter === "all"
      ? myTransactions
      : myTransactions.filter((t) => t.status === filter);

  const sorted = [...filtered].sort((a, b) => b.createdAt - a.createdAt);

  const statusBadgeClass: Record<string, string> = {
    success: "bg-primary-50 text-primary-700",
    failed: "bg-red-50 text-red-600",
    held: "bg-accent-50 text-accent-700",
  };

  return (
    <div className="animate-fade-in">
      <h1 className="font-display font-bold text-xl text-surface-900 mb-4">
        Transaction History
      </h1>

      {/* ── Filter Pills ── */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        {(Object.keys(FILTER_LABELS) as Filter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all font-body ${
              filter === f
                ? "bg-primary-600 text-white shadow-glow"
                : "glass-card text-surface-600 hover:text-surface-900"
            }`}
          >
            {FILTER_LABELS[f]}
          </button>
        ))}
      </div>

      {/* ── Summary Card ── */}
      <div className="glass-card rounded-2xl p-4 mb-4">
        <h3 className="section-label mb-3">Summary</h3>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <p className="font-display text-xl font-bold text-primary-600">
              {myTransactions.filter((t) => t.status === "success").length}
            </p>
            <p className="text-[10px] text-surface-400 font-body mt-0.5">Successful</p>
          </div>
          <div>
            <p className="font-display text-xl font-bold text-red-500">
              {myTransactions.filter((t) => t.status === "failed").length}
            </p>
            <p className="text-[10px] text-surface-400 font-body mt-0.5">Failed</p>
          </div>
          <div>
            <p className="font-display text-xl font-bold text-accent-600">
              {myTransactions.filter((t) => t.status === "held").length}
            </p>
            <p className="text-[10px] text-surface-400 font-body mt-0.5">Held</p>
          </div>
        </div>
      </div>

      {/* ── Transaction List ── */}
      {sorted.length === 0 ? (
        <div className="glass-card rounded-2xl p-10 text-center animate-fade-up">
          <div className="w-12 h-12 rounded-2xl bg-surface-100 flex items-center justify-center mx-auto mb-3">
            <svg
              className="w-6 h-6 text-surface-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
          </div>
          <p className="text-surface-500 text-sm font-body font-medium">No transactions yet</p>
          <p className="text-surface-400 text-xs font-body mt-1">
            Completed payments will appear here
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {sorted.map((tx, idx) => {
            const isPayer = tx.payerId === currentUser.id;
            const otherUser = state.users.find(
              (u) => u.id === (isPayer ? tx.receiverId : tx.payerId)
            );
            const split = state.splits.find((s) => s.id === tx.splitId);
            const isExpanded = expandedId === tx.id;

            return (
              <button
                key={tx.id}
                onClick={() => setExpandedId(isExpanded ? null : tx.id)}
                className={`glass-card rounded-2xl p-4 w-full text-left transition-all animate-fade-up`}
                style={{ animationDelay: `${idx * 40}ms` }}
              >
                <div className="flex justify-between items-start gap-3">
                  {/* Direction icon + label */}
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 ${
                        isPayer
                          ? "bg-gradient-to-br from-red-400 to-orange-500"
                          : "bg-gradient-to-br from-primary-400 to-primary-600"
                      }`}
                    >
                      {isPayer ? (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-surface-900 font-body">
                        {isPayer
                          ? `Paid ${otherUser?.name?.split(" ")[0] || "Unknown"}`
                          : `From ${otherUser?.name?.split(" ")[0] || "Unknown"}`}
                      </p>
                      <p className="text-xs text-surface-400 font-body mt-0.5">
                        {split?.title || "Unknown split"}
                      </p>
                    </div>
                  </div>

                  {/* Amount + status */}
                  <div className="text-right flex-shrink-0">
                    <p
                      className={`text-sm font-bold font-mono ${
                        isPayer ? "text-red-500" : "text-primary-600"
                      }`}
                    >
                      {isPayer ? "-" : "+"}
                      {formatCurrency(tx.amount)}
                    </p>
                    <span className={`status-badge mt-1 inline-block ${statusBadgeClass[tx.status]}`}>
                      {tx.status}
                    </span>
                  </div>
                </div>

                {/* Expanded details */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-surface-100 space-y-2.5">
                    <div className="flex justify-between items-center">
                      <span className="section-label">Reference</span>
                      <span className="text-xs text-surface-700 font-mono bg-surface-100 px-2 py-0.5 rounded-lg">
                        {tx.reference}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="section-label">Date</span>
                      <span className="text-xs text-surface-600 font-body">{formatDate(tx.createdAt)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="section-label">Direction</span>
                      <span className={`text-xs font-semibold font-body ${isPayer ? "text-red-500" : "text-primary-600"}`}>
                        {isPayer ? "Outgoing" : "Incoming"}
                      </span>
                    </div>
                    {tx.failReason && (
                      <div className="flex justify-between items-start gap-4">
                        <span className="section-label flex-shrink-0">Reason</span>
                        <span className="text-xs text-red-500 font-body text-right">{tx.failReason}</span>
                      </div>
                    )}
                    {tx.amlFlagged && (
                      <div className="mt-2 glass-card border border-accent-300 bg-accent-50 rounded-xl p-3">
                        <div className="flex items-start gap-2">
                          <span className="text-accent-500 text-sm mt-0.5">&#9888;</span>
                          <p className="text-[11px] text-accent-700 leading-relaxed font-body">
                            This transaction was flagged for AML review. Expected resolution within 24 hours.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
