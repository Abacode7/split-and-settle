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

  const filtered = filter === "all"
    ? myTransactions
    : myTransactions.filter((t) => t.status === filter);

  const sorted = [...filtered].sort((a, b) => b.createdAt - a.createdAt);

  const statusStyle: Record<string, string> = {
    success: "bg-primary-50 text-primary-700",
    failed: "bg-red-50 text-red-700",
    held: "bg-amber-50 text-amber-700",
  };

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-4">Transaction History</h1>

      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        {(Object.keys(FILTER_LABELS) as Filter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              filter === f
                ? "bg-primary-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {FILTER_LABELS[f]}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-4 mb-4">
        <h3 className="text-xs font-semibold text-gray-400 uppercase mb-2">Summary</h3>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <p className="text-lg font-bold text-primary-600">
              {myTransactions.filter((t) => t.status === "success").length}
            </p>
            <p className="text-[10px] text-gray-400">Successful</p>
          </div>
          <div>
            <p className="text-lg font-bold text-red-600">
              {myTransactions.filter((t) => t.status === "failed").length}
            </p>
            <p className="text-[10px] text-gray-400">Failed</p>
          </div>
          <div>
            <p className="text-lg font-bold text-amber-600">
              {myTransactions.filter((t) => t.status === "held").length}
            </p>
            <p className="text-[10px] text-gray-400">Held</p>
          </div>
        </div>
      </div>

      {sorted.length === 0 ? (
        <div className="bg-white rounded-xl p-8 text-center border border-gray-100">
          <p className="text-gray-400 text-sm">No transactions yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {sorted.map((tx) => {
            const isPayer = tx.payerId === currentUser.id;
            const otherUser = state.users.find((u) => u.id === (isPayer ? tx.receiverId : tx.payerId));
            const split = state.splits.find((s) => s.id === tx.splitId);
            const isExpanded = expandedId === tx.id;

            return (
              <button
                key={tx.id}
                onClick={() => setExpandedId(isExpanded ? null : tx.id)}
                className="w-full bg-white rounded-xl border border-gray-100 p-4 text-left transition-colors hover:border-gray-200"
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                      isPayer ? "bg-red-100 text-red-600" : "bg-primary-100 text-primary-600"
                    }`}>
                      {isPayer ? "↑" : "↓"}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {isPayer ? `Paid ${otherUser?.name?.split(" ")[0] || "Unknown"}` : `From ${otherUser?.name?.split(" ")[0] || "Unknown"}`}
                      </p>
                      <p className="text-xs text-gray-400">{split?.title || "Unknown split"}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-bold ${isPayer ? "text-red-600" : "text-primary-600"}`}>
                      {isPayer ? "-" : "+"}{formatCurrency(tx.amount)}
                    </p>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${statusStyle[tx.status]}`}>
                      {tx.status}
                    </span>
                  </div>
                </div>

                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-gray-50 space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">Reference</span>
                      <span className="text-gray-600 font-mono">{tx.reference}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">Date</span>
                      <span className="text-gray-600">{formatDate(tx.createdAt)}</span>
                    </div>
                    {tx.failReason && (
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-400">Reason</span>
                        <span className="text-red-600">{tx.failReason}</span>
                      </div>
                    )}
                    {tx.amlFlagged && (
                      <div className="mt-2 bg-amber-50 rounded-lg p-2">
                        <p className="text-[10px] text-amber-800">
                          This transaction was flagged for AML review. Expected resolution within 24 hours.
                        </p>
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
