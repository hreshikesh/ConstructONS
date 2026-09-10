// SiteReportsPage.jsx
import ComingSoon from "../components/ComingSoon";
import { ClipboardList } from "lucide-react";
export default function SiteReportsPage() {
  return (
    <ComingSoon
      title="Site Reports"
      description="Daily construction diary — labour, materials, progress, safety, photos, next-day plan."
      icon={ClipboardList}
    />
  );
}