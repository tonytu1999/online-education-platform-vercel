import { createFileRoute, Outlet, Navigate } from "@tanstack/react-router";
import { useAppStore } from "@/lib/store";

export const Route = createFileRoute("/student")({
  component: StudentLayout,
});

function StudentLayout() {
  const { loggedIn, role } = useAppStore();
  if (!loggedIn) return <Navigate to="/login" />;
  if (role !== "student") return <Navigate to="/role" />;
  return <Outlet />;
}
