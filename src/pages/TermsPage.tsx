import React from 'react';

export const TermsPage: React.FC = () => (
  <div className="min-h-screen bg-gray-950 py-12">
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-white mb-8">Terms of Service</h1>
      <div className="prose prose-invert prose-sm max-w-none space-y-6 text-gray-300">
        <p className="text-gray-400">Last updated: March 30, 2026</p>

        <section>
          <h2 className="text-xl font-semibold text-white">1. Acceptance of Terms</h2>
          <p>By accessing or using Mythic AI ("the Service"), you agree to be bound by these Terms of Service. If you do not agree, do not use the Service.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white">2. Eligibility</h2>
          <p>You must be at least 18 years old to use this Service. By using Mythic AI, you represent and warrant that you are at least 18 years of age. We do not knowingly provide services to anyone under 18.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white">3. Account Responsibility</h2>
          <p>You are responsible for maintaining the security of your account credentials. You are responsible for all activity that occurs under your account. Notify us immediately if you suspect unauthorized access.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white">4. The Service</h2>
          <p>Mythic AI provides AI-powered character interactions using large language models. All characters are fictional. AI-generated content does not represent the views of Mythic AI or its operators.</p>
          <p>The Service is provided "as is" without warranties of any kind. We do not guarantee uptime, accuracy, or availability.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white">5. Acceptable Use</h2>
          <p>You agree not to use the Service to:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Generate content involving the sexual exploitation of minors</li>
            <li>Create non-consensual deepfakes or impersonations of real people</li>
            <li>Engage in any activity that violates applicable law</li>
            <li>Attempt to access other users' data or accounts</li>
            <li>Abuse, overload, or interfere with the Service infrastructure</li>
            <li>Redistribute AI-generated content in ways that could cause harm to real individuals</li>
          </ul>
          <p>Violation of these terms may result in immediate account termination without notice.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white">6. Content</h2>
          <p>This platform hosts adult (NSFW) content by design. Users are solely responsible for the content they generate through interactions with AI characters.</p>
          <p>User-created characters are the intellectual property of their creators. By making a character public, you grant other users a non-exclusive license to interact with it on the platform.</p>
          <p>We reserve the right to remove any content or characters that violate these terms.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white">7. Data & Privacy</h2>
          <p>Your use of the Service is also governed by our <a href="/privacy" className="text-red-400 hover:text-red-300 underline">Privacy Policy</a>. By using the Service, you consent to the collection and use of data as described therein.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white">8. Limitation of Liability</h2>
          <p>To the maximum extent permitted by law, Mythic AI and its operators shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the Service.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white">9. Termination</h2>
          <p>We may terminate or suspend your account at any time, with or without cause, with or without notice. Upon termination, your right to use the Service ceases immediately.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white">10. Changes</h2>
          <p>We reserve the right to modify these terms at any time. Continued use of the Service after changes constitutes acceptance of the new terms.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white">11. Contact</h2>
          <p>Questions about these terms? Contact us at <a href="mailto:support@mythicai.net" className="text-red-400 hover:text-red-300 underline">support@mythicai.net</a>.</p>
        </section>
      </div>

      <div className="mt-12 text-center">
        <a href="/" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">← Back to Mythic AI</a>
      </div>
    </div>
  </div>
);
