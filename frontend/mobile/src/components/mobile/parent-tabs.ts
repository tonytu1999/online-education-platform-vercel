import { LayoutDashboard, BookMarked, Heart, Users, User } from "lucide-react";
import type { TabItem } from "@/components/mobile/BottomTab";

export const parentTabs: TabItem[] = [
  { to: "/parent/overview", label: "tab.overview", icon: LayoutDashboard },
  { to: "/parent/subjects", label: "tab.subjects", icon: BookMarked },
  { to: "/parent/wellbeing", label: "tab.wellbeing", icon: Heart },
  { to: "/parent/children", label: "tab.children", icon: Users },
  { to: "/parent/me", label: "tab.me", icon: User },
];
