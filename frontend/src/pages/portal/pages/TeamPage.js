// TeamPage.jsx
import ComingSoon from "../components/ComingSoon";
import { Users } from "lucide-react";
export default function TeamPage() {
  return (
    <ComingSoon
      title="Team"
      description="PM, site engineer, architect, quality, safety, contractors — role-based access."
      icon={Users}
    />
  );
}