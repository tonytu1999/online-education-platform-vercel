import { ReactNode } from "react";
import { BottomTab, TabItem } from "./BottomTab";
import { AppBar } from "./AppBar";

interface Props {
  title?: string;
  back?: boolean;
  right?: ReactNode;
  tabs?: TabItem[];
  children: ReactNode;
  noPad?: boolean;
}

export function MobileShell({ title, back, right, tabs, children, noPad }: Props) {
  return (
    <div className="phone-frame">
      {title && <AppBar title={title} back={back} right={right} />}
      <main
        className={`flex-1 overflow-y-auto ${noPad ? "" : "px-4 py-4"}`}
        style={{ paddingBottom: tabs ? 88 : 24 }}
      >
        {children}
      </main>
      {tabs && <BottomTab items={tabs} />}
    </div>
  );
}
