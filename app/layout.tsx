import type { Metadata } from "next";
import { Source_Sans_3, Hanken_Grotesk, Geist_Mono } from "next/font/google";
import { getIdioma } from "@/lib/i18n";
import "./globals.css";

const sourceSans = Source_Sans_3({
  variable: "--font-source-sans",
  subsets: ["latin"],
});

const hankenGrotesk = Hanken_Grotesk({
  variable: "--font-hanken-grotesk",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Coworking SaaS",
  description: "Gestió de reserves per a coworkings",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const idioma = await getIdioma();

  return (
    <html
      lang={idioma}
      className={`${sourceSans.variable} ${hankenGrotesk.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
