// pages/privacy-policy.js
import Link from "next/link";
import Head from "next/head";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function PrivacyPolicy() {
  return (
    <>
      <Head>
        <title>Privacy Policy | HOPWELL</title>
      </Head>
      <Header />
      <main className="bg-yellow-50 py-16">
        <div className="max-w-4xl mx-auto px-8">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h1 className="text-3xl font-bold text-indigo-900 mb-8">Privacy Policy</h1>
            <div className="prose prose-indigo max-w-none">
              <p className="text-sm text-gray-500 mb-8">Last Updated: {new Date().toLocaleDateString()}</p>
              
              <h2 className="text-xl font-semibold mt-8 mb-4">1. Introduction</h2>
              <p>At HOPWELL, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website, mobile application, or any services offered by HOPWELL (collectively, the "Services").</p>
              
              <h2 className="text-xl font-semibold mt-8 mb-4">2. Information We Collect</h2>
              <p><strong>Personal Information:</strong> We collect personal information that you voluntarily provide to us, including but not limited to your name, email address, and payment information when you register for an account or make a purchase.</p>
              <p><strong>Travel Preferences:</strong> We collect information about your travel preferences, including destinations, dates, accommodation preferences, activities of interest, and budget constraints to provide personalized travel recommendations.</p>
              <p><strong>Usage Data:</strong> We automatically collect certain information about your device and how you interact with our Services, including your IP address, browser type, referring/exit pages, and operating system.</p>
              <p><strong>Cookies and Similar Technologies:</strong> We use cookies and similar tracking technologies to track activity on our Services and hold certain information to enhance your experience.</p>
              
              <h2 className="text-xl font-semibold mt-8 mb-4">3. How We Use Your Information</h2>
              <p>We use the information we collect to:</p>
              <ul className="list-disc pl-6 mb-4">
                <li>Provide, maintain, and improve our Services</li>
                <li>Create personalized travel itineraries based on your preferences</li>
                <li>Process transactions and send related information</li>
                <li>Respond to your comments, questions, and requests</li>
                <li>Send you technical notices, updates, security alerts, and support messages</li>
                <li>Monitor and analyze trends, usage, and activities in connection with our Services</li>
                <li>Detect, prevent, and address fraud and other illegal activities</li>
              </ul>
              
              <h2 className="text-xl font-semibold mt-8 mb-4">4. Sharing Your Information</h2>
              <p>We may share your information with:</p>
              <ul className="list-disc pl-6 mb-4">
                <li>Service providers who perform services on our behalf</li>
                <li>Travel partners when necessary to fulfill your booking requests</li>
                <li>In response to a request for information if we believe disclosure is in accordance with, or required by, any applicable law, regulation, or legal process</li>
                <li>If we believe your actions are inconsistent with our user agreements or policies, or to protect the rights, property, and safety of HOPWELL or others</li>
              </ul>
              
              <h2 className="text-xl font-semibold mt-8 mb-4">5. Data Retention</h2>
              <p>We will retain your information for as long as your account is active or as needed to provide you with our Services. We will also retain and use your information as necessary to comply with our legal obligations, resolve disputes, and enforce our agreements.</p>
              
              <h2 className="text-xl font-semibold mt-8 mb-4">6. Your Rights</h2>
              <p>You have the right to access, correct, or delete your personal information. You can do this by accessing your account settings or by contacting us directly.</p>
              
              <h2 className="text-xl font-semibold mt-8 mb-4">7. Children's Privacy</h2>
              <p>Our Services are not intended for individuals under the age of 13. We do not knowingly collect personal information from children under 13. If we learn we have collected or received personal information from a child under 13, we will delete that information.</p>
              
              <h2 className="text-xl font-semibold mt-8 mb-4">8. Changes to This Privacy Policy</h2>
              <p>We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date at the top of this Privacy Policy.</p>
              
              <h2 className="text-xl font-semibold mt-8 mb-4">9. Contact Us</h2>
              <p>If you have any questions about this Privacy Policy, please contact us at privacy@hopwell.ai.</p>
            </div>
            
            <div className="mt-8">
              <Link href="/" className="text-indigo-600 hover:text-indigo-800">
                ← Back to home
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}