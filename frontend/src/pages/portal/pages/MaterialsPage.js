// MaterialsPage.jsx
import ComingSoon from "../components/ComingSoon";
import { Package } from "lucide-react";
export default function MaterialsPage() {
  return (
    <ComingSoon
      title="Materials"
      description="Spec → brand → order → delivery → inspection → install → warranty for every material."
      icon={Package}
    />
  );
}