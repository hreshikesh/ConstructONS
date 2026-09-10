// LiveCCTVPage.jsx
import ComingSoon from "../components/ComingSoon";
import { Video } from "lucide-react";
export default function LiveCCTVPage() {
  return (
    <ComingSoon
      title="Live CCTV"
      description="Multi-camera live site feeds, status, and recordings — linked to your Project ID."
      icon={Video}
    />
  );
}