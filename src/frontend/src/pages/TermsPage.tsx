import { ArrowLeft } from "lucide-react";
import { useNavigation } from "../context/NavigationContext";

export function TermsPage() {
  const { goBack } = useNavigation();

  return (
    <div className="min-h-screen bg-background pb-10">
      <header className="bg-charcoal px-5 pt-12 pb-5">
        <div className="flex items-center gap-3">
          <button
            type="button"
            data-ocid="terms.back.button"
            onClick={goBack}
            className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white"
          >
            <ArrowLeft size={18} />
          </button>
          <h1 className="text-lg font-extrabold text-white">
            Terms &amp; Privacy Policy
          </h1>
        </div>
      </header>

      <div className="px-5 pt-6 pb-10 space-y-6 prose prose-sm max-w-none">
        <section>
          <h2 className="text-base font-extrabold text-foreground mb-2">
            Terms of Service
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Welcome to CarryGo. By using this platform, you agree to the
            following terms.
          </p>

          <h3 className="text-sm font-bold text-foreground mt-4 mb-1">
            1. Prohibited Items
          </h3>
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-sm text-red-700 font-semibold">
              🚫 Strictly prohibited: drugs, weapons, counterfeit goods,
              hazardous materials, stolen property, or any item illegal in the
              sender's or receiver's jurisdiction. Violation may result in
              permanent account suspension and legal action.
            </p>
          </div>

          <h3 className="text-sm font-bold text-foreground mt-4 mb-1">
            2. Platform Role
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            CarryGo is a peer-to-peer matching platform. We connect senders with
            travelers but are not a courier service. We do not inspect, handle,
            or guarantee delivery of any parcel.
          </p>

          <h3 className="text-sm font-bold text-foreground mt-4 mb-1">
            3. User Responsibility
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Senders are solely responsible for accurately declaring the contents
            of their parcels. Travelers are responsible for verifying parcels
            before accepting. Both parties are responsible for complying with
            all applicable laws and customs regulations.
          </p>

          <h3 className="text-sm font-bold text-foreground mt-4 mb-1">
            4. Liability Disclaimer
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            CarryGo is not liable for loss, damage, delay, customs seizure, or
            any harm resulting from transactions conducted through the platform.
            All arrangements are between users.
          </p>

          <h3 className="text-sm font-bold text-foreground mt-4 mb-1">
            5. Ratings &amp; Trust
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Users are encouraged to rate each other honestly after completed
            deliveries. Fraudulent ratings are prohibited and may result in
            account suspension.
          </p>
        </section>

        <section>
          <h2 className="text-base font-extrabold text-foreground mb-2">
            Privacy Policy
          </h2>

          <h3 className="text-sm font-bold text-foreground mt-3 mb-1">
            Data We Collect
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            We collect your name, phone number, and activity data (parcels,
            trips, ratings) to provide the CarryGo service. Your ICP identity
            (principal) is used for authentication and is stored on the Internet
            Computer blockchain.
          </p>

          <h3 className="text-sm font-bold text-foreground mt-3 mb-1">
            How We Use Your Data
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Your data is used solely to operate the CarryGo matching platform.
            We do not sell your data to third parties. Phone numbers are visible
            to matched users for coordination purposes.
          </p>

          <h3 className="text-sm font-bold text-foreground mt-3 mb-1">
            Contact
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            For questions about these terms, contact us through the CarryGo
            platform.
          </p>
        </section>

        <p className="text-xs text-muted-foreground text-center pt-4">
          Last updated: March 2026
        </p>
      </div>
    </div>
  );
}
