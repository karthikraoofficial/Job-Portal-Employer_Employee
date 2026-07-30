import type { Metadata } from 'next';
import { Archivo, Archivo_Narrow } from 'next/font/google';

import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';
import { DrawingFrame } from '@/components/ui';
import './globals.css';

// Archivo Narrow is the drafting lettering; Archivo carries prose. Two cuts of
// one lineage, so labels and body never look like two different systems.
const archivo = Archivo({
  variable: '--font-archivo',
  subsets: ['latin'],
  display: 'swap',
});

const archivoNarrow = Archivo_Narrow({
  variable: '--font-archivo-narrow',
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Job Portal — openings on record',
    template: '%s · Job Portal',
  },
  description:
    'A job board where your application is a dated, numbered record you can check — not a form that disappears.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${archivo.variable} ${archivoNarrow.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <SiteHeader />
        {/* Every route sits inside the drawing frame. */}
        <main className="mx-auto w-full max-w-[1240px] flex-1 sm:px-6 sm:py-8">
          <DrawingFrame>{children}</DrawingFrame>
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
