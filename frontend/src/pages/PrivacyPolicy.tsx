import { useNavigate } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";

export default function PrivacyPolicy() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center px-4 py-10 relative">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="absolute top-6 left-6 flex items-center gap-1 px-4 py-2 rounded bg-card text-muted-foreground hover:text-primary hover:border-primary transition"
        title="Back"
      >
        <FiArrowLeft className="w-5 h-5" /> Back
      </button>
      <div className="bg-card border border-border rounded-2xl shadow-lg p-8 max-w-2xl w-full text-left">
        <h2 className="text-3xl font-bold text-primary mb-4">Privacy Policy</h2>
        <p className="text-muted-foreground mb-4">
          Your privacy is important to us. This policy explains how TaskEngineX collects, uses, and protects your information.
        </p>
        <ul className="list-disc pl-6 space-y-2 text-base mb-6">
          <li>We only collect necessary information to provide our services.</li>
          <li>Your data is never sold to third parties.</li>
          <li>We use industry-standard security to protect your data.</li>
          <li>You can request deletion of your data at any time.</li>
        </ul>
        <p className="text-muted-foreground mt-6">
          For questions, contact <a href="mailto:privacy@taskenginex.com" className="text-primary underline">privacy@taskenginex.com</a>
        </p>
      </div>
    </div>
  );
}
