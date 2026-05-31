import { Sparkles, Terminal, Cloud, Grid, Sun } from 'lucide-react';

export default function BrandStrip() {
  const brands = [
    { icon: Sparkles, name: '45 Degrees°' },
    { icon: Terminal, name: 'Codecraft_' },
    { icon: Cloud, name: 'CoreOS' },
    { icon: Grid, name: 'Fourpoints' },
    { icon: Sun, name: 'Stellar' },
  ];

  return (
    <section className="bg-[#f3f4f3] py-12 border-b border-zinc-200/50">
      <div className="max-w-7xl mx-auto px-6 flex flex-wrap justify-center md:justify-between items-center gap-8 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
        {brands.map((brand, idx) => {
          const Icon = brand.icon;
          return (
            <div key={idx} className="flex items-center space-x-2 text-zinc-900 font-sans font-bold text-sm tracking-wider uppercase">
              <Icon className="h-4.5 w-4.5 text-[#003527] shrink-0" />
              <span>{brand.name}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
