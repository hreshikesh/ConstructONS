// DocumentsPage.jsx
import ComingSoon from "../components/ComingSoon";
import { FolderOpen } from "lucide-react";
export default function DocumentsPage() {
  return (
    <ComingSoon
      title="Documents"
      description="Digital record room — contracts, BOQ, invoices, warranties, reports, handover packs."
      icon={FolderOpen}
    />
  );
}