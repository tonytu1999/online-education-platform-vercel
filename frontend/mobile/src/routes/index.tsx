import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useAppStore } from "@/lib/store";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const { loggedIn, role, onboarded } = useAppStore();
  if (!loggedIn) return <Navigate to="/login" />;
  if (!onboarded) return <Navigate to="/onboarding" />;
  if (role) return <Navigate to={role === "student" ? "/student/learn" : "/parent/overview"} />;
  return <Navigate to="/role" />;
}
