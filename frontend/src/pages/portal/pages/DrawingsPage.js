// DrawingsPage.jsx
import ComingSoon from "../components/ComingSoon";
import { PencilRuler } from "lucide-react";
export default function DrawingsPage() {
  return (
    <ComingSoon
      title="Drawings"
      description="Architectural, structural, MEP drawings with revision control and approval status."
      icon={PencilRuler}
    />
  );
}