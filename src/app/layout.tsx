import type { Metadata } from 'next';
import { Archivo, Archivo_Narrow } from 'next/font/google';

import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';
import { DrawingFrame } from '@/components/ui';
import { SITE_DESCRIPTION, SITE_KEYWORDS, SITE_NAME, siteUrl } from '@/lib/seo';
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

const defaultTitle = 'Job Portal: find jobs, apply and track every application';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: defaultTitle,
    template: '%s · Job Portal',
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: SITE_KEYWORDS,
  authors: [{ name: 'Karthik Rao' }],
  creator: 'Karthik Rao',
  publisher: 'Karthik Rao',
  openGraph: {
    type: 'website',
    siteName: SITE_NAME,
    locale: 'en_IN',
    title: defaultTitle,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: 'summary_large_image',
    title: defaultTitle,
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
  // Google Search Console's HTML-tag verification. Set the token in the
  // host's env vars; when it is unset no tag is rendered.
  ...(process.env.GOOGLE_SITE_VERIFICATION && {
    verification: { google: process.env.GOOGLE_SITE_VERIFICATION },
  }),
  formatDetection: { telephone: false, email: false, address: false },
  category: 'jobs',
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
