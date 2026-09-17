"use client";
import { useEffect, useState } from "react";

interface TermsAndPrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: "terms" | "privacy";
}

export default function TermsAndPrivacyModal({
  isOpen,
  onClose,
  initialTab = "terms",
}: TermsAndPrivacyModalProps) {
  const [activeTab, setActiveTab] = useState<"terms" | "privacy">(initialTab);

  useEffect(() => {
    if (isOpen) setActiveTab(initialTab);
  }, [isOpen, initialTab]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fadeIn"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col animate-scaleIn"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-8 pt-6 pb-4">
          <h2 className="text-2xl font-bold text-gray-700 dark:text-white">
            Terms &amp; Privacy
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-2xl leading-none transition-colors duration-200"
          >
            &times;
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 px-8 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab("terms")}
            className={`pb-3 text-sm font-medium border-b-2 transition-colors duration-200 ${
              activeTab === "terms"
                ? "border-pink-500 text-pink-600 dark:text-pink-400"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            Terms of Service
          </button>
          <button
            onClick={() => setActiveTab("privacy")}
            className={`pb-3 text-sm font-medium border-b-2 transition-colors duration-200 ${
              activeTab === "privacy"
                ? "border-pink-500 text-pink-600 dark:text-pink-400"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            Privacy Policy
          </button>
        </div>

        {/* Scrollable content */}
        <div className="px-8 py-6 overflow-y-auto text-gray-700 dark:text-gray-300 text-sm leading-relaxed space-y-5">
          {activeTab === "terms" ? <TermsContent /> : <PrivacyContent />}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 dark:border-gray-700 px-8 py-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md text-white font-medium bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 transition-all duration-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function TermsContent() {
  return (
    <>
      <p className="text-xs text-gray-400">Last updated: [DATE]</p>

      <div>
        <h3 className="font-semibold text-base mb-1">1. Acceptance of Terms</h3>
        <p>
          By creating an account or using Duoqueue ("the Service"), you agree to be
          bound by these Terms of Service. If you do not agree, do not use the Service.
        </p>
      </div>

      <div>
        <h3 className="font-semibold text-base mb-1">2. Eligibility</h3>
        <p>
          You must be at least 18 years old to use the Service.
        </p>
      </div>

      <div>
        <h3 className="font-semibold text-base mb-1">3. Accounts</h3>
        <p>
          You're responsible for maintaining the confidentiality of your account
          credentials and for all activity under your account.
        </p>
      </div>

      <div>
        <h3 className="font-semibold text-base mb-1">4. Acceptable Use</h3>
        <p>You agree not to:</p>
        <ul className="list-disc pl-5 mt-1 space-y-1">
          <li>Use the Service for any unlawful purpose</li>
          <li>Harass, abuse, or harm other users</li>
          <li>Attempt to gain unauthorized access to the Service or other accounts</li>
          <li>Interfere with or disrupt the Service's operation</li>
          <li>Impersonate any person or entity</li>
        </ul>
      </div>

      <div>
        <h3 className="font-semibold text-base mb-1">5. User Content</h3>
        <p>
          You retain ownership of content you submit. By submitting content, you grant
          us a non-exclusive, worldwide, royalty-free license to use, display, and
          distribute it as necessary to operate the Service.
        </p>
      </div>

      <div>
        <h3 className="font-semibold text-base mb-1">6. Termination</h3>
        <p>
          We may suspend or terminate your account for violation of these Terms. You
          may stop using the Service and request account deletion at any time.
        </p>
      </div>

      <div>
        <h3 className="font-semibold text-base mb-1">7. Disclaimers</h3>
        <p>
          The Service is provided "as is" without warranties of any kind. We do not
          guarantee it will be uninterrupted, secure, or error-free.
        </p>
      </div>

      <div>
        <h3 className="font-semibold text-base mb-1">8. Limitation of Liability</h3>
        <p>
          To the maximum extent permitted by law, CTRL-ALT-SOLUTIONS shall not be liable
          for indirect, incidental, or consequential damages arising from your use of
          the Service.
        </p>
      </div>

      <div>
        <h3 className="font-semibold text-base mb-1">9. Changes to Terms</h3>
        <p>
          We may update these Terms from time to time. Continued use after changes
          take effect constitutes acceptance of the revised Terms.
        </p>
      </div>

      <div>
        <h3 className="font-semibold text-base mb-1">10. Contact</h3>
        <p>Questions? Contact us!.</p>
      </div>
    </>
  );
}

function PrivacyContent() {
  return (
    <>
      <p className="text-xs text-gray-400">Last updated: [DATE]</p>

      <div>
        <h3 className="font-semibold text-base mb-1">1. Information We Collect</h3>
        <p>
          When you create an account, we collect your email address and password
          (stored securely and hashed via Supabase Auth). We may also collect usage
          data such as pages visited and actions taken within the Service.
        </p>
      </div>

      <div>
        <h3 className="font-semibold text-base mb-1">2. How We Use Your Information</h3>
        <ul className="list-disc pl-5 mt-1 space-y-1">
          <li>To create and manage your account</li>
          <li>To provide, maintain, and improve the Service</li>
          <li>To communicate with you about your account or updates</li>
          <li>To detect, prevent, and address fraud or abuse</li>
        </ul>
      </div>

      <div>
        <h3 className="font-semibold text-base mb-1">3. Data Storage</h3>
        <p>
          Your data is stored and processed by Supabase, our backend infrastructure
          provider. We take reasonable measures to protect your data but cannot
          guarantee absolute security.
        </p>
      </div>

      <div>
        <h3 className="font-semibold text-base mb-1">4. Sharing of Information</h3>
        <p>
          We do not sell your personal information. We may share data with service
          providers who help us operate the Service (e.g., hosting, authentication),
          or when required by law.
        </p>
      </div>

      <div>
        <h3 className="font-semibold text-base mb-1">5. Cookies</h3>
        <p>
          We may use cookies or similar technologies to keep you signed in and
          understand how the Service is used.
        </p>
      </div>

      <div>
        <h3 className="font-semibold text-base mb-1">6. Your Rights</h3>
        <p>
          You may request access to, correction of, or deletion of your personal data
          at any time by contacting us. You may also delete your account directly.
        </p>
      </div>

      <div>
        <h3 className="font-semibold text-base mb-1">7. Children's Privacy</h3>
        <p>
          The Service is not directed at users under 18, and we do not knowingly
          collect data from them.
        </p>
      </div>

      <div>
        <h3 className="font-semibold text-base mb-1">8. Changes to This Policy</h3>
        <p>
          We may update this Privacy Policy from time to time. Continued use after
          changes take effect constitutes acceptance.
        </p>
      </div>

      <div>
        <h3 className="font-semibold text-base mb-1">9. Contact</h3>
        <p>Questions about this policy? Contact us!.</p>
      </div>
    </>
  );
}