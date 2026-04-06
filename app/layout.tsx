import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ProposalFlow — Create, Send & Close",
  description: "Professional proposal generation with e-signatures and payments",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className={`${geist.className} min-h-full bg-gray-50 antialiased`} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
