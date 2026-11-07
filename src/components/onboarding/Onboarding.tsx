"use client";

import { useState } from "react";
import { AppState } from "@/lib/types";
import { verifyBvn } from "@/lib/utils";

interface Props {
  state: AppState;
  onComplete: (state: AppState) => void;
}

type Step = "welcome" | "info" | "bvn" | "verifying" | "result";

export default function Onboarding({ state, onComplete }: Props) {
  const [step, setStep] = useState<Step>("welcome");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [bvn, setBvn] = useState("");
  const [kycResult, setKycResult] = useState<{ valid: boolean; reason?: string } | null>(null);

  const handleVerify = () => {
    setStep("verifying");
    setTimeout(() => {
      const result = verifyBvn(bvn);
      setKycResult(result);
      setStep("result");
    }, 1500);
  };

  const handleComplete = () => {
    const user = state.users.find((u) => u.id === state.currentUserId)!;
    const updatedUser = {
      ...user,
      name: name || user.name,
      phone: phone || user.phone,
      email: email || user.email,
      bvn,
      kycStatus: kycResult?.valid ? "verified" as const : "failed" as const,
      kycFailReason: kycResult?.reason,
    };
    const updatedState: AppState = {
      ...state,
      users: state.users.map((u) => (u.id === updatedUser.id ? updatedUser : u)),
    };
    onComplete(updatedState);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Progress bar */}
      <div className="h-1 bg-gray-100">
        <div
          className="h-full bg-primary-500 transition-all duration-300"
          style={{
            width:
              step === "welcome" ? "20%" :
              step === "info" ? "40%" :
              step === "bvn" ? "60%" :
              step === "verifying" ? "80%" :
              "100%",
          }}
        />
      </div>

      <div className="flex-1 flex flex-col justify-center p-6">
        {/* Welcome */}
        {step === "welcome" && (
          <div className="text-center">
            <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">💸</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Split & Settle</h1>
            <p className="text-gray-500 mb-8">
              Split expenses with friends. No more chasing payments on WhatsApp.
            </p>
            <button
              onClick={() => setStep("info")}
              className="w-full bg-primary-600 text-white py-3.5 rounded-xl font-semibold text-base hover:bg-primary-700 transition-colors"
            >
              Get Started
            </button>
          </div>
        )}

        {/* Personal info */}
        {step === "info" && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">Your Details</h2>
            <p className="text-sm text-gray-500 mb-6">We need this to set up your account.</p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Tunde Adeyemi"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="08012345678"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tunde@example.com"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all text-gray-900"
                />
              </div>
            </div>
            <button
              onClick={() => setStep("bvn")}
              disabled={!name || !phone || !email}
              className="w-full mt-6 bg-primary-600 text-white py-3.5 rounded-xl font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary-700 transition-colors"
            >
              Continue
            </button>
          </div>
        )}

        {/* BVN verification */}
        {step === "bvn" && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">KYC Verification</h2>
            <p className="text-sm text-gray-500 mb-2">
              Enter your Bank Verification Number (BVN) to verify your identity.
            </p>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-6">
              <p className="text-xs text-amber-800">
                <strong>Why we need this:</strong> CBN regulations require identity verification for all financial services. Your BVN is encrypted and never shared.
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">BVN (11 digits)</label>
              <input
                type="text"
                value={bvn}
                onChange={(e) => setBvn(e.target.value.replace(/\D/g, "").slice(0, 11))}
                placeholder="22233344455"
                maxLength={11}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all text-gray-900 tracking-widest text-center text-lg"
              />
              <p className="text-xs text-gray-400 mt-1 text-center">{bvn.length}/11 digits</p>
            </div>
            <button
              onClick={handleVerify}
              disabled={bvn.length !== 11}
              className="w-full mt-6 bg-primary-600 text-white py-3.5 rounded-xl font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary-700 transition-colors"
            >
              Verify Identity
            </button>
          </div>
        )}

        {/* Verifying spinner */}
        {step === "verifying" && (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-6" />
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Verifying your BVN...</h2>
            <p className="text-sm text-gray-500">This usually takes a few seconds.</p>
          </div>
        )}

        {/* Result */}
        {step === "result" && kycResult && (
          <div className="text-center">
            {kycResult.valid ? (
              <>
                <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Identity Verified!</h2>
                <p className="text-sm text-gray-500 mb-8">
                  Your BVN has been verified. You&apos;re all set to start splitting expenses.
                </p>
                <button
                  onClick={handleComplete}
                  className="w-full bg-primary-600 text-white py-3.5 rounded-xl font-semibold hover:bg-primary-700 transition-colors"
                >
                  Go to Dashboard
                </button>
              </>
            ) : (
              <>
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Verification Failed</h2>
                <p className="text-sm text-red-600 font-medium mb-2">{kycResult.reason}</p>
                <p className="text-sm text-gray-500 mb-8">
                  You cannot access Split & Settle without a verified identity. This is required by CBN regulations.
                </p>
                <div className="space-y-3">
                  <button
                    onClick={() => { setBvn(""); setStep("bvn"); }}
                    className="w-full bg-gray-100 text-gray-700 py-3.5 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                  >
                    Try Again
                  </button>
                  <button className="w-full text-primary-600 py-2 text-sm font-medium">
                    Contact Support
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
