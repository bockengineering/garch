import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GARCH | Government Office Map",
  description:
    "Government Architecture, Relationships, Changes, and History: a public data package and demo site for government office mapping."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
