import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service — Pevzner Foundation",
  description: "Terms of Service for the Pevzner Foundation credential sharing service",
};

// Document version: tos-v1.0
// Last updated: 2026-04-04
// This version identifier is stored in consent logs to track which version each user agreed to.

export default function TermsPage() {
  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="step-card mb-8">
          <div className="text-xs font-mono text-[var(--color-text-muted)] mb-4">
            Document version: tos-v1.0 &nbsp;|&nbsp; Effective date: April 4, 2026
          </div>
          <h1 className="text-3xl font-bold mb-2">Terms of Service</h1>
          <p className="text-[var(--color-text-muted)]">
            Pevzner Foundation, LLC (&quot;Company,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;)
          </p>
        </div>

        <div className="space-y-8 text-[var(--color-text-muted)] leading-relaxed">

          {/* 1. Agreement */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">1. Agreement to Terms</h2>
            <p>
              By accessing or using the Pevzner Foundation credential sharing service (the &quot;Service&quot;),
              including by checking the consent checkbox on our credential submission form, you (&quot;User&quot;)
              agree to be bound by these Terms of Service (&quot;Terms&quot;). If you do not agree to these Terms,
              do not use the Service and do not submit your credentials.
            </p>
            <p className="mt-3">
              These Terms constitute a legally binding agreement between you and Pevzner Foundation, LLC.
              Your affirmative act of checking the consent checkbox constitutes your electronic signature
              and express acknowledgment that you have read, understood, and agree to these Terms.
            </p>
          </section>

          {/* 2. Description of Services */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">2. Description of Services</h2>
            <p>
              The Service allows users to securely submit login credentials for third-party platforms,
              including but not limited to Amazon Web Services (AWS), Google Cloud Vertex AI, Microsoft Azure,
              Replit, and other platforms specified by the User (&quot;Third-Party Services&quot;).
            </p>
            <p className="mt-3">
              The purpose of credential submission is to enable Pevzner Foundation personnel to access
              and manage your accounts on Third-Party Services on your behalf, solely for the purpose of
              completing tasks, orders, and services as agreed between you and Pevzner Foundation
              (&quot;Authorized Purpose&quot;).
            </p>
          </section>

          {/* 3. Authorization Grant */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">3. Authorization Grant</h2>
            <p className="font-medium text-white">
              By submitting your credentials through the Service and checking the consent checkbox, you
              expressly and affirmatively authorize Pevzner Foundation, LLC to:
            </p>
            <ul className="list-disc pl-6 mt-3 space-y-2">
              <li>Access and log in to your accounts on the Third-Party Services you specify;</li>
              <li>
                Perform actions within those accounts that are necessary to complete the tasks, orders,
                and services you have requested from Pevzner Foundation;
              </li>
              <li>
                Act as your authorized agent with respect to the specific Third-Party Services and
                tasks you have identified.
              </li>
            </ul>
            <p className="mt-3">
              This authorization is limited in scope to the specific Third-Party Services you submit
              credentials for and the specific tasks agreed upon. Pevzner Foundation will not use your
              credentials for any purpose beyond the Authorized Purpose.
            </p>
            <p className="mt-3">
              This authorization remains in effect until you revoke it by contacting Pevzner Foundation
              at <a href="mailto:legal@pevzner.pro" className="text-[var(--color-accent-blue)] hover:underline">legal@pevzner.pro</a> and
              requesting deletion of your credentials.
            </p>
          </section>

          {/* 4. User Representations and Warranties */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">4. User Representations and Warranties</h2>
            <p>By using the Service, you represent and warrant that:</p>
            <ul className="list-disc pl-6 mt-3 space-y-2">
              <li>
                You are the owner of, or are otherwise fully authorized to share access to, the accounts
                on the Third-Party Services for which you submit credentials;
              </li>
              <li>
                Granting Pevzner Foundation access to the specified accounts does not violate any
                agreement you have with the Third-Party Service provider or any applicable law;
              </li>
              <li>The credentials you provide are accurate and current;</li>
              <li>You are at least 18 years of age and have full legal capacity to enter into this agreement;</li>
              <li>
                You have the authority to authorize a third party (Pevzner Foundation) to access the
                specified accounts under the terms of your agreements with the relevant Third-Party Service providers.
              </li>
            </ul>
          </section>

          {/* 5. Data Security */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">5. Data Security</h2>
            <p>
              Pevzner Foundation takes the security of your credentials seriously. We implement the
              following technical measures:
            </p>
            <ul className="list-disc pl-6 mt-3 space-y-2">
              <li>
                All submitted passwords are encrypted at rest using AES-256-GCM encryption before
                being stored in our database;
              </li>
              <li>Access to the database is restricted to authorized Pevzner Foundation personnel only;</li>
              <li>Credentials are transmitted over encrypted HTTPS connections;</li>
              <li>Consent records, including IP address and timestamp, are permanently logged.</li>
            </ul>
            <p className="mt-3">
              Notwithstanding the foregoing, no security system is impenetrable. Pevzner Foundation
              cannot guarantee that our security measures will prevent all unauthorized access or disclosure.
              In the event of a security breach that affects your credentials, we will notify you in
              accordance with applicable law.
            </p>
          </section>

          {/* 6. Acceptable Use */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">6. Acceptable Use</h2>
            <p>You agree not to:</p>
            <ul className="list-disc pl-6 mt-3 space-y-2">
              <li>Submit credentials for accounts you do not own or are not authorized to share;</li>
              <li>Use the Service to facilitate any illegal activity;</li>
              <li>Interfere with or disrupt the Service;</li>
              <li>Attempt to circumvent any security measures of the Service.</li>
            </ul>
          </section>

          {/* 7. Disclaimer of Warranties */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">7. Disclaimer of Warranties</h2>
            <p className="uppercase text-sm">
              THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF ANY KIND,
              EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY,
              FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. PEVZNER FOUNDATION DOES NOT WARRANT
              THAT THE SERVICE WILL BE UNINTERRUPTED, ERROR-FREE, OR FREE OF VIRUSES OR OTHER HARMFUL COMPONENTS.
            </p>
          </section>

          {/* 8. Limitation of Liability */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">8. Limitation of Liability</h2>
            <p className="uppercase text-sm">
              TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL PEVZNER FOUNDATION, LLC,
              ITS OFFICERS, DIRECTORS, EMPLOYEES, AGENTS, OR AFFILIATES BE LIABLE FOR ANY INDIRECT, INCIDENTAL,
              SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING WITHOUT LIMITATION LOSS OF PROFITS,
              DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, ARISING OUT OF OR IN CONNECTION WITH YOUR USE
              OF THE SERVICE, EVEN IF PEVZNER FOUNDATION HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
            </p>
            <p className="mt-3 uppercase text-sm">
              IN NO EVENT SHALL PEVZNER FOUNDATION&apos;S TOTAL LIABILITY TO YOU FOR ALL CLAIMS ARISING OUT OF
              OR RELATING TO THESE TERMS OR THE SERVICE EXCEED ONE HUNDRED DOLLARS ($100.00).
            </p>
          </section>

          {/* 9. Indemnification */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">9. Indemnification</h2>
            <p>
              You agree to indemnify, defend, and hold harmless Pevzner Foundation, LLC and its officers,
              directors, employees, and agents from and against any claims, liabilities, damages, losses,
              costs, and expenses (including reasonable attorneys&apos; fees) arising out of or relating to:
            </p>
            <ul className="list-disc pl-6 mt-3 space-y-2">
              <li>Your violation of these Terms;</li>
              <li>
                Any claim by a Third-Party Service provider that your authorization of Pevzner Foundation
                to access your account violated the terms of service of that Third-Party Service;
              </li>
              <li>Your submission of credentials you were not authorized to share;</li>
              <li>Any inaccuracy in the representations and warranties you made in Section 4.</li>
            </ul>
          </section>

          {/* 10. Governing Law */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">10. Governing Law and Dispute Resolution</h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of the State of
              Delaware, without regard to its conflict of law provisions.
            </p>
            <p className="mt-3">
              Any dispute arising out of or relating to these Terms or the Service shall first be submitted
              to good-faith negotiation. If the parties cannot resolve the dispute within thirty (30) days,
              either party may pursue binding arbitration under the rules of the American Arbitration
              Association (AAA), conducted in English, with the arbitration seated in New York, NY.
            </p>
            <p className="mt-3">
              Notwithstanding the foregoing, either party may seek injunctive or other equitable relief
              in any court of competent jurisdiction.
            </p>
          </section>

          {/* 11. Amendments */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">11. Amendments</h2>
            <p>
              Pevzner Foundation reserves the right to modify these Terms at any time. When we make
              material changes, we will update the document version number (e.g., from &quot;tos-v1.0&quot; to
              &quot;tos-v1.1&quot;) and the effective date at the top of this page. We will also notify registered
              users by email at least thirty (30) days before material changes take effect.
            </p>
            <p className="mt-3">
              Your continued use of the Service after changes become effective constitutes your acceptance
              of the revised Terms. If you do not agree to the revised Terms, you must stop using the Service
              and contact us to request deletion of your credentials.
            </p>
            <p className="mt-3">
              Consent records stored in our database will always reference the specific version of the Terms
              in effect at the time of consent (e.g., &quot;tos-v1.0&quot;), so we always know what you agreed to.
            </p>
          </section>

          {/* 12. Contact */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">12. Contact Information</h2>
            <p>
              For questions about these Terms, to revoke your authorization, or to request deletion of your
              credentials, please contact:
            </p>
            <div className="mt-3 p-4 bg-[rgba(255,255,255,0.03)] border border-[var(--color-glass-border)] rounded-lg">
              <p className="text-white font-medium">Pevzner Foundation, LLC</p>
              <p>Legal inquiries: <a href="mailto:legal@pevzner.pro" className="text-[var(--color-accent-blue)] hover:underline">legal@pevzner.pro</a></p>
            </div>
          </section>

        </div>

        <div className="mt-12 p-4 bg-[rgba(255,255,255,0.02)] border border-[var(--color-glass-border)] rounded-lg text-center">
          <p className="text-xs text-[var(--color-text-muted)]">
            Document version: tos-v1.0 &nbsp;&middot;&nbsp; Effective April 4, 2026
          </p>
        </div>
      </div>
    </div>
  );
}
