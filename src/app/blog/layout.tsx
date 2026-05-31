import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dáhon Blog | Tipps & Trends für die moderne Gastronomie',
  description: 'Erfahre, wie du dein Restaurant erfolgreich digitalisierst, den Umsatz steigerst, das Gasterlebnis optimierst und deine Hinweispflichten sicher deklarierst.',
  keywords: ['digitale speisekarte', 'qr code speisekarte', 'gastronomie digitalisierung', 'restaurant marketing', 'allergenkennzeichnung gastronomie'],
  openGraph: {
    title: 'Dáhon Blog | Tipps & Trends für die moderne Gastronomie',
    description: 'Erfahre, wie du dein Restaurant erfolgreich digitalisierst, den Umsatz steigerst und das Gasterlebnis optimierst.',
    type: 'website',
  }
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
