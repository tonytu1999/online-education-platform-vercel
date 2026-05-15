import { BookOpen, Bot, ClipboardCheck, BarChart3, User } from "lucide-react";
import type { TabItem } from "@/components/mobile/BottomTab";

export const studentTabs: TabItem[] = [
  { to: "/student/learn", label: "tab.learn", icon: BookOpen },
  { to: "/student/ai", label: "tab.ai", icon: Bot },
  { to: "/student/test", label: "tab.test", icon: ClipboardCheck },
  { to: "/student/progress", label: "tab.progress", icon: BarChart3 },
  { to: "/student/me", label: "tab.me", icon: User },
];
