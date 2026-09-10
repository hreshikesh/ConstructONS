// ApprovalsPage.jsx
import ComingSoon from "../components/ComingSoon";
import { CheckSquare } from "lucide-react";
export default function ApprovalsPage() {
  return (
    <ComingSoon
      title="Approvals"
      description="Client decision centre — drawings, materials, designs, change requests, milestones."
      icon={CheckSquare}
    />
  );
}