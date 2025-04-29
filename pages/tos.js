import Link from "next/link";
import TagSEO from "@/components/TagSEO";
import config from "@/config";

// CHATGPT PROMPT TO GENERATE YOUR TERMS & SERVICES — replace with your own data

// 1. Go to https://app.chatgpt.com/
// 2. Copy paste bellow
// 3. Replace the data with your own (if needed)

// You are an excellent layer.

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

const TOS = () => {
  return (
    <div className="max-w-xl mx-auto">
      <TagSEO
        title={`Terms and Conditions | ${config.appName}`}
        canonicalSlug="tos"
      />

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
        <h1 className="text-3xl font-bold pb-6">Privacy Policy for ShipFast</h1>

        <pre
          className="leading-relaxed whitespace-pre-wrap"
          style={{ fontFamily: "sans-serif" }}
        >
          {`Last Updated: August 25, 2023


**Privacy Policy for Hopwell**

Effective Date: 01/08/2024

Welcome to Hopwell (https://hopwell.ai). This Privacy Policy describes how Hopwell ("we", "us", or "our") collects, uses, and protects the personal and non-personal information you provide on the ShipFast website and any related services. By accessing or using our website, you consent to the practices described in this policy.

1. Information Collection

We collect the following types of information:

- Personal Information: When you use a services on Hopwell, we collect your name, email address, and payment information. This information is used to process your order, provide customer support, and send important updates related to your service.

- Non-Personal Information: We may use web cookies to gather non-personal information such as your IP address, browser type, and referring pages. This helps us improve our website and tailor your experience.

2. Ownership and Usage Rights

When you use service from Hopwell, you gain ownership of the iteinary/plan provided in the text. However, you do not have the right to resell or distribute the code as a standalone product. 

3. Data Security

We are committed to protecting your personal information. We use appropriate security measures to safeguard your data from unauthorized access, alteration, disclosure, or destruction.

4. Governing Law

This Privacy Policy is governed by the laws of United States.

5. Updates to the Privacy Policy

We may update this Privacy Policy from time to time to reflect changes in our practices or for other operational, legal, or regulatory reasons. Changes will be effective as soon as the revised policy is posted on our website. We will notify you of any significant changes via email.

Contact Information

For more details about our data collection, usage, and protection practices, or if you have any questions or concerns about this Privacy Policy, please contact us at marc@shipfa.st.

Link to Full Privacy Policy

Please review our full Privacy Policy at [https://Hopwell.ai/privacy-policy](https://hopwell.ai/privacy-policy) for more detailed information regarding our privacy practices.

Thank you for choosing Hopwell.

Date: August 25, 2023`}
        </pre>
      </div>
    </div>
  );
};

export default TOS;
