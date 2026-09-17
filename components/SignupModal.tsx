"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import TermsAndPrivacyModal from "@/components/TermsAndPrivacyModal";

interface SignUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function SignUpModal({ isOpen, onClose, onSuccess }: SignUpModalProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [showTermsModal, setShowTermsModal] = useState(false);
  const supabase = createClient();

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  // Reset form state whenever the modal is closed/reopened
  useEffect(() => {
    if (!isOpen) {
      setEmail("");
      setPassword("");
      setAgreedToTerms(false);
      setError("");
      setInfo("");
      setLoading(false);
    }
  }, [isOpen]);

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();

    if (!agreedToTerms) {
      setError("You must agree to the Terms of Service and Privacy Policy to sign up.");
      return;
    }

    setLoading(true);
    setError("");
    setInfo("");

    try {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;

      const isExistingUser = data.user && data.user.identities && data.user.identities.length === 0;

      if (isExistingUser) {
        setError("An account with this email already exists. Please sign in instead.");
        return;
      }

      if (data.user && !data.session) {
        setInfo("Please check your email for a confirmation link");
        return;
      }

      onSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen) return null;

  return (
    <>
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fadeIn"
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-md w-full animate-scaleIn"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-8 pt-6 pb-4">
            <h2 className="text-2xl font-bold text-gray-700 dark:text-white">
              Sign Up
            </h2>
            <button
              onClick={onClose}
              aria-label="Close"
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-2xl leading-none transition-colors duration-200"
            >
              &times;
            </button>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700" />

          {/* Form */}
          <form onSubmit={handleSignUp} className="px-8 py-8 space-y-6">
            <div>
              <input
                id="signup-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your Email"
                className="w-full pb-2 border-0 border-b border-gray-300 dark:border-gray-600 bg-transparent text-gray-700 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-pink-500 transition-colors duration-200"
              />
            </div>

            <div>
              <input
                id="signup-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your Password"
                className="w-full pb-2 border-0 border-b border-gray-300 dark:border-gray-600 bg-transparent text-gray-700 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-pink-500 transition-colors duration-200"
              />
            </div>

            {/* Terms checkbox, built into this modal */}
            <div className="flex items-start gap-2">
              <input
                id="agree-terms"
                type="checkbox"
                required
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-gray-300 text-pink-600 focus:ring-pink-500"
              />
              <label htmlFor="agree-terms" className="text-sm text-gray-600 dark:text-gray-400">
                I have read and agree to the{" "}
                <button
                  type="button"
                  onClick={() => setShowTermsModal(true)}
                  className="text-pink-600 dark:text-pink-400 hover:text-pink-500 dark:hover:text-pink-300 underline"
                >
                  Terms of Service and Privacy Policy
                </button>
              </label>
            </div>

            {error && (
              <div className="text-red-600 dark:text-red-400 text-sm">
                {error}
              </div>
            )}
            {info && (
              <div className="text-green-600 dark:text-green-400 text-sm">
                {info}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !agreedToTerms}
              className="w-full py-3 rounded-md text-white font-medium tracking-wide bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 transition-all duration-200 disabled:opacity-50"
            >
              {loading ? "Loading..." : "SIGN UP"}
            </button>
          </form>
        </div>
      </div>

      <TermsAndPrivacyModal
        isOpen={showTermsModal}
        onClose={() => setShowTermsModal(false)}
      />
    </>
  );
}