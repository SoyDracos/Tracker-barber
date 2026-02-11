import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Barber Empire",
  description: "Dashboard for Barbers",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* CARGAR FUENTES DE BARBERÍA */}
        <link href="https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;700&family=Montserrat:wght@400;700&display=swap" rel="stylesheet" />
        <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  );
}
