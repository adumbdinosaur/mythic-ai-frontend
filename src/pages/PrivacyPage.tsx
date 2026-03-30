import React from 'react';

export const PrivacyPage: React.FC = () => (
  <div className="min-h-screen bg-gray-950 py-12">
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-white mb-8">Privacy Policy</h1>
      <div className="prose prose-invert prose-sm max-w-none space-y-6 text-gray-300">
        <p className="text-gray-400">Last updated: March 30, 2026</p>

        <section>
          <h2 className="text-xl font-semibold text-white">1. What We Collect</h2>
          <p>We collect the minimum data necessary to operate the Service:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>Account data:</strong> Email address, username, and hashed password</li>
            <li><strong>Chat history:</strong> Messages exchanged with AI characters, stored to maintain conversation continuity</li>
            <li><strong>Character data:</strong> Characters you create, including names, descriptions, and personality prompts</li>
            <li><strong>Usage data:</strong> Basic analytics (page views, feature usage) to improve the Service</li>
            <li><strong>Linked accounts:</strong> Discord ID or other OAuth provider IDs if you choose to link accounts</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white">2. What We Don't Collect</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>We do not collect your real name (unless you provide it voluntarily)</li>
            <li>We do not track you across other websites</li>
            <li>We do not sell your data to third parties</li>
            <li>We do not use your chat content to train AI models</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white">3. How We Use Your Data</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>To provide and maintain the Service</li>
            <li>To send transactional emails (verification, password reset)</li>
            <li>To enforce our Terms of Service</li>
            <li>To improve the Service based on aggregate, anonymized usage patterns</li>
          </ul>
          <p>Your chat messages are sent to our AI inference servers to generate responses. Messages are processed in memory and not logged beyond your stored conversation history.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white">4. Data Storage & Security</h2>
          <p>Your data is stored on servers located in the European Union (Germany). We use industry-standard security measures including:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>HTTPS/TLS encryption for all connections</li>
            <li>Hashed passwords (never stored in plaintext)</li>
            <li>Access controls limiting who can access production systems</li>
          </ul>
          <p>No system is 100% secure. We cannot guarantee absolute security but we take reasonable measures to protect your data.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white">5. Data Retention</h2>
          <p>Your account data and chat history are retained as long as your account exists. You may delete your account at any time, which will permanently remove your data from our systems within 30 days.</p>
          <p>Anonymized, aggregate data may be retained indefinitely for analytics purposes.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white">6. Third Parties</h2>
          <p>We use the following third-party services:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>Resend:</strong> Transactional email delivery</li>
            <li><strong>Cloudflare:</strong> DNS, CDN, and DDoS protection</li>
            <li><strong>Discord:</strong> OAuth account linking (only if you choose to link)</li>
          </ul>
          <p>We do not share your chat content or personal data with any third party except as required by law.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white">7. Your Rights</h2>
          <p>You have the right to:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Access the personal data we hold about you</li>
            <li>Request correction of inaccurate data</li>
            <li>Request deletion of your data</li>
            <li>Export your data in a portable format</li>
            <li>Withdraw consent for data processing</li>
          </ul>
          <p>To exercise these rights, contact us at <a href="mailto:support@mythicai.net" className="text-red-400 hover:text-red-300 underline">support@mythicai.net</a>.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white">8. Cookies</h2>
          <p>We use essential cookies only (authentication tokens). We do not use tracking cookies, advertising cookies, or third-party analytics cookies.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white">9. Children</h2>
          <p>This Service is not intended for anyone under the age of 18. We do not knowingly collect data from minors. If we discover that a minor has created an account, it will be terminated immediately.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white">10. Changes</h2>
          <p>We may update this Privacy Policy from time to time. We will notify users of significant changes via email or a notice on the Service.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white">11. Contact</h2>
          <p>For privacy-related inquiries: <a href="mailto:support@mythicai.net" className="text-red-400 hover:text-red-300 underline">support@mythicai.net</a></p>
        </section>
      </div>

      <div className="mt-12 text-center">
        <a href="/" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">← Back to Mythic AI</a>
      </div>
    </div>
  </div>
);
