import { ReactNode } from "react";
import { useRouter } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";

export function AppBar({ title, back, right }: { title: string; back?: boolean; right?: ReactNode }) {
  const router = useRouter();
  return (
    <header className="sticky top-0 z-10 flex items-center gap-2 border-b border-border bg-background/85 px-4 py-3 backdrop-blur">
      {back ? (
        <button
          onClick={() => router.history.back()}
          className="-ml-2 rounded-full p-1 text-foreground hover:bg-muted"
          aria-label="返回"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
      ) : (
        <span className="w-1" />
      )}
      <h1 className="flex-1 text-base font-semibold tracking-tight">{title}</h1>
      {right}
    </header>
  );
}
