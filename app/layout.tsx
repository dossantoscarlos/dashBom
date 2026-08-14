import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "campanhaPRO — Gestão de Campanha & Inteligência Eleitoral",
  description:
    "Plataforma oficial de inteligência eleitoral, gestão de comitês, voluntários e monitoramento TSE em tempo real.",
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
};

import { ReactQueryProvider } from "@/components/providers/ReactQueryProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ReactQueryProvider>{children}</ReactQueryProvider>
      </body>
    </html>
  );
}

