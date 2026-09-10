// PaymentsPage.jsx
import ComingSoon from "../components/ComingSoon";
import { Wallet } from "lucide-react";
export default function PaymentsPage() {
  return (
    <ComingSoon
      title="Payments"
      description="Milestone-linked payments with work proof, quality gate, invoice, and receipt trail."
      icon={Wallet}
    />
  );
}