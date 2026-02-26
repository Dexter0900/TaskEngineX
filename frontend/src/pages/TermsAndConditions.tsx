import { useNavigate } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";

export default function TermsAndConditions() {
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
        <h2 className="text-3xl font-bold text-primary mb-4">Terms & Conditions</h2>
        <p className="text-muted-foreground mb-4">
          By using TaskEngineX, you agree to our terms and conditions. Please read them carefully before using the platform.
        </p>
        <ul className="list-disc pl-6 space-y-2 text-base mb-6">
          <li>Use the platform responsibly and ethically.</li>
          <li>Do not misuse or attempt to disrupt the service.</li>
          <li>Respect the privacy and data of other users.</li>
          <li>All content and data are subject to our privacy policy.</li>
        </ul>
        <p className="text-muted-foreground mt-6">
          For more details, contact <a href="mailto:support@taskenginex.com" className="text-primary underline">support@taskenginex.com</a>
        </p>
      </div>
    </div>
  );
}
