import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Providers } from '@/components/providers/Providers';
import { generateMainPageStructuredData } from '@/lib/seo/structuredData';
import { getCanonicalUrl, getLanguageAlternates } from '@/lib/seo/canonicalUrl';

// Google Fonts link for original game fonts
const FONT_LINK = 'https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;700&family=Merriweather:wght@400;700&family=Oswald:wght@400;600;700&family=Playfair+Display:wght@400;700&display=swap';

export const metadata: Metadata = {
  title: {
    default: 'Đại Chiến Sử Việt - Hào Khí Đông A | Vietnamese Strategy Game',
    template: '%s | Đại Chiến Sử Việt',
  },
  description: 'Trò chơi chiến lược lịch sử Việt Nam - Tái hiện trận Bạch Đằng huyền thoại với các anh hùng nhà Trần. Vietnamese Historical Strategy Game - Relive the legendary Battle of Bach Dang River with Tran Dynasty heroes. Educational game featuring Vietnamese history and culture.',
  keywords: [
    'Vietnamese history',
    'strategy game',
    'Bach Dang',
    'Tran Dynasty',
    'educational game',
    'lịch sử Việt Nam',
    'game chiến lược',
    'nhà Trần',
    'Bạch Đằng',
    'game giáo dục',
    'Mongol invasion',
    'Vietnamese heroes',
    'historical warfare',
    'turn-based strategy',
  ],
  authors: [{ name: 'Vietnamese History Game Team' }],
  creator: 'Vietnamese History Game Team',
  publisher: 'Vietnamese History Game Team',
  applicationName: 'Đại Chiến Sử Việt',
  category: 'game',
  classification: 'Educational Strategy Game',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'),
  alternates: {
    canonical: getCanonicalUrl('/'),
    languages: getLanguageAlternates('/'),
  },
  openGraph: {
    title: 'Đại Chiến Sử Việt - Hào Khí Đông A',
    description: 'Trò chơi chiến lược lịch sử Việt Nam - Tái hiện trận Bạch Đằng huyền thoại với các anh hùng nhà Trần. Vietnamese Historical Strategy Game featuring the legendary Battle of Bach Dang River.',
    type: 'website',
    locale: 'vi_VN',
    alternateLocale: ['en_US'],
    siteName: 'Đại Chiến Sử Việt - Hào Khí Đông A',
    url: '/',
    images: [
      {
        url: '/images/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Đại Chiến Sử Việt - Vietnamese Historical Strategy Game featuring Tran Dynasty heroes and the Battle of Bach Dang River',
        type: 'image/png',
      },
      {
        url: '/images/og-image-square.png',
        width: 1200,
        height: 1200,
        alt: 'Đại Chiến Sử Việt - Vietnamese Historical Strategy Game',
        type: 'image/png',
      },
    ],
    videos: [
      {
        url: '/videos/gameplay-preview.mp4',
        width: 1280,
        height: 720,
        type: 'video/mp4',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Đại Chiến Sử Việt - Hào Khí Đông A',
    description: 'Vietnamese Historical Strategy Game - Battle of Bach Dang River. Educational game featuring Vietnamese history, Tran Dynasty heroes, and strategic warfare.',
    creator: '@vietnamesehistorygame',
    site: '@vietnamesehistorygame',
    images: ['/images/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  minimumScale: 1,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#1a1a1a' },
  ],
  colorScheme: 'light dark',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const structuredData = generateMainPageStructuredData(baseUrl);

  return (
    <html lang="vi" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href={FONT_LINK} rel="stylesheet" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: structuredData }}
        />
      </head>
      <body className="antialiased bg-[#1a1a1a] text-white overflow-x-hidden">
        <Providers>
          <div id="root" role="application" aria-label="Đại Chiến Sử Việt - Vietnamese Historical Strategy Game">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
