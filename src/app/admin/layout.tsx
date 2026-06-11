import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Sidebar } from "@/components/layout/Sidebar";
import "../globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Século XXI - Gestão",
  description: "Painel de Gestão - Barbearia Século XXI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${inter.variable} antialiased dark`}>
      <body className="relative isolate min-h-screen bg-slate-950 text-slate-50 flex font-sans">
        {/* Imagem de fundo */}
        <div
          className="fixed inset-0 -z-10 bg-cover bg-center"
          style={{ backgroundImage: "url('/barbearia-bg.png')" }}
        />
        <div className="fixed inset-0 -z-10 bg-slate-950/40" />

        <Sidebar />
        <main id="main-scroll" className="flex-1 flex flex-col h-screen overflow-hidden pb-16 md:pb-0">
          {children}
        </main>
      </body>
    </html>
  );
}
