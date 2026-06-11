import type { Metadata } from "next";
import { Inter } from "next/font/google";
import SmoothScroll from "@/components/SmoothScroll";
import "../globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Barbearia Século XXI",
  description: "A sua experiência premium de barbearia",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${inter.variable} antialiased dark`}>
      <body className="min-h-screen bg-slate-950 text-slate-50 font-sans">
        <SmoothScroll>
          <main className="flex flex-col min-h-screen">
            {children}
          </main>
        </SmoothScroll>
      </body>
    </html>
  );
}
