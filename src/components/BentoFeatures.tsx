import { ArrowRight, QrCode, Menu, BarChart3 } from 'lucide-react';

export default function BentoFeatures() {
  return (
    <section id="features" className="px-6 lg:px-8 max-w-7xl mx-auto py-20 bg-transparent">
      {/* Header */}
      <div className="text-center mb-16 flex flex-col items-center">
        <span className="bg-[#d1dcdb] text-[#043f2d] px-4 py-1.5 rounded-full text-xs font-bold tracking-wider mb-4 font-sans">
          Modern & Skalierbar
        </span>
        <h2 className="text-3xl sm:text-4xl font-semibold font-sans text-[#003527] tracking-tight">
          Smarter arbeiten, nicht härter
        </h2>
        <p className="text-base text-[#404944] mt-3 max-w-2xl font-sans">
          Steigere die Produktivität, bringe Klarheit in die Küche und maximiere deinen Umsatz mit unserer digitalen Speisekarte.
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Instant QR Updates */}
        <div className="bg-[#f3f4f3] p-8 rounded-[2rem] border border-[#bfc9c3]/30 hover:border-[#003527]/20 transition-all duration-300 group flex flex-col justify-between min-h-[320px]">
          <div>
            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-105">
              <QrCode className="text-[#003527] h-7 w-7" />
            </div>
            <h3 className="text-xl font-semibold font-sans text-[#003527] mb-3">
              Sofortige QR-Updates
            </h3>
            <p className="text-sm text-[#404944] leading-relaxed font-sans">
              Passe Gerichte, Preise und Verfügbarkeiten in Echtzeit an. Änderungen sind sofort auf allen Smartphones der Gäste aktiv.
            </p>
          </div>
        </div>

        {/* Card 2: Dynamic Menus */}
        <div className="bg-[#003527] text-white p-8 rounded-[2rem] hover:opacity-98 transition-all duration-300 flex flex-col justify-between min-h-[320px]">
          <div>
            <div className="w-14 h-14 bg-[#0b513d] rounded-2xl flex items-center justify-center mb-6">
              <Menu className="text-white h-7 w-7" />
            </div>
            <h3 className="text-xl font-semibold font-sans text-white! mb-3">
              Dynamische Menüs
            </h3>
            <p className="text-sm text-zinc-300 leading-relaxed font-sans">
              Nutze intelligente Automatisierung, um deine Küche zu entlasten und Gästen personalisierte Empfehlungen anzubieten.
            </p>
          </div>
          <button className="mt-8 flex items-center gap-2 text-sm font-bold text-white hover:translate-x-1.5 transition-transform w-fit cursor-pointer">
            Mehr erfahren <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        {/* Card 3: Insightful Analytics */}
        <div className="bg-[#f3f4f3] p-8 rounded-[2rem] border border-[#bfc9c3]/30 hover:border-[#003527]/20 transition-all duration-300 group flex flex-col justify-between min-h-[320px]">
          <div>
            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-105">
              <BarChart3 className="text-[#003527] h-7 w-7" />
            </div>
            <h3 className="text-xl font-semibold font-sans text-[#003527] mb-3">
              Erkenntnisreiche Analysen
            </h3>
            <p className="text-sm text-[#404944] leading-relaxed font-sans">
              Schütze deine Margen mit datenbasierten Einblicken in das Bestellverhalten der Gäste und reduziere Lebensmittelabfälle.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
