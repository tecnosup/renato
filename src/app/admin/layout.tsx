import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Sidebar } from "@/components/layout/Sidebar";
import { AdminBackground } from "@/components/layout/AdminBackground";
import { AdminThemeProvider } from "@/components/layout/AdminThemeProvider";
import { AdminNotifications } from "@/components/layout/AdminNotifications";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { NotificationsProvider } from "@/components/providers/NotificationsProvider";
import "../globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Século XXI - Gestão",
  description: "Painel de Gestão - Barbearia Século XXI",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Século XXI",
  },
  icons: {
    apple: "/logo-barbearia.png",
  },
  other: {
    "apple-mobile-web-app-capable": "yes",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" data-theme="liquid-glass" className={`${inter.variable} antialiased dark`} suppressHydrationWarning>
      <head>
        <script
          // Aplica o tema salvo antes da hidratação, evitando flash/mismatch (server sempre renderiza liquid-glass)
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem("admin-theme");if(t==="noturno"||t==="diurno")document.documentElement.dataset.theme=t;}catch(e){}`,
          }}
        />
      </head>
      <body className="relative isolate min-h-screen bg-slate-950 text-slate-50 flex font-sans" suppressHydrationWarning>
        <AuthProvider>
          <NotificationsProvider>
            <AdminThemeProvider>
              {/* Imagem de fundo */}
              <AdminBackground />

              <Sidebar />
              <AdminNotifications />
              <main id="main-scroll" className="flex-1 flex flex-col h-screen overflow-hidden pb-16 md:pb-0">
                {children}
              </main>
            </AdminThemeProvider>
          </NotificationsProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
