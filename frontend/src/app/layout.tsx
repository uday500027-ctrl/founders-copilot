import type { Metadata } from "next";
import { Archivo } from "next/font/google";
import "./globals.css";

const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-archivo",
  axes: ["wdth"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Praxism",
  description: "Turn ideas into clear next moves.",
  icons: {
    icon: "/logo.jpg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${archivo.variable} dark h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-graphite text-bone">
        {children}
      </body>
    </html>
  );
}
