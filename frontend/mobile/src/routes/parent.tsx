import { createFileRoute, Outlet, Navigate } from "@tanstack/react-router";
import { useAppStore } from "@/lib/store";

export const Route = createFileRoute("/parent")({
  component: ParentLayout,
});

function ParentLayout() {
  const { loggedIn, role } = useAppStore();
  if (!loggedIn) return <Navigate to="/login" />;
  if (!role || role !== "parent") return <Navigate to="/onboarding" />;
  return <Outlet />;
}
