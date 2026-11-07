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
      kycStatus: kycResult?.valid ? ("verified" as const) : ("failed" as const),
      kycFailReason: kycResult?.reason,
    };
    const updatedState: AppState = {
      ...state,
      users: state.users.map((u) => (u.id === updatedUser.id ? updatedUser : u)),
    };
    onComplete(updatedState);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-surface-50 flex flex-col">
      {/* Progress bar */}
      <div className="h-1.5 bg-surface-100 overflow-hidden">
        <div
          className="h-full bg-primary-500 rounded-r-full transition-all duration-500 ease-out"
          style={{
            width:
              step === "welcome"
                ? "20%"
                : step === "info"
                ? "40%"
                : step === "bvn"
                ? "60%"
                : step === "verifying"
                ? "80%"
                : "100%",
          }}
        />
      </div>

      <div className="flex-1 flex flex-col justify-center p-6 max-w-sm mx-auto w-full">

        {/* Welcome */}
        {step === "welcome" && (
          <div className="text-center animate-fade-up">
            <div className="flex justify-center mb-8">
              <div className="w-28 h-28 rounded-full bg-gradient-to-br from-primary-400 to-primary-700 flex items-center justify-center shadow-[0_0_40px_rgba(34,197,94,0.35)]">
                {/* Naira symbol SVG */}
                <svg
                  className="w-14 h-14 text-white"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path
                    d="M5 5h3l8 14h3M5 19h3M19 5h-3M6 10h12M6 14h12"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
            <h1 className="font-display font-bold text-3xl gradient-text mb-3">
              Split &amp; Settle
            </h1>
            <p className="text-surface-500 font-body text-base leading-relaxed mb-10 max-w-xs mx-auto">
              Split expenses with friends. No more chasing payments on WhatsApp.
            </p>
            <button
              onClick={() => setStep("info")}
              className="btn-primary w-full text-base"
            >
              Get Started
            </button>
          </div>
        )}

        {/* Personal info */}
        {step === "info" && (
          <div className="animate-fade-up">
            <h2 className="font-display text-2xl font-bold text-surface-900 mb-1">
              Your Details
            </h2>
            <p className="font-body text-sm text-surface-500 mb-8">
              We need this to set up your account.
            </p>
            <div className="space-y-5">
              <div>
                <label className="block text-surface-500 font-medium text-xs uppercase tracking-wider mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Tunde Adeyemi"
                  className="input-field w-full"
                />
              </div>
              <div>
                <label className="block text-surface-500 font-medium text-xs uppercase tracking-wider mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="08012345678"
                  className="input-field w-full"
                />
              </div>
              <div>
                <label className="block text-surface-500 font-medium text-xs uppercase tracking-wider mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tunde@example.com"
                  className="input-field w-full"
                />
              </div>
            </div>
            <button
              onClick={() => setStep("bvn")}
              disabled={!name || !phone || !email}
              className="btn-primary w-full mt-8 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
            >
              Continue
            </button>
          </div>
        )}

        {/* BVN verification */}
        {step === "bvn" && (
          <div className="animate-fade-up">
            <h2 className="font-display text-2xl font-bold text-surface-900 mb-1">
              KYC Verification
            </h2>
            <p className="font-body text-sm text-surface-500 mb-5">
              Enter your Bank Verification Number (BVN) to verify your identity.
            </p>

            {/* Compliance notice */}
            <div className="glass-card rounded-2xl p-4 mb-7 border border-amber-300/40 border-l-4 border-l-amber-400">
              <div className="flex items-start gap-3">
                <svg
                  className="w-4 h-4 text-amber-500 mt-0.5 shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
                    clipRule="evenodd"
                  />
                </svg>
                <p className="text-xs text-amber-700 leading-relaxed">
                  <strong className="text-amber-800 font-semibold">Why we need this:</strong>{" "}
                  CBN regulations require identity verification for all financial services. Your BVN is encrypted and never shared.
                </p>
              </div>
            </div>

            <div>
              <label className="block text-surface-500 font-medium text-xs uppercase tracking-wider mb-2 text-center">
                BVN (11 digits)
              </label>
              <input
                type="text"
                value={bvn}
                onChange={(e) =>
                  setBvn(e.target.value.replace(/\D/g, "").slice(0, 11))
                }
                placeholder="· · · · · · · · · · ·"
                maxLength={11}
                className="input-field w-full text-center font-display tracking-[0.3em] text-2xl"
              />
              <div className="flex justify-center mt-2.5">
                <span
                  className={`text-xs font-medium tabular-nums transition-colors ${
                    bvn.length === 11
                      ? "text-primary-600"
                      : bvn.length > 0
                      ? "text-surface-400"
                      : "text-surface-300"
                  }`}
                >
                  {bvn.length}
                  <span className="text-surface-300">/11</span>
                </span>
              </div>
            </div>

            <button
              onClick={handleVerify}
              disabled={bvn.length !== 11}
              className="btn-primary w-full mt-7 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
            >
              Verify Identity
            </button>
          </div>
        )}

        {/* Verifying spinner */}
        {step === "verifying" && (
          <div className="text-center animate-fade-up">
            <div className="flex justify-center mb-8">
              <div className="w-12 h-12 rounded-full border-[3px] border-primary-100 border-t-primary-600 animate-spin" />
            </div>
            <h2 className="font-display text-xl font-semibold text-surface-800 mb-2 animate-pulse">
              Verifying your BVN&hellip;
            </h2>
            <p className="font-body text-sm text-surface-500">
              This usually takes a few seconds.
            </p>
          </div>
        )}

        {/* Result */}
        {step === "result" && kycResult && (
          <div className="text-center animate-fade-up">
            {kycResult.valid ? (
              <>
                <div className="flex justify-center mb-7">
                  <div className="w-24 h-24 bg-gradient-to-br from-primary-400 to-primary-700 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(34,197,94,0.35)]">
                    <svg
                      className="w-11 h-11 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                </div>
                <h2 className="font-display text-2xl font-bold text-surface-900 mb-3">
                  Identity Verified!
                </h2>
                <p className="font-body text-sm text-surface-500 leading-relaxed mb-10 max-w-xs mx-auto">
                  Your BVN has been verified. You&apos;re all set to start
                  splitting expenses.
                </p>
                <button onClick={handleComplete} className="btn-primary w-full">
                  Go to Dashboard
                </button>
              </>
            ) : (
              <>
                <div className="flex justify-center mb-7">
                  <div className="w-24 h-24 bg-gradient-to-br from-red-400 to-red-700 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(239,68,68,0.35)]">
                    <svg
                      className="w-11 h-11 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </div>
                </div>
                <h2 className="font-display text-2xl font-bold text-surface-900 mb-2">
                  Verification Failed
                </h2>
                <p className="font-body text-sm text-red-500 font-medium mb-3">
                  {kycResult.reason}
                </p>
                <p className="font-body text-sm text-surface-500 leading-relaxed mb-10 max-w-xs mx-auto">
                  You cannot access Split &amp; Settle without a verified
                  identity. This is required by CBN regulations.
                </p>
                <div className="space-y-3">
                  <button
                    onClick={() => {
                      setBvn("");
                      setStep("bvn");
                    }}
                    className="btn-primary w-full"
                  >
                    Try Again
                  </button>
                  <button className="w-full py-3 text-sm font-medium text-surface-400 hover:text-surface-600 underline underline-offset-2 transition-colors">
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
