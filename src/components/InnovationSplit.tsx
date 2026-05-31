import { Gauge, Languages } from 'lucide-react';
import Image from 'next/image';

export default function InnovationSplit() {
  return (
    <section className="px-6 lg:px-8 max-w-7xl mx-auto py-20 bg-transparent">
      <div className="bg-[#f3f4f3] rounded-[3rem] overflow-hidden grid grid-cols-1 lg:grid-cols-2 border border-[#bfc9c3]/30">
        
        {/* Left side text info */}
        <div className="p-8 md:p-16 flex flex-col justify-center gap-8">
          <span className="bg-[#d1dcdb] text-[#043f2d] px-4 py-1.5 rounded-full text-xs font-bold tracking-wider w-fit font-sans">
            Sofortige Lösungen
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold font-sans text-[#003527] tracking-tight leading-tight">
            Unsere Innovation
          </h2>
          <p className="text-base text-[#404944] leading-relaxed font-sans">
            Unser jüngster Durchbruch in der Hospitality-Technologie verbindet herausragende operative Leistung mit beispielloser Eleganz.
          </p>
          
          <div className="flex flex-col gap-6">
            <div className="flex gap-4">
              <div className="shrink-0 w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-[#003527]">
                <Gauge className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-bold text-[#003527] font-sans">Performance</h4>
                <p className="text-sm text-[#404944] font-sans mt-0.5 leading-relaxed">
                  Automatisierte Bestellungen, Tischzuweisungen und optimierte Arbeitsabläufe, damit du dich ganz auf das Essen konzentrieren kannst.
                </p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="shrink-0 w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-[#003527]">
                <Languages className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-bold text-[#003527] font-sans">Barrierefreiheit</h4>
                <p className="text-sm text-[#404944] font-sans mt-0.5 leading-relaxed">
                  Eine mehrsprachige Benutzeroberfläche für Personal und Gäste gleichermaßen – für perfekten Service ohne Sprachbarrieren.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right side image */}
        <div className="relative min-h-[400px] lg:min-h-full">
          <Image
            alt="Innovation in Action"
            src="/Digitale-Speisekarte-QR-Code-im-Restaurant.jpg"
            fill
            className="object-cover"
          />
        </div>
      </div>
    </section>
  );
}
