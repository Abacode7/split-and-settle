"use client";

import { useState } from "react";
import { AppState, User, Split, SplitMethod, Participant } from "@/lib/types";
import { addSplit } from "@/lib/store";
import { generateId, formatCurrency, AML_THRESHOLD, TRANSACTION_LIMIT } from "@/lib/utils";

interface Props {
  state: AppState;
  currentUser: User;
  updateState: (state: AppState) => void;
  showToast: (msg: string, type?: "success" | "error" | "warning" | "info") => void;
  onCreated: () => void;
}

interface ParticipantInput {
  name: string;
  userId: string;
  amount: string;
  percentage: string;
}

type Step = "details" | "participants" | "method" | "review";

export default function CreateSplit({ state, currentUser, updateState, showToast, onCreated }: Props) {
  const [step, setStep] = useState<Step>("details");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [totalAmount, setTotalAmount] = useState("");
  const [splitMethod, setSplitMethod] = useState<SplitMethod>("equal");
  const [participants, setParticipants] = useState<ParticipantInput[]>([
    { name: currentUser.name, userId: currentUser.id, amount: "", percentage: "" },
  ]);
  const [newName, setNewName] = useState("");
  const [showAmlWarning, setShowAmlWarning] = useState(false);

  const total = Number(totalAmount) || 0;

  const addParticipant = () => {
    if (!newName.trim()) return;
    const existingUser = state.users.find(
      (u) => u.name.toLowerCase() === newName.trim().toLowerCase()
    );
    setParticipants([
      ...participants,
      {
        name: newName.trim(),
        userId: existingUser?.id || generateId(),
        amount: "",
        percentage: "",
      },
    ]);
    setNewName("");
  };

  const removeParticipant = (index: number) => {
    if (index === 0) return;
    setParticipants(participants.filter((_, i) => i !== index));
  };

  const getEqualAmount = () => {
    if (participants.length === 0) return 0;
    return Math.round(total / participants.length);
  };

  const getParticipantAmounts = (): number[] => {
    if (splitMethod === "equal") {
      return participants.map(() => getEqualAmount());
    }
    if (splitMethod === "custom") {
      return participants.map((p) => Number(p.amount) || 0);
    }
    return participants.map((p) => Math.round((total * (Number(p.percentage) || 0)) / 100));
  };

  const amounts = getParticipantAmounts();
  const amountsSum = amounts.reduce((a, b) => a + b, 0);

  const isValidSplit = () => {
    if (!title.trim() || total <= 0) return false;
    if (total > TRANSACTION_LIMIT) return false;
    if (participants.length < 2) return false;
    if (splitMethod === "custom" && amountsSum !== total) return false;
    if (splitMethod === "percentage") {
      const pctSum = participants.reduce((s, p) => s + (Number(p.percentage) || 0), 0);
      if (Math.abs(pctSum - 100) > 0.01) return false;
    }
    return true;
  };

  const handleCreate = () => {
    const finalAmounts = getParticipantAmounts();
    const newParticipants: Participant[] = participants.map((p, i) => ({
      userId: p.userId,
      name: p.name,
      amount: finalAmounts[i],
      status: p.userId === currentUser.id ? "paid" as const : "pending" as const,
      paidAt: p.userId === currentUser.id ? Date.now() : undefined,
    }));

    const newSplit: Split = {
      id: generateId(),
      title: title.trim(),
      description: description.trim() || undefined,
      totalAmount: total,
      currency: "NGN",
      createdBy: currentUser.id,
      splitMethod,
      participants: newParticipants,
      status: "active",
      createdAt: Date.now(),
    };

    const newState = addSplit(state, newSplit);
    updateState(newState);
    showToast("Split created! Share with your friends.", "success");
    onCreated();
  };

  return (
    <div>
      <h1 className="font-display font-bold text-xl text-surface-900 mb-6">Create a Split</h1>

      {/* ── Step: Details ── */}
      {step === "details" && (
        <div className="space-y-4 animate-fade-up">
          <div>
            <label className="section-label block mb-1.5">What&apos;s this for?</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Weekend Trip to Lekki"
              className="input-field w-full"
            />
          </div>

          <div>
            <label className="section-label block mb-1.5">Description (optional)</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Transport + food + activities"
              className="input-field w-full"
            />
          </div>

          <div>
            <label className="section-label block mb-1.5">Total Amount (NGN)</label>
            <input
              type="number"
              value={totalAmount}
              onChange={(e) => {
                setTotalAmount(e.target.value);
                const amt = Number(e.target.value) || 0;
                if (amt > TRANSACTION_LIMIT) {
                  showToast(`Maximum transaction limit is ${formatCurrency(TRANSACTION_LIMIT)}`, "error");
                }
                setShowAmlWarning(amt / Math.max(participants.length, 2) > AML_THRESHOLD);
              }}
              placeholder="15000"
              className="input-field w-full text-lg"
            />
            {total > 0 && (
              <p className="text-xs text-surface-400 mt-1.5">{formatCurrency(total)}</p>
            )}
            {total > TRANSACTION_LIMIT && (
              <p className="text-xs text-red-500 mt-1.5">
                Exceeds transaction limit of {formatCurrency(TRANSACTION_LIMIT)}
              </p>
            )}
          </div>

          {showAmlWarning && (
            <div className="glass-card border border-accent-300 bg-accent-50 rounded-2xl p-4">
              <div className="flex items-start gap-2.5">
                <span className="text-accent-500 text-base mt-0.5">&#9888;</span>
                <p className="text-xs text-accent-700 leading-relaxed">
                  <strong className="font-semibold">Large transaction notice:</strong> Individual shares
                  exceeding {formatCurrency(AML_THRESHOLD)} may be flagged for AML review per CBN guidelines.
                </p>
              </div>
            </div>
          )}

          <button
            onClick={() => setStep("participants")}
            disabled={!title.trim() || total <= 0 || total > TRANSACTION_LIMIT}
            className="btn-primary w-full"
          >
            Next: Add People
          </button>
        </div>
      )}

      {/* ── Step: Participants ── */}
      {step === "participants" && (
        <div className="animate-fade-up">
          <button
            onClick={() => setStep("details")}
            className="text-sm text-primary-600 font-semibold mb-4 flex items-center gap-1 hover:text-primary-700 transition-colors"
          >
            <span>&larr;</span> Back
          </button>
          <p className="text-sm text-surface-500 mb-4 font-body">
            Add everyone who&apos;s splitting this expense.
          </p>

          <div className="space-y-2 mb-4">
            {participants.map((p, i) => (
              <div
                key={i}
                className="glass-card rounded-2xl px-4 py-3 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="avatar w-9 h-9 text-xs flex items-center justify-center">
                    {p.name[0].toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-surface-900 font-body">{p.name}</span>
                </div>
                {i === 0 ? (
                  <span className="status-badge bg-primary-50 text-primary-700">You</span>
                ) : (
                  <button
                    onClick={() => removeParticipant(i)}
                    className="text-red-400 text-xs font-medium hover:text-red-500 transition-colors"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="flex gap-2 mb-6">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addParticipant()}
              placeholder="Add friend's name"
              className="input-field flex-1 text-sm"
            />
            <button
              onClick={addParticipant}
              disabled={!newName.trim()}
              className="px-4 py-3 bg-primary-600 text-white rounded-xl font-semibold text-sm disabled:opacity-40 hover:bg-primary-700 transition-colors"
            >
              Add
            </button>
          </div>

          <div className="mb-6">
            <p className="section-label mb-2">Quick add</p>
            <div className="flex gap-2 flex-wrap">
              {state.users
                .filter((u) => !participants.some((p) => p.userId === u.id))
                .map((u) => (
                  <button
                    key={u.id}
                    onClick={() =>
                      setParticipants([
                        ...participants,
                        { name: u.name, userId: u.id, amount: "", percentage: "" },
                      ])
                    }
                    className="text-xs bg-surface-100 text-surface-600 px-3 py-1.5 rounded-full hover:bg-primary-50 hover:text-primary-600 transition-colors font-medium"
                  >
                    + {u.name.split(" ")[0]}
                  </button>
                ))}
            </div>
          </div>

          <button
            onClick={() => setStep("method")}
            disabled={participants.length < 2}
            className="btn-primary w-full"
          >
            Next: Split Method
          </button>
          {participants.length < 2 && (
            <p className="text-xs text-red-400 mt-2 text-center font-body">
              Add at least one more person
            </p>
          )}
        </div>
      )}

      {/* ── Step: Method ── */}
      {step === "method" && (
        <div className="animate-fade-up">
          <button
            onClick={() => setStep("participants")}
            className="text-sm text-primary-600 font-semibold mb-4 flex items-center gap-1 hover:text-primary-700 transition-colors"
          >
            <span>&larr;</span> Back
          </button>
          <p className="text-sm text-surface-500 mb-4 font-body">
            How do you want to split {formatCurrency(total)}?
          </p>

          <div className="space-y-2 mb-6">
            {(["equal", "custom", "percentage"] as SplitMethod[]).map((method) => (
              <button
                key={method}
                onClick={() => setSplitMethod(method)}
                className={`w-full text-left px-4 py-3.5 rounded-2xl border transition-all ${
                  splitMethod === method
                    ? "border-primary-500 bg-primary-50 shadow-glow"
                    : "glass-card border-transparent"
                }`}
              >
                <span className="font-semibold text-sm text-surface-900 capitalize font-body">
                  {method} Split
                </span>
                <p className="text-xs text-surface-500 mt-0.5 font-body">
                  {method === "equal" && `${formatCurrency(getEqualAmount())} each`}
                  {method === "custom" && "Set custom amounts per person"}
                  {method === "percentage" && "Set percentage per person"}
                </p>
              </button>
            ))}
          </div>

          {splitMethod === "custom" && (
            <div className="space-y-2 mb-4">
              {participants.map((p, i) => (
                <div
                  key={i}
                  className="glass-card rounded-2xl px-4 py-2.5 flex items-center gap-3"
                >
                  <span className="text-sm text-surface-700 flex-1 font-body font-medium">
                    {p.name.split(" ")[0]}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-surface-400 font-mono">NGN</span>
                    <input
                      type="number"
                      value={p.amount}
                      onChange={(e) => {
                        const updated = [...participants];
                        updated[i] = { ...updated[i], amount: e.target.value };
                        setParticipants(updated);
                      }}
                      className="w-24 px-2 py-1 rounded-lg border border-surface-200 text-right text-sm text-surface-900 outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 bg-white/60 font-mono"
                      placeholder="0"
                    />
                  </div>
                </div>
              ))}
              <p
                className={`text-xs text-right font-semibold font-body ${
                  amountsSum === total ? "text-primary-600" : "text-red-500"
                }`}
              >
                Total: {formatCurrency(amountsSum)} / {formatCurrency(total)}
              </p>
            </div>
          )}

          {splitMethod === "percentage" && (
            <div className="space-y-2 mb-4">
              {participants.map((p, i) => (
                <div
                  key={i}
                  className="glass-card rounded-2xl px-4 py-2.5 flex items-center gap-3"
                >
                  <span className="text-sm text-surface-700 flex-1 font-body font-medium">
                    {p.name.split(" ")[0]}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      value={p.percentage}
                      onChange={(e) => {
                        const updated = [...participants];
                        updated[i] = { ...updated[i], percentage: e.target.value };
                        setParticipants(updated);
                      }}
                      className="w-16 px-2 py-1 rounded-lg border border-surface-200 text-right text-sm text-surface-900 outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 bg-white/60 font-mono"
                      placeholder="0"
                    />
                    <span className="text-xs text-surface-400">%</span>
                  </div>
                  <span className="text-xs text-surface-400 w-20 text-right font-mono">
                    {formatCurrency(Math.round((total * (Number(p.percentage) || 0)) / 100))}
                  </span>
                </div>
              ))}
              {(() => {
                const pctSum = participants.reduce((s, p) => s + (Number(p.percentage) || 0), 0);
                return (
                  <p
                    className={`text-xs text-right font-semibold font-body ${
                      Math.abs(pctSum - 100) < 0.01 ? "text-primary-600" : "text-red-500"
                    }`}
                  >
                    Total: {pctSum}% / 100%
                  </p>
                );
              })()}
            </div>
          )}

          <button
            onClick={() => setStep("review")}
            disabled={!isValidSplit()}
            className="btn-primary w-full"
          >
            Review Split
          </button>
        </div>
      )}

      {/* ── Step: Review ── */}
      {step === "review" && (
        <div className="animate-fade-up">
          <button
            onClick={() => setStep("method")}
            className="text-sm text-primary-600 font-semibold mb-4 flex items-center gap-1 hover:text-primary-700 transition-colors"
          >
            <span>&larr;</span> Back
          </button>

          <div className="glass-card rounded-2xl p-5 mb-5">
            <h3 className="font-display font-semibold text-surface-900 mb-0.5 text-base">{title}</h3>
            {description && (
              <p className="text-xs text-surface-500 mb-3 font-body">{description}</p>
            )}
            <p className="font-display text-2xl font-bold text-surface-900 mb-5">
              {formatCurrency(total)}
            </p>

            <div className="space-y-1">
              {participants.map((p, i) => (
                <div
                  key={i}
                  className="flex justify-between items-center py-2.5 border-b border-surface-100 last:border-0"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="avatar w-7 h-7 text-xs flex items-center justify-center">
                      {p.name[0].toUpperCase()}
                    </div>
                    <span className="text-sm text-surface-700 font-body">{p.name}</span>
                    {p.userId === currentUser.id && (
                      <span className="status-badge bg-primary-50 text-primary-700">You</span>
                    )}
                  </div>
                  <span className="text-sm font-semibold text-surface-900 font-mono">
                    {formatCurrency(amounts[i])}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-3 border-t border-surface-100 flex justify-between items-center">
              <span className="section-label">Split method</span>
              <span className="text-xs font-semibold text-surface-600 capitalize font-body">
                {splitMethod}
              </span>
            </div>
          </div>

          {amounts.some((a) => a > AML_THRESHOLD) && (
            <div className="glass-card border border-accent-300 bg-accent-50 rounded-2xl p-4 mb-5">
              <div className="flex items-start gap-2.5">
                <span className="text-accent-500 text-base mt-0.5">&#9888;</span>
                <p className="text-xs text-accent-700 leading-relaxed">
                  <strong className="font-semibold">AML Notice:</strong> One or more shares exceed{" "}
                  {formatCurrency(AML_THRESHOLD)}. Payments may be flagged for review.
                </p>
              </div>
            </div>
          )}

          <button onClick={handleCreate} className="btn-primary w-full">
            Create Split
          </button>
        </div>
      )}
    </div>
  );
}
