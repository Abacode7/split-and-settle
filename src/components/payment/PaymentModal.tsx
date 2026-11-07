"use client";

import { useState } from "react";
import { AppState, User, Split, Transaction } from "@/lib/types";
import { addTransaction, updateSplit } from "@/lib/store";
import { formatCurrency, generateId, generateRef, AML_THRESHOLD } from "@/lib/utils";

interface Props {
  split: Split;
  state: AppState;
  currentUser: User;
  updateState: (state: AppState) => void;
  showToast: (msg: string, type?: "success" | "error" | "warning" | "info") => void;
  onClose: () => void;
}

type PayStep = "summary" | "card" | "processing" | "result";
type PayResult = "success" | "failed" | "flagged";

export default function PaymentModal({ split, state, currentUser, updateState, showToast, onClose }: Props) {
  const [step, setStep] = useState<PayStep>("summary");
  const [result, setResult] = useState<PayResult>("success");
  const [cardNumber, setCardNumber] = useState("5399 8300 0000 0000");
  const [expiry, setExpiry] = useState("12/28");
  const [cvv, setCvv] = useState("123");
  const [simulateFailure, setSimulateFailure] = useState(false);

  const myParticipant = split.participants.find((p) => p.userId === currentUser.id);
  const amount = myParticipant?.amount || 0;
  const organizer = state.users.find((u) => u.id === split.createdBy);
  const isAmlAmount = amount > AML_THRESHOLD;

  const handlePay = () => {
    setStep("processing");

    setTimeout(() => {
      let payResult: PayResult;
      if (simulateFailure) {
        payResult = "failed";
      } else if (isAmlAmount) {
        payResult = "flagged";
      } else {
        payResult = "success";
      }

      setResult(payResult);

      const tx: Transaction = {
        id: generateId(),
        splitId: split.id,
        payerId: currentUser.id,
        receiverId: split.createdBy,
        amount,
        currency: "NGN",
        status: payResult === "success" ? "success" : payResult === "failed" ? "failed" : "held",
        failReason: payResult === "failed" ? "Insufficient funds" : undefined,
        amlFlagged: payResult === "flagged",
        reference: generateRef(),
        createdAt: Date.now(),
      };

      let newState = addTransaction(state, tx);

      const updatedParticipants = split.participants.map((p) =>
        p.userId === currentUser.id
          ? {
              ...p,
              status: (payResult === "success" ? "paid" : payResult === "failed" ? "failed" : "flagged") as typeof p.status,
              paidAt: payResult === "success" ? Date.now() : undefined,
              transactionRef: tx.reference,
            }
          : p
      );

      const allPaid = updatedParticipants.every((p) => p.status === "paid");
      newState = updateSplit(newState, split.id, {
        participants: updatedParticipants,
        status: allPaid ? "settled" : "active",
        settledAt: allPaid ? Date.now() : undefined,
      });

      updateState(newState);
      setStep("result");
    }, 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-40 flex items-end justify-center">
      <div className="bg-white w-full max-w-[480px] rounded-t-2xl p-6 animate-slide-up">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-gray-900">
            {step === "result" ? "" : "Pay Your Share"}
          </h2>
          {step !== "processing" && (
            <button onClick={onClose} className="text-gray-400 text-sm">Close</button>
          )}
        </div>

        {step === "summary" && (
          <div>
            <div className="bg-gray-50 rounded-xl p-4 mb-4">
              <p className="text-xs text-gray-500">Paying for</p>
              <p className="font-semibold text-gray-900">{split.title}</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{formatCurrency(amount)}</p>
              <p className="text-xs text-gray-400 mt-1">To: {organizer?.name || "Organizer"}</p>
            </div>
            {isAmlAmount && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4">
                <p className="text-xs text-amber-800">
                  <strong>Notice:</strong> This amount exceeds {formatCurrency(AML_THRESHOLD)} and will be subject to AML review.
                </p>
              </div>
            )}
            <button
              onClick={() => setStep("card")}
              className="w-full bg-primary-600 text-white py-3.5 rounded-xl font-semibold hover:bg-primary-700 transition-colors"
            >
              Pay with Paystack
            </button>
          </div>
        )}

        {step === "card" && (
          <div>
            <div className="space-y-3 mb-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Card Number</label>
                <input type="text" value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Expiry</label>
                  <input type="text" value={expiry} onChange={(e) => setExpiry(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">CVV</label>
                  <input type="text" value={cvv} onChange={(e) => setCvv(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 text-sm" />
                </div>
              </div>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 mb-4">
              <p className="text-[10px] text-gray-400 uppercase font-semibold mb-2">Demo Controls</p>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={simulateFailure} onChange={(e) => setSimulateFailure(e.target.checked)} className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                <span className="text-xs text-gray-600">Simulate payment failure</span>
              </label>
            </div>
            <button onClick={handlePay} className="w-full bg-[#0BA4DB] text-white py-3.5 rounded-xl font-semibold hover:opacity-90 transition-opacity">
              Pay {formatCurrency(amount)}
            </button>
            <p className="text-center text-[10px] text-gray-400 mt-2">Secured by Paystack (mocked)</p>
          </div>
        )}

        {step === "processing" && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0BA4DB] mx-auto mb-4" />
            <p className="text-sm font-medium text-gray-700">Processing payment...</p>
            <p className="text-xs text-gray-400 mt-1">Please do not close this screen</p>
          </div>
        )}

        {step === "result" && (
          <div className="text-center py-4">
            {result === "success" && (
              <>
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">Payment Successful!</h3>
                <p className="text-sm text-gray-500">{formatCurrency(amount)} sent to {organizer?.name}</p>
              </>
            )}
            {result === "failed" && (
              <>
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">Payment Failed</h3>
                <p className="text-sm text-red-600 mb-4">Insufficient funds</p>
                <div className="space-y-2">
                  <button onClick={() => { setSimulateFailure(false); setStep("card"); }} className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-medium text-sm">Retry Payment</button>
                  <button
                    onClick={() => {
                      const newState = updateSplit(state, split.id, { status: "disputed" });
                      updateState(newState);
                      showToast("Dispute raised. The organizer has been notified.", "warning");
                      onClose();
                    }}
                    className="w-full text-red-600 py-2 text-sm font-medium"
                  >
                    Raise Dispute
                  </button>
                </div>
              </>
            )}
            {result === "flagged" && (
              <>
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">Transaction Held for Review</h3>
                <p className="text-sm text-amber-700 mb-2">This transaction exceeds {formatCurrency(AML_THRESHOLD)} and has been flagged for AML review.</p>
                <p className="text-xs text-gray-500 mb-4">You will be notified within 24 hours. Your funds are safe.</p>
              </>
            )}
            {(result === "success" || result === "flagged") && (
              <button onClick={onClose} className="w-full bg-primary-600 text-white py-3 rounded-xl font-semibold mt-4">Done</button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
