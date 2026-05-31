import { QrCode, Languages, Sparkles, Clock, Coins, ShieldAlert } from 'lucide-react';

export default function Features() {
  const features = [
    {
      icon: QrCode,
      title: 'Tischgenaue QR-Codes',
      description: 'Generieren Sie einzigartige QR-Codes für jeden Tisch. Das System erkennt automatisch, von welchem Tisch bestellt wurde.',
      color: 'from-amber-500 to-orange-500',
    },
    {
      icon: Clock,
      title: 'Echtzeit-Aktualisierung',
      description: 'Preise anpassen oder ausverkaufte Gerichte ausblenden? Mit einem Klick ist Ihre Speisekarte auf allen Handys der Gäste aktuell.',
      color: 'from-orange-500 to-rose-500',
    },
    {
      icon: ShieldAlert,
      title: 'Allergen- & Ernährungsfilter',
      description: 'Bieten Sie Ihren Gästen die Möglichkeit, nach veganen, vegetarischen, glutenfreien oder laktosefreien Gerichten zu filtern.',
      color: 'from-rose-500 to-red-500',
    },
    {
      icon: Languages,
      title: 'Automatische Übersetzung',
      description: 'Begrüßen Sie internationale Gäste. Lassen Sie Ihre Speisekarte automatisch in Englisch, Spanisch oder Französisch übersetzen.',
      color: 'from-red-500 to-rose-500',
    },
    {
      icon: Coins,
      title: 'Bezahlen direkt am Tisch',
      description: 'Optionale Kassen-Integration: Gäste können direkt über Apple Pay, Google Pay oder Kreditkarte bezahlen. Weniger Stress für Ihr Personal.',
      color: 'from-rose-500 to-orange-500',
    },
    {
      icon: Sparkles,
      title: 'Design-Anpassung',
      description: 'Laden Sie Ihr Logo hoch und passen Sie Farben und Schriftarten an das Corporate Design Ihres Restaurants an.',
      color: 'from-orange-500 to-amber-500',
    },
  ];

  return (
    <section id="features" className="py-24 bg-zinc-50 border-y border-zinc-200/80 relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-orange-500/5 to-rose-500/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-sm font-bold tracking-widest text-amber-600 uppercase mb-3">
            Ihre Vorteile
          </h2>
          <p className="text-3xl sm:text-5xl font-extrabold text-zinc-900 tracking-tight leading-tight">
            Warum Gastronomen auf Speisekarte.digital setzen
          </p>
          <p className="text-lg text-zinc-500 mt-4 leading-relaxed">
            Optimieren Sie Ihren Service, steigern Sie Ihren Umsatz und entlasten Sie Ihr Personal mit smarten Funktionen.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="group relative bg-white border border-zinc-200/60 rounded-3xl p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-zinc-200/50 overflow-hidden"
              >
                {/* Glow behind icon */}
                <div className={`absolute top-0 left-0 w-24 h-24 bg-gradient-to-br ${feature.color} opacity-5 group-hover:opacity-10 blur-xl transition-opacity duration-300`}></div>

                {/* Icon wrapper */}
                <div className={`inline-flex p-3 rounded-2xl bg-gradient-to-br ${feature.color} text-white shadow-md shadow-orange-500/10 mb-6 group-hover:scale-105 transition-transform duration-300`}>
                  <Icon className="h-6 w-6" />
                </div>

                {/* Heading */}
                <h3 className="text-xl font-bold text-zinc-900 mb-3 group-hover:text-amber-600 transition-colors duration-200">
                  {feature.title}
                </h3>

                {/* Description */}
                <p className="text-sm text-zinc-550 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
