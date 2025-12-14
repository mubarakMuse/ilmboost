import Link from "next/link";
import { getSEOTags } from "@/libs/seo";
import config from "@/config";

// CHATGPT PROMPT TO GENERATE YOUR PRIVACY POLICY — replace with your own data 👇

// 1. Go to https://chat.openai.com/
// 2. Copy paste bellow
// 3. Replace the data with your own (if needed)
// 4. Paste the answer from ChatGPT directly in the <pre> tag below

// You are an excellent lawyer.

// I need your help to write a simple privacy policy for my website. Here is some context:
// - Website: https://shipfa.st
// - Name: ShipFast
// - Description: A JavaScript code boilerplate to help entrepreneurs launch their startups faster
// - User data collected: name, email and payment information
// - Non-personal data collection: web cookies
// - Purpose of Data Collection: Order processing
// - Data sharing: we do not share the data with any other parties
// - Children's Privacy: we do not collect any data from children
// - Updates to the Privacy Policy: users will be updated by email
// - Contact information: marc@shipfa.st

// Please write a simple privacy policy for my site. Add the current date.  Do not add or explain your reasoning. Answer:

export const metadata = getSEOTags({
  title: `Privacy Policy | ${config.appName}`,
  canonicalUrlRelative: "/privacy-policy",
});

const PrivacyPolicy = () => {
  return (
    <main className="max-w-xl mx-auto">
      <div className="p-5">
        <Link href="/" className="btn btn-ghost">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-5 h-5"
          >
            <path
              fillRule="evenodd"
              d="M15 10a.75.75 0 01-.75.75H7.612l2.158 1.96a.75.75 0 11-1.04 1.08l-3.5-3.25a.75.75 0 010-1.08l3.5-3.25a.75.75 0 111.04 1.08L7.612 9.25h6.638A.75.75 0 0115 10z"
              clipRule="evenodd"
            />
          </svg>{" "}
          Back
        </Link>
        <h1 className="text-3xl font-extrabold pb-6">
          Privacy Policy for {config.appName}
        </h1>

        <pre
          className="leading-relaxed whitespace-pre-wrap"
          style={{ fontFamily: "sans-serif" }}
        >
          {`Last Updated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}

Thank you for visiting Ilm Boost ("we," "us," or "our"). This Privacy Policy outlines how we collect, use, and protect your personal and non-personal information when you use our website located at https://ilmboost.com (the "Website").

By accessing or using the Website, you agree to the terms of this Privacy Policy. If you do not agree with the practices described in this policy, please do not use the Website.

1. Information We Collect

1.1 Personal Data

We collect the following personal information from you:

Name: We collect your first name and last name to personalize your experience and communicate with you effectively.
Email: We collect your email address to send you important information regarding your account, course updates, membership status, and communication.
Phone Number: We collect your phone number for account verification and important notifications.
Date of Birth: We collect your month and year of birth for account security and age verification purposes.
PIN: We collect a 4-digit PIN that you create during registration. This PIN is securely hashed and stored. It is used for account authentication along with your email.
Secret Answer: We collect a secret answer (your mother's birth year) for account recovery purposes. This information is securely hashed and stored.
Payment Information: We collect payment details to process your membership subscriptions securely. However, we do not store your full payment information on our servers. Payments are processed by Stripe, a trusted third-party payment processor. We only store your Stripe customer ID, subscription ID, and price ID for membership management.

1.2 Course Progress and Activity Data

We collect and store information about your course enrollment, progress, completed sections, quiz scores, and learning activity. This data helps us provide you with a personalized learning experience and track your educational journey.

1.3 Non-Personal Data

We may use web cookies, local storage, and similar technologies to collect non-personal information such as your IP address, browser type, device information, and browsing patterns. This information helps us to enhance your browsing experience, analyze trends, and improve our services.

2. Purpose of Data Collection

We collect and use your personal data for the following purposes:
- Account creation and authentication
- Processing membership subscriptions and payments
- Providing access to course content based on your membership tier
- Tracking your course progress and quiz scores
- Sending important account updates and course notifications
- Providing customer support
- Improving our services and user experience
- Complying with legal obligations

3. Data Storage and Security

Your personal data is stored securely in our database using industry-standard security measures. Your PIN and secret answer are hashed using secure cryptographic methods and cannot be retrieved in plain text. We use secure session management to protect your account while you are logged in.

4. Data Sharing

We do not share your personal data with any third parties except:
- Payment Processing: We share necessary payment information with Stripe to process your membership subscriptions.
- Service Providers: We may share data with trusted service providers who assist us in operating our platform, such as hosting providers, but only to the extent necessary to provide our services.

We do not sell, trade, or rent your personal information to others for marketing purposes.

5. Your Rights

You have the right to:
- Access your personal data
- Update or correct your personal information through your account settings
- Request deletion of your account and associated data
- Change your PIN through your account settings
- Cancel your membership subscription at any time

6. Cookies and Local Storage

We use cookies and local storage to:
- Maintain your login session
- Remember your preferences
- Track your course progress
- Improve website functionality

You can control cookies through your browser settings, but disabling cookies may affect your ability to use certain features of our Website.

7. Children's Privacy

Ilm Boost is intended for users who are at least 13 years of age. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe that your child has provided us with personal information, please contact us at the email address provided below.

8. Data Retention

We retain your personal data for as long as your account is active or as needed to provide you with our services. If you delete your account, we will delete or anonymize your personal data, except where we are required to retain it for legal or regulatory purposes.

9. International Data Transfers

Your data may be transferred to and stored on servers located outside your country of residence. By using our Website, you consent to the transfer of your data to these servers.

10. Updates to the Privacy Policy

We may update this Privacy Policy from time to time to reflect changes in our practices or for other operational, legal, or regulatory reasons. Any updates will be posted on this page with an updated "Last Updated" date, and we may notify you via email about significant changes.

11. Contact Information

If you have any questions, concerns, or requests related to this Privacy Policy, or if you wish to exercise your rights regarding your personal data, you can contact us at:

Email: mubarak014@gmail.com

For all other inquiries, please visit our support page on the Website.

By using Ilm Boost, you consent to the terms of this Privacy Policy.`}
        </pre>
      </div>
    </main>
  );
};

export default PrivacyPolicy;
