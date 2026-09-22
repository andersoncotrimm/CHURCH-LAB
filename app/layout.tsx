import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "CHURCH-LAB — Plataforma digital para igrejas",
    template: "%s · CHURCH-LAB",
  },
  description:
    "CHURCH-LAB reúne eventos, pessoas, comunicação, arquivos e ministérios em um único painel para igrejas e equipes de comunicação.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={inter.variable}>
      <body className="min-h-screen font-sans">{children}</body>
    </html>
  );
}
