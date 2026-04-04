import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — Pevzner Foundation",
  description: "Privacy Policy for the Pevzner Foundation credential sharing service",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="step-card mb-8">
          <div className="text-xs font-mono text-[var(--color-text-muted)] mb-4">
            Version: pp-v1.0 &nbsp;|&nbsp; Effective date: April 4, 2026
          </div>
          <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
          <p className="text-[var(--color-text-muted)]">
            Pevzner Foundation, LLC (&quot;Company,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;)
          </p>
        </div>

        <div className="space-y-8 text-[var(--color-text-muted)] leading-relaxed">

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">1. Introduction</h2>
            <p>
              This Privacy Policy describes how Pevzner Foundation, LLC collects, uses, stores, and
              protects information you provide when using our credential sharing service. By using the
              Service, you acknowledge this policy.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">2. Information We Collect</h2>
            <p className="font-medium text-white">2.1 Account Information</p>
            <ul className="list-disc pl-6 mt-2 mb-4 space-y-1">
              <li>Email address</li>
              <li>Password (hashed, never stored in plaintext)</li>
              <li>Email verification status and timestamp</li>
            </ul>
            <p className="font-medium text-white">2.2 Portal Credentials</p>
            <ul className="list-disc pl-6 mt-2 mb-4 space-y-1">
              <li>Portal type (e.g., AWS, Google Vertex, Azure, Replit, or custom)</li>
              <li>Username / login identifier for the portal</li>
              <li>
                Password for the portal — stored encrypted at rest using AES-256-GCM encryption.
                The encryption key is held server-side and never transmitted to clients.
              </li>
            </ul>
            <p className="font-medium text-white">2.3 Consent Records</p>
            <p className="mt-2">
              Every time you submit credentials through our Service, we record the following
              to document your informed consent:
            </p>
            <ul className="list-disc pl-6 mt-2 mb-4 space-y-1">
              <li>Your user ID and email address</li>
              <li>IP address from which you submitted the form</li>
              <li>Browser user-agent string</li>
              <li>Exact date and time of submission (UTC)</li>
              <li>Version of the Terms of Service you agreed to (e.g., &quot;tos-v1.0&quot;)</li>
              <li>The action taken (&quot;portal_credential_submission&quot;)</li>
            </ul>
            <p className="text-sm">
              This consent logging is required for legal compliance and to demonstrate that you
              authorized Pevzner Foundation to access your accounts.
            </p>
            <p className="font-medium text-white mt-4">2.4 Usage Data</p>
            <p className="mt-2">
              Standard server logs may capture your IP address, browser type, pages visited, and
              session information for security and operational purposes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">3. How We Use Your Information</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong className="text-white">Providing the Service:</strong> Portal credentials are used by
                authorized Pevzner Foundation personnel to log in to your accounts and complete tasks you
                have requested.
              </li>
              <li>
                <strong className="text-white">Legal compliance:</strong> Consent records are maintained as
                evidence of your authorization, as required by applicable law.
              </li>
              <li>
                <strong className="text-white">Security:</strong> Access logs and consent records help us detect
                unauthorized access and investigate security incidents.
              </li>
              <li>
                <strong className="text-white">Account management:</strong> Email and authentication data enable
                you to log in to the Service.
              </li>
            </ul>
            <p className="mt-3">
              We do not use your credentials or personal information for advertising, profiling, or any
              purpose other than those described above.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">4. Data Storage and Security</h2>
            <p>
              All data is stored in a server-side database. Portal passwords are encrypted using
              AES-256-GCM before storage. Your account password is stored as a bcrypt hash (one-way,
              irreversible). We do not store any plaintext passwords.
            </p>
            <p className="mt-3">
              Access to the database is restricted to authorized Pevzner Foundation personnel.
              Data is transmitted over HTTPS. We maintain reasonable technical and organizational
              measures to protect your data from unauthorized access, alteration, or deletion.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">5. Data Sharing</h2>
            <p>
              We do not sell, rent, or share your personal information or portal credentials with
              third parties, except:
            </p>
            <ul className="list-disc pl-6 mt-3 space-y-2">
              <li>
                As required by applicable law, court order, or government authority;
              </li>
              <li>
                To protect the rights, property, or safety of Pevzner Foundation, our users, or the public;
              </li>
              <li>
                With service providers who assist in operating the Service (e.g., email delivery),
                under confidentiality obligations.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">6. Cookies and Sessions</h2>
            <p>
              The Service uses session cookies set by our authentication system (next-auth) to keep you
              logged in. These cookies are:
            </p>
            <ul className="list-disc pl-6 mt-3 space-y-1">
              <li>Essential for the Service to function</li>
              <li>HTTP-only (not accessible to JavaScript)</li>
              <li>Deleted when you sign out</li>
            </ul>
            <p className="mt-3">
              We do not use tracking cookies, third-party analytics cookies, or advertising cookies.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">7. Data Retention</h2>
            <p>
              We retain your portal credentials and consent records for as long as you maintain an
              account with us or as long as required to fulfill the services you requested. Consent
              logs may be retained longer for legal compliance purposes, even after credential deletion.
            </p>
            <p className="mt-3">
              Account data is retained until you request account deletion.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">8. Your Rights</h2>
            <p>Depending on your jurisdiction, you may have the following rights:</p>
            <ul className="list-disc pl-6 mt-3 space-y-2">
              <li>
                <strong className="text-white">Access:</strong> Request a copy of the personal data we hold about you.
              </li>
              <li>
                <strong className="text-white">Deletion:</strong> Request deletion of your credentials and account data.
                Consent records may be retained for legal compliance.
              </li>
              <li>
                <strong className="text-white">Correction:</strong> Request correction of inaccurate data.
              </li>
              <li>
                <strong className="text-white">Portability:</strong> Request export of your data in a machine-readable format.
              </li>
              <li>
                <strong className="text-white">Revocation:</strong> Revoke your authorization for Pevzner Foundation to
                access your third-party accounts by requesting credential deletion.
              </li>
            </ul>
            <p className="mt-3">
              To exercise any of these rights, contact us at{" "}
              <a href="mailto:legal@pevzner.pro" className="text-[var(--color-accent-blue)] hover:underline">
                legal@pevzner.pro
              </a>.
              We will respond within 30 days.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">9. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy periodically. Material changes will be communicated
              via email at least 30 days before taking effect. The version number and effective date
              at the top of this page will reflect the current version.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">10. Contact</h2>
            <div className="p-4 bg-[rgba(255,255,255,0.03)] border border-[var(--color-glass-border)] rounded-lg">
              <p className="text-white font-medium">Pevzner Foundation, LLC</p>
              <p>Privacy inquiries: <a href="mailto:legal@pevzner.pro" className="text-[var(--color-accent-blue)] hover:underline">legal@pevzner.pro</a></p>
            </div>
          </section>

        </div>

        <div className="mt-12 p-4 bg-[rgba(255,255,255,0.02)] border border-[var(--color-glass-border)] rounded-lg text-center">
          <p className="text-xs text-[var(--color-text-muted)]">
            Version: pp-v1.0 &nbsp;&middot;&nbsp; Effective April 4, 2026
          </p>
        </div>
      </div>
    </div>
  );
}
