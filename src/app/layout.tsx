import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
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
      <body className="min-h-full flex flex-col">
        <header className="border-b">
          <nav className="mx-auto flex max-w-2xl items-center gap-4 p-4 text-sm">
            <Link href="/" className="font-semibold">
              Community Gatherings
            </Link>
            {user && (
              <>
                <Link href="/groups">Groups</Link>
                <Link href="/profile">Profile</Link>
                <Link href="/notifications">Notifications</Link>
              </>
            )}
          </nav>
        </header>
        <div className="flex-1">{children}</div>
      </body>
    </html>
  );
}
