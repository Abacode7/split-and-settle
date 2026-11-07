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
      <h1 className="text-xl font-bold text-gray-900 mb-6">Create a Split</h1>

      {step === "details" && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">What&apos;s this for?</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Weekend Trip to Lekki"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none text-gray-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description (optional)</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Transport + food + activities"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none text-gray-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Total Amount (NGN)</label>
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
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none text-gray-900 text-lg"
            />
            {total > 0 && (
              <p className="text-xs text-gray-400 mt-1">{formatCurrency(total)}</p>
            )}
            {total > TRANSACTION_LIMIT && (
              <p className="text-xs text-red-500 mt-1">Exceeds transaction limit of {formatCurrency(TRANSACTION_LIMIT)}</p>
            )}
          </div>
          {showAmlWarning && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
              <p className="text-xs text-amber-800">
                <strong>Large transaction notice:</strong> Individual shares exceeding {formatCurrency(AML_THRESHOLD)} may be flagged for AML review per CBN guidelines.
              </p>
            </div>
          )}
          <button
            onClick={() => setStep("participants")}
            disabled={!title.trim() || total <= 0 || total > TRANSACTION_LIMIT}
            className="w-full bg-primary-600 text-white py-3.5 rounded-xl font-semibold disabled:opacity-40 hover:bg-primary-700 transition-colors"
          >
            Next: Add People
          </button>
        </div>
      )}

      {step === "participants" && (
        <div>
          <button onClick={() => setStep("details")} className="text-sm text-primary-600 mb-4">&larr; Back</button>
          <p className="text-sm text-gray-500 mb-4">Add everyone who&apos;s splitting this expense.</p>

          <div className="space-y-2 mb-4">
            {participants.map((p, i) => (
              <div key={i} className="flex items-center justify-between bg-white rounded-xl px-4 py-3 border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-sm font-semibold text-primary-600">
                    {p.name[0]}
                  </div>
                  <span className="text-sm font-medium text-gray-900">{p.name}</span>
                </div>
                {i === 0 ? (
                  <span className="text-[10px] font-medium text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full">You</span>
                ) : (
                  <button onClick={() => removeParticipant(i)} className="text-red-400 text-xs">Remove</button>
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
              className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none text-sm text-gray-900"
            />
            <button
              onClick={addParticipant}
              disabled={!newName.trim()}
              className="px-4 py-3 bg-primary-600 text-white rounded-xl font-medium text-sm disabled:opacity-40"
            >
              Add
            </button>
          </div>

          <div className="mb-6">
            <p className="text-xs text-gray-400 mb-2">Quick add:</p>
            <div className="flex gap-2 flex-wrap">
              {state.users
                .filter((u) => !participants.some((p) => p.userId === u.id))
                .map((u) => (
                  <button
                    key={u.id}
                    onClick={() => setParticipants([...participants, { name: u.name, userId: u.id, amount: "", percentage: "" }])}
                    className="text-xs bg-gray-100 text-gray-600 px-3 py-1.5 rounded-full hover:bg-primary-50 hover:text-primary-600 transition-colors"
                  >
                    + {u.name.split(" ")[0]}
                  </button>
                ))}
            </div>
          </div>

          <button
            onClick={() => setStep("method")}
            disabled={participants.length < 2}
            className="w-full bg-primary-600 text-white py-3.5 rounded-xl font-semibold disabled:opacity-40 hover:bg-primary-700 transition-colors"
          >
            Next: Split Method
          </button>
          {participants.length < 2 && (
            <p className="text-xs text-red-400 mt-2 text-center">Add at least one more person</p>
          )}
        </div>
      )}

      {step === "method" && (
        <div>
          <button onClick={() => setStep("participants")} className="text-sm text-primary-600 mb-4">&larr; Back</button>
          <p className="text-sm text-gray-500 mb-4">How do you want to split {formatCurrency(total)}?</p>

          <div className="space-y-2 mb-6">
            {(["equal", "custom", "percentage"] as SplitMethod[]).map((method) => (
              <button
                key={method}
                onClick={() => setSplitMethod(method)}
                className={`w-full text-left px-4 py-3 rounded-xl border transition-colors ${
                  splitMethod === method
                    ? "border-primary-500 bg-primary-50"
                    : "border-gray-200 bg-white"
                }`}
              >
                <span className="font-medium text-sm text-gray-900 capitalize">{method} Split</span>
                <p className="text-xs text-gray-500 mt-0.5">
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
                <div key={i} className="flex items-center gap-3 bg-white rounded-xl px-4 py-2 border border-gray-100">
                  <span className="text-sm text-gray-700 flex-1">{p.name.split(" ")[0]}</span>
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-gray-400">NGN</span>
                    <input
                      type="number"
                      value={p.amount}
                      onChange={(e) => {
                        const updated = [...participants];
                        updated[i] = { ...updated[i], amount: e.target.value };
                        setParticipants(updated);
                      }}
                      className="w-24 px-2 py-1 rounded-lg border border-gray-200 text-right text-sm text-gray-900"
                      placeholder="0"
                    />
                  </div>
                </div>
              ))}
              <p className={`text-xs text-right ${amountsSum === total ? "text-primary-600" : "text-red-500"}`}>
                Total: {formatCurrency(amountsSum)} / {formatCurrency(total)}
              </p>
            </div>
          )}

          {splitMethod === "percentage" && (
            <div className="space-y-2 mb-4">
              {participants.map((p, i) => (
                <div key={i} className="flex items-center gap-3 bg-white rounded-xl px-4 py-2 border border-gray-100">
                  <span className="text-sm text-gray-700 flex-1">{p.name.split(" ")[0]}</span>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={p.percentage}
                      onChange={(e) => {
                        const updated = [...participants];
                        updated[i] = { ...updated[i], percentage: e.target.value };
                        setParticipants(updated);
                      }}
                      className="w-16 px-2 py-1 rounded-lg border border-gray-200 text-right text-sm text-gray-900"
                      placeholder="0"
                    />
                    <span className="text-xs text-gray-400">%</span>
                  </div>
                  <span className="text-xs text-gray-400 w-20 text-right">
                    {formatCurrency(Math.round((total * (Number(p.percentage) || 0)) / 100))}
                  </span>
                </div>
              ))}
              {(() => {
                const pctSum = participants.reduce((s, p) => s + (Number(p.percentage) || 0), 0);
                return (
                  <p className={`text-xs text-right ${Math.abs(pctSum - 100) < 0.01 ? "text-primary-600" : "text-red-500"}`}>
                    Total: {pctSum}% / 100%
                  </p>
                );
              })()}
            </div>
          )}

          <button
            onClick={() => setStep("review")}
            disabled={!isValidSplit()}
            className="w-full bg-primary-600 text-white py-3.5 rounded-xl font-semibold disabled:opacity-40 hover:bg-primary-700 transition-colors"
          >
            Review Split
          </button>
        </div>
      )}

      {step === "review" && (
        <div>
          <button onClick={() => setStep("method")} className="text-sm text-primary-600 mb-4">&larr; Back</button>

          <div className="bg-white rounded-xl border border-gray-100 p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
            {description && <p className="text-xs text-gray-500 mb-3">{description}</p>}
            <p className="text-2xl font-bold text-gray-900 mb-4">{formatCurrency(total)}</p>

            <div className="space-y-2">
              {participants.map((p, i) => (
                <div key={i} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-primary-100 flex items-center justify-center text-xs font-semibold text-primary-600">
                      {p.name[0]}
                    </div>
                    <span className="text-sm text-gray-700">{p.name}</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">{formatCurrency(amounts[i])}</span>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between">
              <span className="text-xs text-gray-400 uppercase">Split method</span>
              <span className="text-xs font-medium text-gray-600 capitalize">{splitMethod}</span>
            </div>
          </div>

          {amounts.some((a) => a > AML_THRESHOLD) && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4">
              <p className="text-xs text-amber-800">
                <strong>AML Notice:</strong> One or more shares exceed {formatCurrency(AML_THRESHOLD)}. Payments may be flagged for review.
              </p>
            </div>
          )}

          <button
            onClick={handleCreate}
            className="w-full bg-primary-600 text-white py-3.5 rounded-xl font-semibold hover:bg-primary-700 transition-colors"
          >
            Create Split
          </button>
        </div>
      )}
    </div>
  );
}
