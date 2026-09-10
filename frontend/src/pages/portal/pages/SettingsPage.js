// SettingsPage.jsx
import ComingSoon from "../components/ComingSoon";
import { Settings } from "lucide-react";
export default function SettingsPage() {
  return (
    <ComingSoon
      title="Settings"
      description="Profile, notifications, security, preferences for your ConstructONS account."
      icon={Settings}
    />
  );
}