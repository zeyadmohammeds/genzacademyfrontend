import type { Metadata } from "next";
import "./globals.css";
import { SmoothProvider } from "@/components/SmoothProvider";
import { Providers } from "../components/Providers";
import { AppShell } from "@/components/AppShell";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { validateEnv } from "@/lib/env-config";

validateEnv();

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "ElSewedy GenZ Coders | Project-First Youth Tech Academy",
  description:
    "A project-first youth technology academy with live course rooms, XP engine, referrals, smart admissions, and parent visibility. Built by ElSewedy Electrometer.",
  keywords: ["coding", "academy", "youth", "Egypt", "ElSewedy", "programming", "robotics", "AI"],
  openGraph: {
    title: "ElSewedy GenZ Coders",
    description: "Egypt's leading youth tech academy. Learn code like a studio, not like a playlist.",
    type: "website",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={inter.className}>
        <Providers>
          <SmoothProvider>
            <AppShell>
              {children}
            </AppShell>
            <Analytics />
          </SmoothProvider>
        </Providers>
      </body>
    </html>
  );
}
