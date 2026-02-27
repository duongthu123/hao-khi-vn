import type { Metadata } from 'next';
import { getCanonicalUrl, getLanguageAlternates } from '@/lib/seo/canonicalUrl';
import ResponsiveTestClient from './ResponsiveTestClient';

/**
 * Responsive Layout Test Page
 * 
 * This page demonstrates responsive behavior across different breakpoints.
 * Use browser DevTools to test at various screen sizes.
 * 
 * Validates Requirement 20.1
 */

export const metadata: Metadata = {
  title: 'Responsive Layout Test',
  description: 'Test page for responsive design breakpoints - Mobile, Tablet, and Desktop layouts for Vietnamese Historical Strategy Game',
  alternates: {
    canonical: getCanonicalUrl('/responsive-test'),
    languages: getLanguageAlternates('/responsive-test'),
  },
  robots: {
    index: false, // Don't index test pages
    follow: false,
  },
};

export default function ResponsiveTestPage() {
  return <ResponsiveTestClient />;
}
