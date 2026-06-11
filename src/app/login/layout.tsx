import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Entrar - Século XXI",
  description: "Painel de Gestão - Barbearia Século XXI",
};

export default function LoginLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${inter.variable} antialiased dark`}>
      <body className="relative isolate min-h-screen bg-slate-950 text-slate-50 font-sans">
        <div
          className="fixed inset-0 -z-10 bg-cover bg-center"
          style={{ backgroundImage: "url('/barbearia-bg.png')" }}
        />
        <div className="fixed inset-0 -z-10 bg-slate-950/60" />
        {children}
      </body>
    </html>
  );
}
