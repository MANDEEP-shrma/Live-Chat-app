import { Header } from "@/components/layout/Header";
import React from "react";

const TermsAndConditions: React.FC = () => {
  return (
    <div className="w-full bg-gray-900 text-white">
      <Header isAuthenticated={true} />
      <div className="max-w-6xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-8 text-white">
          Terms and Conditions
        </h1>

        <div className="bg-gray-800/70 rounded-lg border border-gray-700 p-6 space-y-6">
          <section>
            <h2 className="text-xl font-semibold mb-4">
              1. Acceptance of Terms
            </h2>
            <p className="text-gray-300">
              By accessing and using ChatConnect, you acknowledge that you have
              read, understood, and agree to be bound by these Terms and
              Conditions. If you do not agree with any part of these terms, you
              may not use our services.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">2. User Accounts</h2>
            <p className="text-gray-300">
              To use certain features of ChatConnect, you may be required to
              create an account. You are responsible for maintaining the
              confidentiality of your account credentials and for all activities
              that occur under your account. You agree to provide accurate and
              complete information when creating your account and to update your
              information to keep it accurate and current.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">3. User Conduct</h2>
            <p className="text-gray-300">
              You agree not to use ChatConnect for any unlawful purpose or in
              any way that could damage, disable, overburden, or impair our
              services. This includes but is not limited to:
            </p>
            <ul className="list-disc pl-6 mt-2 text-gray-300 space-y-1">
              <li>Harassing, abusing, or threatening other users</li>
              <li>Distributing spam, malware, or other harmful content</li>
              <li>
                Attempting to gain unauthorized access to our systems or user
                accounts
              </li>
              <li>
                Using our services to infringe on intellectual property rights
              </li>
              <li>
                Engaging in any activity that violates applicable laws or
                regulations
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">4. Privacy</h2>
            <p className="text-gray-300">
              Your privacy is important to us. Our Privacy Policy describes how
              we collect, use, and disclose information about you. By using
              ChatConnect, you consent to the collection and use of your
              information as described in our Privacy Policy.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">5. Content</h2>
            <p className="text-gray-300">
              You retain ownership of any content you create, upload, or share
              through ChatConnect. By submitting content, you grant us a
              non-exclusive, royalty-free, worldwide license to use, store,
              display, reproduce, modify, and distribute your content solely for
              the purpose of operating and improving our services.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">
              6. Intellectual Property
            </h2>
            <p className="text-gray-300">
              ChatConnect and its original content, features, and functionality
              are owned by us and are protected by international copyright,
              trademark, patent, trade secret, and other intellectual property
              laws.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">7. Termination</h2>
            <p className="text-gray-300">
              We reserve the right to suspend or terminate your access to
              ChatConnect, with or without notice, for conduct that we believe
              violates these Terms and Conditions or is harmful to other users,
              us, or third parties, or for any other reason at our sole
              discretion.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">
              8. Disclaimer of Warranties
            </h2>
            <p className="text-gray-300">
              ChatConnect is provided "as is" and "as available" without any
              warranties of any kind, either express or implied. We do not
              guarantee that our services will be uninterrupted, secure, or
              error-free.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">
              9. Limitation of Liability
            </h2>
            <p className="text-gray-300">
              To the maximum extent permitted by law, we shall not be liable for
              any indirect, incidental, special, consequential, or punitive
              damages, or any loss of profits or revenues, whether incurred
              directly or indirectly, or any loss of data, use, goodwill, or
              other intangible losses resulting from your use of ChatConnect.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">10. Changes to Terms</h2>
            <p className="text-gray-300">
              We reserve the right to modify these Terms and Conditions at any
              time. We will provide notice of significant changes by posting the
              updated terms on our website or through other reasonable means.
              Your continued use of ChatConnect after such changes constitutes
              your acceptance of the new terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">11. Governing Law</h2>
            <p className="text-gray-300">
              These Terms and Conditions shall be governed by and construed in
              accordance with the laws of the jurisdiction in which we operate,
              without regard to its conflict of law provisions.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">12. Contact Us</h2>
            <p className="text-gray-300">
              If you have any questions about these Terms and Conditions, please
              contact us through the support section of our application.
            </p>
          </section>

          <div className="pt-4 border-t border-gray-700">
            <p className="text-gray-400 text-sm">Last updated: May 6, 2025</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditions;
