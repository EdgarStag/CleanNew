import type { Metadata, Viewport } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'CleanNew | Limpieza · Cuidado · Protección',
  description: 'CleanNew - La mayor red de limpieza y blindaje de tapicerías. Presente en más de 12 países. Nanotecnología para proteger y revitalizar sus muebles.',
  keywords: 'CleanNew, blindaje, higienización, limpieza de tapicería, protección de muebles, nanotecnología, revitalización de cuero',
  openGraph: {
    title: 'CleanNew | Limpieza · Cuidado · Protección',
    description: 'CleanNew - La mayor red de limpieza y blindaje de tapicerías. Presente en más de 12 países. Nanotecnología para proteger y revitalizar sus muebles.',
    type: 'website',
  }
};

export const viewport: Viewport = {
  themeColor: '#139D69',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${inter.variable} ${playfair.variable} ${inter.className}`}>
        {children}
      </body>
    </html>
  );
}
