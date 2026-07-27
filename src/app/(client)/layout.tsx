import type { Metadata, Viewport } from "next";
import { Boldonse, Poppins } from "next/font/google";
import SmoothScroll from "@/components/SmoothScroll";
import "../globals.css";

// Tipografia oficial do manual da marca (p. 22):
//   Títulos informativos → Boldonse Regular
//   Texto em geral       → Poppins (Thin / Light / Regular / Black)
// A terceira família do manual, "Adventures" (títulos humanistas, script), não
// está no Google Fonts; entra depois como arquivo local se for usada.
const boldonse = Boldonse({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  variable: "--font-boldonse",
});

// Só os pesos que a landing usa de fato — cada peso é um arquivo baixado.
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "600", "900"],
  display: "swap",
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "Barbearia Século 21 — Cruzeiro/SP",
  description:
    "Corte, barba e tratamento em Cruzeiro/SP. Agende pelo celular em menos de um minuto, escolhendo barbeiro e horário.",
};

export const viewport: Viewport = {
  themeColor: "#0b0b0b",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${poppins.variable} ${boldonse.variable} antialiased dark`}
    >
      <body className="min-h-screen bg-xxi-ink text-xxi-white font-sans">
        <SmoothScroll>
          <main className="flex flex-col min-h-screen">{children}</main>
        </SmoothScroll>
      </body>
    </html>
  );
}
