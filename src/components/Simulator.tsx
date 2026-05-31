'use client';

import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Smartphone, QrCode, Sparkles, Check, Flame, Leaf, AlertCircle } from 'lucide-react';

interface MenuItem {
  restaurantName: string;
  accentColor: string;
  category: string;
  name: string;
  price: string;
  description: string;
  isVegan: boolean;
  isVegetarian: boolean;
  isSpicy: boolean;
  isGlutenFree: boolean;
}

export default function Simulator() {
  const [menu, setMenu] = useState<MenuItem>({
    restaurantName: 'La Taverna',
    accentColor: 'amber',
    category: 'Hauptspeisen',
    name: 'Hausgemachte Trüffel-Tagliatelle',
    price: '16.80',
    description: 'Frische Bandnudeln geschwenkt in cremiger Trüffelsauce, verfeinert mit gehobeltem schwarzen Trüffel und frischem Parmesan.',
    isVegan: false,
    isVegetarian: true,
    isSpicy: false,
    isGlutenFree: false,
  });

  const [activeTab, setActiveTab] = useState('Hauptspeisen');
  const [showQRModal, setShowQRModal] = useState(false);

  const colors = [
    { id: 'amber', label: 'Bernstein', bg: 'bg-amber-500', text: 'text-amber-600' },
    { id: 'emerald', label: 'Smaragd', bg: 'bg-emerald-500', text: 'text-emerald-600' },
    { id: 'rose', label: 'Rosé', bg: 'bg-rose-500', text: 'text-rose-600' },
    { id: 'indigo', label: 'Indigo', bg: 'bg-indigo-500', text: 'text-indigo-600' },
    { id: 'orange', label: 'Orange', bg: 'bg-orange-500', text: 'text-orange-600' },
  ];

  const colorMap: Record<string, { bg: string; text: string; border: string; ring: string; lightBg: string }> = {
    amber: { bg: 'bg-amber-500', text: 'text-amber-600', border: 'border-amber-500/35', ring: 'focus:ring-amber-500', lightBg: 'bg-amber-500/10' },
    emerald: { bg: 'bg-emerald-500', text: 'text-emerald-600', border: 'border-emerald-500/35', ring: 'focus:ring-emerald-500', lightBg: 'bg-emerald-500/10' },
    rose: { bg: 'bg-rose-500', text: 'text-rose-600', border: 'border-rose-500/35', ring: 'focus:ring-rose-500', lightBg: 'bg-rose-500/10' },
    indigo: { bg: 'bg-indigo-500', text: 'text-indigo-600', border: 'border-indigo-500/35', ring: 'focus:ring-indigo-500', lightBg: 'bg-indigo-500/10' },
    orange: { bg: 'bg-orange-500', text: 'text-orange-600', border: 'border-orange-500/35', ring: 'focus:ring-orange-500', lightBg: 'bg-orange-500/10' },
  };

  const currentColor = colorMap[menu.accentColor] || colorMap.amber;

  // Generate a live URL that restaurant owners can scan with their actual phone, pointing to the /menu route!
  const generatePreviewUrl = () => {
    if (typeof window === 'undefined') return '';
    const origin = window.location.origin;
    const params = new URLSearchParams();
    params.set('rName', menu.restaurantName);
    params.set('color', menu.accentColor);
    params.set('cat', menu.category);
    params.set('name', menu.name);
    params.set('price', menu.price);
    params.set('desc', menu.description);
    params.set('vegan', menu.isVegan ? 'true' : 'false');
    params.set('veggie', menu.isVegetarian ? 'true' : 'false');
    params.set('spicy', menu.isSpicy ? 'true' : 'false');
    params.set('gf', menu.isGlutenFree ? 'true' : 'false');
    return `${origin}/menu?${params.toString()}`;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setMenu(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (name: keyof MenuItem) => {
    setMenu(prev => ({ ...prev, [name]: !prev[name] }));
  };

  // Mock static items to populate the phone simulator UI
  const mockItems: Record<
    string,
    Array<{
      name: string;
      price: string;
      desc: string;
      tags: { veggie?: boolean; vegan?: boolean };
    }>
  > = {
    Vorspeisen: [
      { name: 'Bruschetta Classica', price: '7.50', desc: 'Geröstetes Brot mit marinierten Tomaten, Knoblauch, frischem Basilikum und Olivenöl.', tags: { veggie: true } },
      { name: 'Carpaccio di Manzo', price: '13.90', desc: 'Hauchdünnes Rinderfilet mit Rucola, gehobeltem Parmesan und Zitronen-Olivenöl-Dressing.', tags: {} },
    ],
    Hauptspeisen: [
      // Custom item will go here dynamically
    ],
    Desserts: [
      { name: 'Tiramisu della Casa', price: '6.50', desc: 'Klassisches italienisches Dessert mit Löffelbiskuits, Espresso, Mascarpone und Kakao.', tags: { veggie: true } },
      { name: 'Panna Cotta', price: '5.90', desc: 'Traditionelle gekochte Sahne mit hausgemachtem Himbeerspiegel.', tags: { veggie: true } },
    ],
    Drinks: [
      { name: 'Aperol Spritz', price: '7.50', desc: 'Aperol, Prosecco, Soda und eine frische Orangenscheibe.', tags: {} },
      { name: 'Hausgemachte Eistee-Zitrone', price: '4.90', desc: 'Frisch aufgebrühter Schwarztee mit Zitronensaft und Minze.', tags: { vegan: true } },
    ]
  };

  return (
    <section id="simulator" className="py-24 bg-zinc-50 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-sm font-bold tracking-widest text-amber-600 uppercase mb-3">
            Interaktiver Editor
          </h2>
          <p className="text-3xl sm:text-5xl font-extrabold text-zinc-900 tracking-tight leading-tight">
            Gestalten Sie Ihre Speisekarte live
          </p>
          <p className="text-lg text-zinc-500 mt-4 leading-relaxed">
            Ändern Sie die Daten auf der linken Seite und beobachten Sie, wie sich das digitale Menü im Handy-Simulator rechts sofort aktualisiert.
          </p>
        </div>

        {/* Simulator Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* EDITOR PANEL (6 cols) */}
          <div className="lg:col-span-6 bg-white border border-zinc-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
            
            <div className="flex items-center space-x-3 pb-4 border-b border-zinc-100">
              <Sparkles className="h-5 w-5 text-amber-600" />
              <h3 className="text-lg font-bold text-zinc-900">Menü-Konfigurator</h3>
            </div>

            {/* Restaurant Name */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">
                Restaurant-Name
              </label>
              <input
                type="text"
                name="restaurantName"
                value={menu.restaurantName}
                onChange={handleInputChange}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm text-zinc-900 focus:outline-none focus:border-amber-500 focus:bg-white transition-all"
                placeholder="z.B. Bella Italia"
              />
            </div>

            {/* Accent Color Selection */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2.5">
                Design-Farbe wählen
              </label>
              <div className="flex flex-wrap gap-3">
                {colors.map(color => (
                  <button
                    key={color.id}
                    onClick={() => setMenu(prev => ({ ...prev, accentColor: color.id }))}
                    type="button"
                    className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
                      menu.accentColor === color.id
                        ? 'bg-zinc-900 text-white border-zinc-900'
                        : 'bg-zinc-50 text-zinc-650 border-zinc-200 hover:text-zinc-900 hover:bg-zinc-100'
                    }`}
                  >
                    <span className={`w-3 h-3 rounded-full ${color.bg}`}></span>
                    <span>{color.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <hr className="border-zinc-100 my-6" />

            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500">Speisen-Details</h4>

              {/* Category */}
              <div>
                <label className="block text-xs text-zinc-400 mb-1.5">Kategorie</label>
                <select
                  name="category"
                  value={menu.category}
                  onChange={(e) => {
                    handleInputChange(e);
                    setActiveTab(e.target.value);
                  }}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm text-zinc-900 focus:outline-none focus:border-amber-500 focus:bg-white transition-all"
                >
                  <option value="Vorspeisen">Vorspeisen</option>
                  <option value="Hauptspeisen">Hauptspeisen</option>
                  <option value="Desserts">Desserts</option>
                  <option value="Drinks">Drinks</option>
                </select>
              </div>

              {/* Name & Price */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs text-zinc-400 mb-1.5">Name des Gerichts</label>
                  <input
                    type="text"
                    name="name"
                    value={menu.name}
                    onChange={handleInputChange}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm text-zinc-900 focus:outline-none focus:border-amber-500 focus:bg-white transition-all"
                    placeholder="z.B. Pizza Margherita"
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 mb-1.5">Preis (€)</label>
                  <input
                    type="text"
                    name="price"
                    value={menu.price}
                    onChange={handleInputChange}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm text-zinc-900 focus:outline-none focus:border-amber-500 focus:bg-white transition-all"
                    placeholder="12.50"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs text-zinc-400 mb-1.5">Beschreibung</label>
                <textarea
                  name="description"
                  value={menu.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm text-zinc-900 focus:outline-none focus:border-amber-500 focus:bg-white transition-all resize-none"
                  placeholder="Zutaten, Zubereitungsart..."
                />
              </div>

              {/* Dietary Tags */}
              <div>
                <label className="block text-xs text-zinc-400 mb-2.5">Eigenschaften</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleCheckboxChange('isVegetarian')}
                    className={`flex items-center space-x-2.5 px-4 py-3 border rounded-xl text-xs font-semibold transition-all ${
                      menu.isVegetarian
                        ? `${currentColor.lightBg} ${currentColor.text} ${currentColor.border}`
                        : 'bg-zinc-50/70 text-zinc-500 border-zinc-200 hover:text-zinc-900 hover:bg-zinc-100/50'
                    }`}
                  >
                    <Leaf className="h-4 w-4 shrink-0 text-emerald-600" />
                    <span>Vegetarisch</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCheckboxChange('isVegan')}
                    className={`flex items-center space-x-2.5 px-4 py-3 border rounded-xl text-xs font-semibold transition-all ${
                      menu.isVegan
                        ? `${currentColor.lightBg} ${currentColor.text} ${currentColor.border}`
                        : 'bg-zinc-50/70 text-zinc-500 border-zinc-200 hover:text-zinc-900 hover:bg-zinc-100/50'
                    }`}
                  >
                    <Leaf className="h-4 w-4 shrink-0 text-emerald-600" />
                    <span>Vegan</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCheckboxChange('isSpicy')}
                    className={`flex items-center space-x-2.5 px-4 py-3 border rounded-xl text-xs font-semibold transition-all ${
                      menu.isSpicy
                        ? `bg-rose-500/10 text-rose-600 border-rose-500/25`
                        : 'bg-zinc-50/70 text-zinc-500 border-zinc-200 hover:text-zinc-900 hover:bg-zinc-100/50'
                    }`}
                  >
                    <Flame className="h-4 w-4 shrink-0 text-rose-500" />
                    <span>Scharf</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCheckboxChange('isGlutenFree')}
                    className={`flex items-center space-x-2.5 px-4 py-3 border rounded-xl text-xs font-semibold transition-all ${
                      menu.isGlutenFree
                        ? `${currentColor.lightBg} ${currentColor.text} ${currentColor.border}`
                        : 'bg-zinc-50/70 text-zinc-500 border-zinc-200 hover:text-zinc-900 hover:bg-zinc-100/50'
                    }`}
                  >
                    <Check className="h-4 w-4 shrink-0 text-amber-600" />
                    <span>Glutenfrei</span>
                  </button>
                </div>
              </div>
            </div>

            {/* QR Generation and QR Scanner Modal trigger */}
            <div className="pt-4 border-t border-zinc-100 flex flex-col sm:flex-row items-center gap-4">
              <button
                type="button"
                onClick={() => setShowQRModal(true)}
                className="w-full sm:w-auto flex items-center justify-center space-x-2 px-5 py-3.5 bg-gradient-to-r from-amber-500 to-rose-500 hover:opacity-95 text-white text-sm font-bold rounded-xl shadow-md active:scale-95 transition-all cursor-pointer"
              >
                <QrCode className="h-4 w-4" />
                <span>QR-Code generieren</span>
              </button>
              <div className="text-xs text-zinc-500 leading-normal flex items-start space-x-1.5">
                <AlertCircle className="h-4 w-4 text-zinc-400 shrink-0 mt-0.5" />
                <span>Generieren Sie einen echten QR-Code, um das Menü direkt auf Ihrem Handy zu laden!</span>
              </div>
            </div>

          </div>

          {/* SMARTPHONE SIMULATOR (6 cols) */}
          <div className="lg:col-span-6 flex flex-col items-center justify-center">
            
            {/* Phone Frame - Light Theme Silver/Gray Casing */}
            <div className="relative w-[340px] h-[670px] bg-zinc-100 rounded-[50px] p-3 shadow-xl border-4 border-zinc-350 ring-12 ring-zinc-100/60 flex flex-col overflow-hidden">
              
              {/* status bar notch */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2 w-32 h-6 bg-zinc-900 rounded-full z-30 flex items-center justify-between px-3">
                <span className="text-[10px] font-bold text-white leading-none">18:27</span>
                <div className="w-12 h-1 bg-zinc-700 rounded-full"></div>
                <div className="flex space-x-1 items-center">
                  <div className="w-2.5 h-2.5 bg-white rounded-full scale-[0.6]"></div>
                  <div className="w-3 h-2 bg-white rounded-sm scale-[0.6]"></div>
                </div>
              </div>

              {/* Screen Inner */}
              <div className="w-full h-full bg-zinc-50 rounded-[40px] overflow-hidden flex flex-col relative pt-8 pb-4 text-zinc-900">
                
                {/* Simulated Restaurant Header */}
                <div className="px-4 pt-3 pb-4 bg-white border-b border-zinc-100 text-center flex flex-col items-center">
                  <h4 className="font-extrabold text-base tracking-tight text-zinc-950 mb-0.5 mt-2">
                    {menu.restaurantName || 'Mein Restaurant'}
                  </h4>
                  <p className="text-[9px] text-zinc-550">📱 Speisekarte | Tisch 04</p>
                </div>

                {/* Categories Tab Selector inside screen */}
                <div className="flex space-x-2.5 overflow-x-auto px-4 py-3 bg-white/60 border-b border-zinc-100 scrollbar-none whitespace-nowrap">
                  {['Vorspeisen', 'Hauptspeisen', 'Desserts', 'Drinks'].map(tab => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`text-xs font-bold px-3.5 py-1.5 rounded-full transition-colors ${
                        activeTab === tab
                          ? `${currentColor.bg} text-white`
                          : 'bg-zinc-200/50 text-zinc-500 hover:text-zinc-800'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                {/* Items List scroll view */}
                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
                  {activeTab === 'Hauptspeisen' && menu.category === 'Hauptspeisen' ? (
                    // Render Custom Item
                    <div className="bg-white border border-zinc-150/80 p-4 rounded-2xl flex flex-col justify-between hover:border-zinc-200 transition-colors shadow-sm">
                      <div>
                        <div className="flex justify-between items-start mb-2 gap-2">
                          <h5 className="font-bold text-sm text-zinc-950 leading-snug">{menu.name || 'Neues Gericht'}</h5>
                          <span className={`text-xs font-extrabold ${currentColor.text}`}>{menu.price ? `${menu.price} €` : '—'}</span>
                        </div>
                        <p className="text-[11px] text-zinc-500 leading-normal mb-3">
                          {menu.description || 'Geben Sie eine Beschreibung des Gerichts ein.'}
                        </p>
                      </div>
                      
                      {/* Dietary Badges */}
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {menu.isVegetarian && (
                          <span className={`inline-flex items-center text-[9px] font-bold px-2 py-0.5 rounded-full ${currentColor.lightBg} ${currentColor.text}`}>
                            <Leaf className="h-2.5 w-2.5 mr-1 text-emerald-600" /> Veggie
                          </span>
                        )}
                        {menu.isVegan && (
                          <span className={`inline-flex items-center text-[9px] font-bold px-2 py-0.5 rounded-full ${currentColor.lightBg} ${currentColor.text}`}>
                            <Leaf className="h-2.5 w-2.5 mr-1 text-emerald-600" /> Vegan
                          </span>
                        )}
                        {menu.isSpicy && (
                          <span className="inline-flex items-center text-[9px] font-bold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600">
                            <Flame className="h-2.5 w-2.5 mr-1 text-rose-500" /> Scharf
                          </span>
                        )}
                        {menu.isGlutenFree && (
                          <span className={`inline-flex items-center text-[9px] font-bold px-2 py-0.5 rounded-full ${currentColor.lightBg} ${currentColor.text}`}>
                            Glutenfrei
                          </span>
                        )}
                      </div>
                    </div>
                  ) : null}

                  {/* Render Static/Mocked Items */}
                  {(activeTab === 'Hauptspeisen' && menu.category !== 'Hauptspeisen' ? (
                    <div className="text-center py-6">
                      <p className="text-[11px] text-zinc-400">Keine weiteren Hauptspeisen vorhanden.</p>
                      <p className="text-[10px] text-zinc-550 mt-1">Ändern Sie die Kategorie links auf "Hauptspeisen", um Ihr Gericht hier zu sehen.</p>
                    </div>
                  ) : null)}

                  {/* Render static mock items for other categories */}
                  {activeTab !== 'Hauptspeisen' && mockItems[activeTab as keyof typeof mockItems]?.map((item, idx) => (
                    <div key={idx} className="bg-white border border-zinc-150/80 p-4 rounded-2xl flex flex-col justify-between hover:border-zinc-200 transition-colors shadow-sm">
                      <div>
                        <div className="flex justify-between items-start mb-2 gap-2">
                          <h5 className="font-bold text-sm text-zinc-950 leading-snug">{item.name}</h5>
                          <span className={`text-xs font-extrabold ${currentColor.text}`}>{item.price} €</span>
                        </div>
                        <p className="text-[11px] text-zinc-500 leading-normal mb-3">{item.desc}</p>
                      </div>
                      
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {item.tags.veggie && (
                          <span className={`inline-flex items-center text-[9px] font-bold px-2 py-0.5 rounded-full ${currentColor.lightBg} ${currentColor.text}`}>
                            <Leaf className="h-2.5 w-2.5 mr-1 text-emerald-600" /> Veggie
                          </span>
                        )}
                        {item.tags.vegan && (
                          <span className={`inline-flex items-center text-[9px] font-bold px-2 py-0.5 rounded-full ${currentColor.lightBg} ${currentColor.text}`}>
                            <Leaf className="h-2.5 w-2.5 mr-1 text-emerald-600" /> Vegan
                          </span>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* If custom item category fits here, render it at the bottom as well */}
                  {activeTab !== 'Hauptspeisen' && menu.category === activeTab && (
                    <div className="bg-white border border-zinc-200 border-dashed p-4 rounded-2xl flex flex-col justify-between border-amber-500/50 shadow-sm">
                      <div>
                        <div className="flex justify-between items-start mb-2 gap-2">
                          <h5 className="font-bold text-sm text-zinc-950 leading-snug">{menu.name || 'Neues Gericht'}</h5>
                          <span className={`text-xs font-extrabold ${currentColor.text}`}>{menu.price ? `${menu.price} €` : '—'}</span>
                        </div>
                        <p className="text-[11px] text-zinc-500 leading-normal mb-3">{menu.description}</p>
                      </div>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {menu.isVegetarian && (
                          <span className={`inline-flex items-center text-[9px] font-bold px-2 py-0.5 rounded-full ${currentColor.lightBg} ${currentColor.text}`}>
                            <Leaf className="h-2.5 w-2.5 mr-1 text-emerald-600" /> Veggie
                          </span>
                        )}
                        {menu.isVegan && (
                          <span className={`inline-flex items-center text-[9px] font-bold px-2 py-0.5 rounded-full ${currentColor.lightBg} ${currentColor.text}`}>
                            <Leaf className="h-2.5 w-2.5 mr-1 text-emerald-600" /> Vegan
                          </span>
                        )}
                        {menu.isSpicy && (
                          <span className="inline-flex items-center text-[9px] font-bold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600">
                            <Flame className="h-2.5 w-2.5 mr-1 text-rose-500" /> Scharf
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                </div>

                {/* Sticky Mobile Add To Cart / Order Bar inside mockup */}
                <div className="px-4 pt-2.5 pb-1 bg-white border-t border-zinc-100 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[9px] text-zinc-400">Bestellwert</span>
                    <span className="text-xs font-extrabold text-zinc-950">0,00 €</span>
                  </div>
                  <button
                    type="button"
                    className={`px-4 py-2 text-[10px] font-bold rounded-xl text-white ${currentColor.bg} hover:opacity-95 transition-opacity shadow-sm`}
                  >
                    Warenkorb
                  </button>
                </div>

              </div>

              {/* iPhone Home Swipe Bar indicator */}
              <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-28 h-1 bg-zinc-300 rounded-full z-30"></div>
            </div>

            {/* Label below simulator */}
            <div className="mt-4 flex items-center space-x-2 text-xs text-zinc-400">
              <Smartphone className="h-4 w-4 text-zinc-500" />
              <span>CSS-Smartphone-Simulator (100% responsiv)</span>
            </div>

          </div>

        </div>

      </div>

      {/* QR CODE OVERLAY MODAL */}
      {showQRModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-zinc-900/60 backdrop-blur-sm transition-opacity">
          <div className="relative w-full max-w-md bg-white border border-zinc-200 rounded-3xl p-8 text-center shadow-xl animate-fade-in">
            
            {/* Close button */}
            <button
              onClick={() => setShowQRModal(false)}
              className="absolute top-4 right-4 p-2 bg-zinc-50 hover:bg-zinc-100 text-zinc-500 hover:text-zinc-900 rounded-full transition-colors border border-zinc-200"
            >
              ×
            </button>

            {/* Header */}
            <QrCode className="h-10 w-10 text-amber-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-zinc-900 mb-2">Ihr digitaler QR-Code</h3>
            <p className="text-sm text-zinc-500 mb-6">
              Scannen Sie diesen Code mit Ihrem Handy, um die Speisekarte live als Gast zu testen!
            </p>

            {/* QR Wrapper (White background for scanning reliability) */}
            <div className="inline-block bg-white border border-zinc-200 p-6 rounded-2xl mb-6 shadow-sm">
              <QRCodeSVG
                value={generatePreviewUrl()}
                size={180}
                level="M"
                includeMargin={false}
              />
            </div>

            {/* Displaying Live URL */}
            <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-3 mb-6 text-left overflow-x-auto whitespace-nowrap">
              <span className="text-xs font-mono text-zinc-500">{generatePreviewUrl()}</span>
            </div>

            {/* Modal Actions */}
            <div className="flex flex-col space-y-3">
              <button
                onClick={() => {
                  window.open(generatePreviewUrl(), '_blank');
                }}
                className="w-full py-3.5 bg-zinc-950 hover:bg-zinc-850 text-white text-sm font-bold rounded-xl shadow-md cursor-pointer"
              >
                In neuem Tab öffnen
              </button>
              <button
                onClick={() => setShowQRModal(false)}
                className="w-full py-3.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-650 text-sm font-semibold rounded-xl"
              >
                Schließen
              </button>
            </div>

          </div>
        </div>
      )}
    </section>
  );
}
