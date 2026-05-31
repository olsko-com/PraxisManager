export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  category: string;
  readTime: string;
  coverImage: string;
  author: {
    name: string;
    role: string;
    avatar: string;
  };
}

export const blogPosts: BlogPost[] = [
  {
    slug: 'die-digitale-speisekarte-qr-codes-vorteile',
    title: 'Die digitale Speisekarte: Warum QR-Codes das Gasterlebnis revolutionieren',
    excerpt: 'Erfahre, wie QR-Code-Speisekarten Wartezeiten reduzieren, den durchschnittlichen Bestellwert erhöhen und deinen Gästen ein modernes, reibungsloses Restauranterlebnis bieten.',
    date: '2026-05-28',
    category: 'Ratgeber',
    readTime: '4 Min. Lesezeit',
    coverImage: 'https://images.pexels.com/photos/941861/pexels-photo-941861.jpeg?auto=compress&cs=tinysrgb&w=800',
    author: {
      name: 'Chefkoch Max',
      role: 'Gastronomie-Berater',
      avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=120&h=120&fit=crop'
    },
    content: `
      <p>Die Art und Weise, wie Menschen in Restaurants speisen, hat sich in den letzten Jahren dramatisch verändert. Eine der auffälligsten Entwicklungen ist die Ablösung der klassischen Papierkarte durch die <strong>digitale Speisekarte per QR-Code</strong>. Was anfangs als pragmatische Hygienelösung begann, hat sich zu einem der stärksten Werkzeuge für Umsatzsteigerung und Kundenzufriedenheit in der modernen Gastronomie entwickelt.</p>

      <h2>1. Keine Wartezeiten mehr für den Gast</h2>
      <p>Der größte Frustfaktor für Restaurantbesucher ist das Warten: auf den Service, um die Karte zu erhalten, auf die Bestellung und schließlich auf die Rechnung. Mit einer QR-Code-Speisekarte entfällt der erste Schritt komplett. Sobald die Gäste am Tisch sitzen, scannen sie den Code mit ihrem eigenen Smartphone und können sofort das Angebot studieren. In fortgeschrittenen Systemen wie Dáhon können sie sogar direkt bestellen und bezahlen.</p>

      <h2>2. Höherer durchschnittlicher Bestellwert (Up-Selling)</h2>
      <p>Statistiken zeigen, dass digitale Bestellsysteme den Umsatz pro Tisch um <strong>15% bis 25% steigern</strong> können. Warum? Weil ein digitales Menü nie müde wird, Up-Selling zu betreiben. Hochauflösende Fotos machen Appetit, und smarte Algorithmen können perfekt passende Beilagen (wie Trüffelpommes zur Pasta) oder das passende Getränk vorschlagen – dezent, aber hochgradig effektiv.</p>

      <h2>3. Entlastung des Servicepersonals</h2>
      <p>Der Fachkräftemangel in der Gastronomie ist allgegenwärtig. Digitale Speisekarten nehmen dem Servicepersonal zeitraubende Routineaufgaben ab – wie das Bringen und Holen von Speisekarten. Dadurch haben deine Mitarbeiter mehr Zeit für das Wesentliche: die persönliche Betreuung, das Servieren von Speisen und die Sicherstellung einer hervorragenden Atmosphäre.</p>

      <h2>4. Flexibilität bei Preis- und Menüänderungen</h2>
      <p>Druckfehler auf der Speisekarte? Ein Gericht ist ausverkauft oder die Preise für Zutaten haben sich geändert? Bei gedruckten Karten bedeutet das hohe Kosten für den Neudruck oder unschöne handschriftliche Korrekturen. Auf einer digitalen Karte sind Änderungen in Sekunden erledigt. Mit Dáhon kannst du sogar Gerichte bei plötzlichem Ausverkauf mit einem Klick auf "Ausverkauft" setzen, damit Gäste erst gar nicht enttäuscht werden.</p>

      <h2>Fazit: Die Zukunft ist digital</h2>
      <p>Die digitale Speisekarte per QR-Code ist kein vorübergehender Trend, sondern die Zukunft der Gastronomie. Sie spart Druckkosten, steigert den Umsatz und optimiert die Arbeitsabläufe deines Teams. Das Beste daran: Der Einstieg ist kinderleicht. Mit Tools wie Dáhon erstellst du in wenigen Sekunden ein professionelles Online-Menü.</p>
    `
  },
  {
    slug: 'erfolgreiches-gastronomie-marketing-tipps',
    title: 'Erfolgreiches Gastronomie-Marketing im Jahr 2026',
    excerpt: 'Von Social Media bis zur intelligenten Kundenbindung: So nutzt du digitale Instrumente, um mehr Gäste in dein Restaurant zu locken und Stammgäste langfristig zu binden.',
    date: '2026-05-20',
    category: 'Marketing',
    readTime: '5 Min. Lesezeit',
    coverImage: 'https://images.pexels.com/photos/1015568/pexels-photo-1015568.jpeg?auto=compress&cs=tinysrgb&w=800',
    author: {
      name: 'Sarah Schmidt',
      role: 'Marketing Lead',
      avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=120&h=120&fit=crop'
    },
    content: `
      <p>Ein hervorragendes Essen und erstklassiger Service sind das Fundament jedes erfolgreichen Restaurants. Doch in der heutigen Zeit reicht das allein oft nicht mehr aus. Um im dichten Wettbewerb der Gastronomie zu bestehen, ist ein durchdachtes <strong>digitales Marketing</strong> unerlässlich. In diesem Artikel zeigen wir dir die effektivsten Marketing-Trends für Gastronomen.</p>

      <h2>1. Google My Business – Dein wichtigstes Aushängeschild</h2>
      <p>Die Mehrheit der Restaurantbesuche beginnt mit einer Suche auf Google oder Google Maps (z. B. "Italiener in meiner Nähe"). Ein optimiertes Google My Business-Profil ist daher Pflicht. Achte darauf, dass deine Öffnungszeiten stimmen, pflege professionelle Fotos deiner Gerichte ein und hinterlege den direkten Link zu deiner digitalen Speisekarte. Je einfacher du es dem Gast machst, desto höher ist die Chance auf eine Reservierung.</p>

      <h2>2. Instagram & TikTok: "Das Auge isst mit"</h2>
      <p>Soziale Medien sind wie gemacht für die Gastronomie. Food-Bilder und kurze Zubereitungsvideos (Reels/TikToks) wecken Emotionen und Appetit. Teile Blicke hinter die Kulissen, stelle dein Team vor oder zeige, wie deine hausgemachte Pasta zubereitet wird. Nutzer lieben Authentizität. Binde auch deine Gäste ein, indem du sie ermutigst, Fotos von ihren Besuchen zu posten und dein Restaurant zu markieren.</p>

      <h2>3. QR-Codes als Brücke zum digitalen Marketing</h2>
      <p>QR-Codes auf den Tischen können weit mehr als nur die Speisekarte anzeigen. Nutze sie strategisch! Du kannst auf der mobilen Speisekarte einen Link zu deinem Instagram-Profil einbinden oder deine Gäste bitten, direkt nach dem Essen eine Google-Bewertung zu hinterlassen. Mit Dáhon kannst du ein direktes Feedback-System integrieren, sodass unzufriedene Gäste ihr Feedback privat an dich senden können – bevor es auf Google landet.</p>

      <h2>4. Stammkundenpflege durch exklusive Aktionen</h2>
      <p>Neukunden zu gewinnen ist teurer, als bestehende Gäste zu halten. Belohne deine Stammgäste mit zielgerichteten Aktionen. Das können regelmäßige Happy-Hour-Angebote oder saisonale Specials sein. Wenn du diese Aktionen direkt auf deiner digitalen Speisekarte hervorhebst, regst du Spontanbestellungen an und machst jeden Besuch zu einem besonderen Erlebnis.</p>

      <h2>Zusammenfassung</h2>
      <p>Modernes Gastronomie-Marketing muss nicht kompliziert sein. Mit einer starken Google-Präsenz, lebendigen Social-Media-Kanälen und einer interaktiven, verkaufsoptimierten QR-Speisekarte legst du das Fundament für ein volles Haus und nachhaltigen geschäftlichen Erfolg.</p>
    `
  },
  {
    slug: 'allergene-speisekarte-kennzeichnungspflicht-digitalisieren',
    title: 'Allergene & Kennzeichnungspflichten: So digitalisierst du deine Hinweispflichten sicher',
    excerpt: 'Die Allergenkennzeichnung ist gesetzlich vorgeschrieben, aber oft unübersichtlich. Erfahre, wie eine digitale Speisekarte deine Hinweispflichten vereinfacht und rechtssicher macht.',
    date: '2026-05-12',
    category: 'Rechtliches',
    readTime: '3 Min. Lesezeit',
    coverImage: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800',
    author: {
      name: 'Dr. Julia Weber',
      role: 'Rechtsexpertin Food Law',
      avatar: 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=120&h=120&fit=crop'
    },
    content: `
      <p>Seit Ende 2014 gilt in Europa die EU-Lebensmittelinformationsverordnung (LMIV). Für Gastronomen bedeutet das: Die 14 Hauptallergene müssen bei allen Speisen und Getränken lückenlos deklariert werden. Doch die Umsetzung in klassischen Papierkarten führt oft zu unübersichtlichen Fußnotenwüsten, die dem Gast den Appetit verderben. Eine <strong>digitale Lösung</strong> schafft hier Abhilfe.</p>

      <h2>Warum die Allergenkennzeichnung auf Papier fehleranfällig ist</h2>
      <p>Zutaten ändern sich. Wenn dein Lieferant ein anderes Produkt liefert oder die Küche ein Rezept anpasst, ändern sich oft auch die darin enthaltenen Allergene. Bei gedruckten Speisekarten führt das zu einem Dilemma: Entweder müssen alle Karten neu gedruckt werden oder die Deklaration ist schlichtweg falsch – was bei Allergikern gesundheitliche Folgen haben und hohe Bußgelder nach sich ziehen kann.</p>

      <h2>Die Vorteile einer digitalen Deklaration</h2>
      <p>Mit einer digitalen Speisekarte löst du dieses Problem elegant und rechtssicher:</p>
      <ul>
        <li><strong>Sofortige Updates:</strong> Rezepturen und Allergene können im Online-Konfigurator in Echtzeit aktualisiert werden. Keine Karte muss neu gedruckt werden.</li>
        <li><strong>Smarte Filter für Allergiker:</strong> Statt mühsam Nummern und Fußnoten abzugleichen, können Gäste in einer digitalen Karte direkt nach Allergenen filtern (z. B. "nur glutenfreie Gerichte anzeigen").</li>
        <li><strong>Saubere Optik:</strong> Die Deklaration rückt in den Hintergrund und wird erst beim Klick auf ein Gericht detailliert angezeigt. Deine Karte bleibt übersichtlich und appetitlich.</li>
      </ul>

      <h2>Was der Gesetzgeber fordert</h2>
      <p>Wichtig ist, dass die Allergeninformationen für den Gast leicht zugänglich sein müssen, <em>bevor</em> er die Bestellung aufgibt. Ein QR-Code direkt auf dem Tisch, der zur vollständigen digitalen Speisekarte führt, erfüllt diese Anforderung zu 100% und wird von Lebensmittelkontrolleuren gern gesehen – vorausgesetzt, der Zugriff ist barrierefrei und ohne Registrierungszwang möglich.</p>

      <h2>Fazit</h2>
      <p>Die Digitalisierung der Allergenkennzeichnung ist nicht nur eine enorme Entlastung für deine Küche und dein Servicepersonal, sondern auch ein echter Service für deine Gäste. Sie schafft Vertrauen, schützt Allergiker und sorgt für eine rechtssichere Betriebsführung ohne Papierchaos.</p>
    `
  }
];

export function getBlogPostBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find(post => post.slug === slug);
}
