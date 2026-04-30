import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import Footer from "./components/Footer";
import Nav from "./components/Nav";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HireNova - AI-Powered Job Suggestion",
  description:
    "HireNova is an AI-powered job suggestion platform that matches you with the best opportunities based on your skills and experience. Get personalized job recommendations and take your career to the next level with HireNova.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} h-full antialiased`}>
      <body className="min-h-full">
        <div className="flex min-h-screen flex-col from-gray-950 via-gray-900 to-black text-white">
          <Nav />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
