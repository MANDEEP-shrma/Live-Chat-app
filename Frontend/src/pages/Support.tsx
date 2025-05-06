import React from "react";
import { Mail, Phone, Github } from "lucide-react";
import { Header } from "@/components/layout/Header";

const Support: React.FC = () => {
  return (
    <div className="w-full bg-gray-900 text-white">
      <Header isAuthenticated={true} />
      <div className="max-w-6xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-8 text-white">Support</h1>

        <div className="grid md:grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Email Contact Card */}
          <div className="bg-gray-800/70 rounded-lg border border-gray-700 p-6 flex flex-col items-center hover:border-gray-500 transition-colors">
            <div className="rounded-full bg-gray-700 p-4 mb-4">
              <Mail className="w-8 h-8 text-green-400" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Email</h2>
            <p className="text-gray-300 mb-4 text-center">
              Have a question? Send us an email anytime.
            </p>
            <a
              href="mailto:mandeepsharma0701@gmail.com"
              className="text-green-400 hover:text-green-300 transition-colors font-medium break-words text-center"
            >
              mandeepsharma0701@gmail.com
            </a>
          </div>

          {/* Phone Contact Card */}
          <div className="bg-gray-800/70 rounded-lg border border-gray-700 p-6 flex flex-col items-center hover:border-gray-500 transition-colors">
            <div className="rounded-full bg-gray-700 p-4 mb-4">
              <Phone className="w-8 h-8 text-green-400" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Phone</h2>
            <p className="text-gray-300 mb-4 text-center">
              Need immediate assistance? Give us a call.
            </p>
            <a
              href="tel:+919313892439"
              className="text-green-400 hover:text-green-300 transition-colors font-medium"
            >
              +91 9313892439
            </a>
          </div>

          {/* GitHub Card */}
          <div className="bg-gray-800/70 rounded-lg border border-gray-700 p-6 flex flex-col items-center hover:border-gray-500 transition-colors">
            <div className="rounded-full bg-gray-700 p-4 mb-4">
              <Github className="w-8 h-8 text-green-400" />
            </div>
            <h2 className="text-xl font-semibold mb-2">GitHub</h2>
            <p className="text-gray-300 mb-4 text-center">
              Want to contribute or report an issue? Visit our repository.
            </p>
            <a
              href="https://github.com/MANDEEP-shrma"
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-400 hover:text-green-300 transition-colors font-medium"
            >
              github.com/MANDEEP-shrma
            </a>
          </div>
        </div>

        {/* Additional Support Information */}
        <div className="mt-10 bg-gray-800/70 rounded-lg border border-gray-700 p-6">
          <h2 className="text-xl font-semibold mb-4">
            Frequently Asked Questions
          </h2>

          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium mb-2">
                How do I reset my password?
              </h3>
              <p className="text-gray-300">
                Click on the "Forgot Password" link on the login page. Enter
                your registered email address, and we'll send you instructions
                to reset your password.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2">
                How can I block or unblock a user?
              </h3>
              <p className="text-gray-300">
                You can block a user from their profile or from any chat
                conversation by clicking on the options menu and selecting
                "Block User". To unblock a user, visit the Blocked Users section
                in your settings.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2">
                Is my personal information secure?
              </h3>
              <p className="text-gray-300">
                Yes, ChatConnect uses industry-standard encryption to protect
                your personal information. We do not share your information with
                third parties without your consent.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2">
                How do I delete my account?
              </h3>
              <p className="text-gray-300">
                You can delete your account by going to Settings &gt; Account
                &gt; Delete Account. Please note that this action is
                irreversible, and all your data will be permanently deleted.
              </p>
            </div>
          </div>
        </div>

        {/* Support Hours */}
        <div className="mt-6 text-center">
          <p className="text-gray-400">
            Our support team is available Monday through Friday, 9:00 AM to 6:00
            PM IST.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Support;
