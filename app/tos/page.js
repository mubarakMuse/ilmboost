import Link from "next/link";
import { getSEOTags } from "@/libs/seo";
import config from "@/config";

// CHATGPT PROMPT TO GENERATE YOUR TERMS & SERVICES — replace with your own data 👇

// 1. Go to https://chat.openai.com/
// 2. Copy paste bellow
// 3. Replace the data with your own (if needed)
// 4. Paste the answer from ChatGPT directly in the <pre> tag below

// You are an excellent lawyer.

// I need your help to write a simple Terms & Services for my website. Here is some context:
// - Website: https://shipfa.st
// - Name: ShipFast
// - Contact information: marc@shipfa.st
// - Description: A JavaScript code boilerplate to help entrepreneurs launch their startups faster
// - Ownership: when buying a package, users can download code to create apps. They own the code but they do not have the right to resell it. They can ask for a full refund within 7 day after the purchase.
// - User data collected: name, email and payment information
// - Non-personal data collection: web cookies
// - Link to privacy-policy: https://shipfa.st/privacy-policy
// - Governing Law: France
// - Updates to the Terms: users will be updated by email

// Please write a simple Terms & Services for my site. Add the current date. Do not add or explain your reasoning. Answer:

export const metadata = getSEOTags({
  title: `Terms and Conditions | ${config.appName}`,
  canonicalUrlRelative: "/tos",
});

const TOS = () => {
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
          </svg>
          Back
        </Link>
        <h1 className="text-3xl font-extrabold pb-6">
          Terms and Conditions for {config.appName}
        </h1>

        <pre
          className="leading-relaxed whitespace-pre-wrap"
          style={{ fontFamily: "sans-serif" }}
        >
          {`Last Updated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}

Welcome to Ilm Boost!

These Terms of Service ("Terms") govern your use of the Ilm Boost website at https://ilmboost.com ("Website") and the services provided by Ilm Boost. By using our Website and services, you agree to these Terms.

1. Description of Ilm Boost

Ilm Boost is an online learning platform that provides comprehensive Islamic educational courses and content for Muslims worldwide. We offer courses covering various Islamic topics including Tafseer, Hadith, Fiqh, and other Islamic sciences.

2. Account Registration and Security

To access our courses, you must create an account with a valid email address, first name, last name, date of birth, phone number, and a 4-digit PIN. You are responsible for maintaining the confidentiality of your account credentials, including your PIN. You agree to notify us immediately of any unauthorized use of your account.

3. Membership Tiers and Access

Ilm Boost offers three membership tiers:
- Free: Basic access to limited course content
- Monthly: Full access to all courses for $10/month, billed monthly
- Yearly: Full access to all courses for $100/year, billed annually

Your membership tier determines your level of access to course content. Paid memberships are automatically renewed unless cancelled.

4. Course Enrollment and Progress

When you enroll in a course, you gain access to course materials, sections, quizzes, and assessments. Your progress, including completed sections and quiz scores, is tracked and stored in your account. You may retake quizzes to improve your scores.

5. Payment and Refunds

Payments for monthly and yearly memberships are processed securely through Stripe. All payments are non-refundable except as required by law. You may cancel your subscription at any time through your account settings or by contacting support. Cancellation will take effect at the end of your current billing period.

6. Intellectual Property

All course content, including text, videos, images, quizzes, and other materials, is the property of Ilm Boost and is protected by copyright and other intellectual property laws. You may not reproduce, distribute, modify, or create derivative works from our content without express written permission.

7. User Conduct

You agree to use Ilm Boost in a manner that is respectful and in accordance with Islamic values. You may not:
- Share your account credentials with others
- Attempt to access courses or content you are not authorized to view
- Use automated systems to access or scrape our content
- Engage in any activity that disrupts or interferes with our services

8. User Data and Privacy

We collect and store user data, including name, email, phone number, date of birth, and payment information, as necessary to provide our services. For details on how we handle your data, please refer to our Privacy Policy at https://ilmboost.com/privacy-policy.

9. Non-Personal Data Collection

We use web cookies and similar technologies to collect non-personal data for the purpose of improving our services and user experience.

10. Termination

We reserve the right to suspend or terminate your account at any time if you violate these Terms or engage in any fraudulent, abusive, or illegal activity.

11. Limitation of Liability

Ilm Boost provides educational content for informational purposes. We do not guarantee specific outcomes or results from using our courses. We are not liable for any indirect, incidental, or consequential damages arising from your use of our services.

12. Governing Law

These Terms are governed by the laws of the jurisdiction in which Ilm Boost operates.

13. Updates to the Terms

We may update these Terms from time to time. Users will be notified of any significant changes via email or through notifications on the Website. Continued use of our services after changes constitutes acceptance of the updated Terms.

14. Contact Information

For any questions or concerns regarding these Terms of Service, please contact us at:
Email: mubarak014@gmail.com

Thank you for choosing Ilm Boost for your Islamic learning journey!`}
        </pre>
      </div>
    </main>
  );
};

export default TOS;
