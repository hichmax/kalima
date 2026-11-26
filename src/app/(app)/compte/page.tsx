import type { Metadata } from "next";
import { AccountView } from "@/components/account-view";

export const metadata: Metadata = { title: "Mon compte", robots: { index: false } };

export default function ComptePage() {
  return (
    <main className="container page stack narrow" style={{ "--gap": "22px" } as React.CSSProperties}>
      <AccountView />
    </main>
  );
}
