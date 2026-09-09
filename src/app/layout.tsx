import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { Church, Users, UserCircle, Bell, LogIn } from "lucide-react";
import "./globals.css";
import { getSessionUser } from "@/lib/session";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Community Gatherings",
  description: "Sign up, join a group, and discuss topics together.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const user = await getSessionUser();

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-amber-50/40">
        <header className="border-b border-amber-100 bg-white">
          <nav className="mx-auto flex max-w-2xl items-center gap-5 p-4 text-sm">
            <Link href="/" className="flex items-center gap-1.5 font-semibold text-amber-900">
              <Church size={20} className="text-amber-600" />
              Community Gatherings
            </Link>
            {user ? (
              <>
                <Link href="/groups" className="flex items-center gap-1.5 text-gray-700 hover:text-amber-700">
                  <Users size={18} />
                  Groups
                </Link>
                <Link href="/profile" className="flex items-center gap-1.5 text-gray-700 hover:text-amber-700">
                  <UserCircle size={18} />
                  Profile
                </Link>
                <Link href="/notifications" className="flex items-center gap-1.5 text-gray-700 hover:text-amber-700">
                  <Bell size={18} />
                  Notifications
                </Link>
              </>
            ) : (
              <Link
                href="/login"
                className="ml-auto flex items-center gap-1.5 text-gray-700 hover:text-amber-700"
              >
                <LogIn size={18} />
                Log in
              </Link>
            )}
          </nav>
        </header>
        <div className="flex-1">{children}</div>
      </body>
    </html>
  );
}
