import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BlastGuard — Graph-Powered Cloud Security Investigation & Remediation",
  description:
    "Trace the attack. Cut the path. Prove it's gone. Built on FalkorDB for the FalkorDB Graph Hacks Hackathon.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-canvas text-text-primary antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
