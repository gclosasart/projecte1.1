import type { Metadata } from "next";
import { Nunito_Sans, Geist_Mono } from "next/font/google";
import { getIdioma } from "@/lib/i18n";
import "./globals.css";

// Tipografia única, arrodonida i càlida a l'estil Airbnb (Cereal és propietària;
// Nunito Sans n'és l'alternativa lliure més propera), tant per al cos com per
// als títols.
const nunitoSans = Nunito_Sans({
  variable: "--font-nunito-sans",
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
      className={`${nunitoSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
