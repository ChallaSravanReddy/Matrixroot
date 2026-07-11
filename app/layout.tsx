import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Matrix Root | Enterprise Software Solutions & IT Internships",
  description: "Matrix Root is an MSME-registered institution providing advanced web development solutions and professional 8-week IT training tracks with verifiable certification.",
  keywords: ["Matrixroot", "Matrix Root", "Matrix Root Internship", "IT Training", "Web Development", "MSME Registered"],
  verification: {
    google: "GOOGLE_VERIFICATION_PLACEHOLDER",
  },
};

import { AuthGuard } from "@/components/AuthGuard";
import { NotificationProvider } from "@/components/NotificationProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <link rel="preconnect" href="https://checkout.razorpay.com" />
        <link rel="preconnect" href="https://api.razorpay.com" />
      </head>
      <body className="min-h-full flex flex-col font-sans bg-[#FAF6F0] text-[#1A1A1A]" suppressHydrationWarning>
        <NotificationProvider>
          <AuthGuard />
          {children}
        </NotificationProvider>
      </body>
    </html>
  );
}
