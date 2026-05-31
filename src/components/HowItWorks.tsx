import { Edit3, Printer, Utensils } from 'lucide-react';

export default function HowItWorks() {
  const steps = [
    {
      step: '01',
      icon: Edit3,
      title: 'Online erstellen',
      description: 'Legen Sie Kategorien an, tragen Sie Ihre Gerichte, Beschreibungen, Preise und Allergene ein. Passen Sie das Design mit einem Klick an Ihr Branding an.',
    },
    {
      step: '02',
      icon: Printer,
      title: 'QR-Codes platzieren',
      description: 'Generieren Sie QR-Codes für Ihre Tische, Theke oder den Eingangsbereich. Laden Sie die Codes als hochauflösende Druckvorlage herunter.',
    },
    {
      step: '03',
      icon: Utensils,
      title: 'Scannen & Bestellen',
      description: 'Ihre Gäste scannen den Code am Tisch mit ihrem eigenen Smartphone. Die Karte lädt sofort im Browser. Keine Registrierung, keine App nötig.',
    },
  ];

  return (
    <section id="how-it-works" className="py-24 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-24">
          <h2 className="text-sm font-bold tracking-widest text-amber-600 uppercase mb-3">
            In wenigen Schritten live
          </h2>
          <p className="text-3xl sm:text-5xl font-extrabold text-zinc-900 tracking-tight leading-tight">
            Wie einfach funktioniert es?
          </p>
          <p className="text-lg text-zinc-500 mt-4 leading-relaxed">
            In weniger als 10 Minuten machen Sie Ihr Restaurant fit für die digitale Zukunft.
          </p>
        </div>

        {/* Steps Layout */}
        <div className="relative">
          {/* Connector Line for Desktop - Light Mode */}
          <div className="hidden lg:block absolute top-1/2 left-4 right-4 h-0.5 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-rose-500/10 -translate-y-1/2 z-0"></div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 relative z-10">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={index} className="flex flex-col items-center text-center group">
                  {/* Step Number Circle */}
                  <div className="relative mb-8">
                    {/* Glowing ring */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-amber-500 to-rose-500 rounded-full blur-md opacity-10 group-hover:opacity-25 group-hover:scale-110 transition-all duration-300"></div>

                    {/* Main Circle */}
                    <div className="relative flex items-center justify-center w-20 h-20 bg-zinc-50 border border-zinc-200 rounded-full group-hover:border-amber-500/50 transition-colors duration-300 shadow-sm">
                      <Icon className="h-7 w-7 text-amber-600 group-hover:text-amber-500 group-hover:scale-105 transition-all duration-300" />
                      
                      {/* Step Number Tag */}
                      <span className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-tr from-amber-500 to-rose-500 text-[10px] font-black text-white shadow-md">
                        {step.step}
                      </span>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-2xl font-bold text-zinc-900 mb-4 group-hover:text-amber-600 transition-colors">
                    {step.title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-zinc-500 max-w-sm leading-relaxed">
                    {step.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
