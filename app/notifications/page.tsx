import { NotificationsExperience } from "@/components/NotificationsExperience";
import { ProtectedRoute } from "@/components/ProtectedRoute";

export default function NotificationsPage() {
  return (
    <ProtectedRoute>
      <NotificationsExperience />
    </ProtectedRoute>
  );
}
