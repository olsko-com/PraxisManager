'use client';

import { useState, useMemo } from 'react';
import { Leaf, Flame, ShoppingBag, Plus, Minus, ArrowLeft, CheckCircle2, Clock, MapPin } from 'lucide-react';

interface GuestMenuProps {
  params: {
    rName?: string;
    color?: string;
    cat?: string;
    name?: string;
    price?: string;
    desc?: string;
    vegan?: string;
    veggie?: string;
    spicy?: string;
    gf?: string;
    table?: string;
    t?: string;
  };
}

export default function GuestMenuClient({ params }: GuestMenuProps) {
  const [cart, setCart] = useState<Record<string, { price: number; quantity: number }>>({});
  const [showCart, setShowCart] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);

  // Parse parameters from props
  const parsedParams = useMemo(() => {
    return {
      restaurantName: params.rName || 'La Taverna',
      accentColor: params.color || 'amber',
      customCategory: params.cat || 'Hauptspeisen',
      customName: params.name || 'Hausgemachte Trüffel-Tagliatelle',
      customPrice: parseFloat(params.price || '16.80') || 16.80,
      customDesc: params.desc || 'Frische Nudeln in feiner Sauce.',
      isVegan: params.vegan === 'true',
      isVegetarian: params.veggie === 'true',
      isSpicy: params.spicy === 'true',
      isGlutenFree: params.gf === 'true',
      tableNumber: params.table || params.t || '04',
    };
  }, [params]);

  const colorMap: Record<string, { bg: string; text: string; border: string; ring: string; lightBg: string; btnText: string }> = {
    amber: { bg: 'bg-amber-500 hover:bg-amber-600', text: 'text-amber-600', border: 'border-amber-500/30', ring: 'focus:ring-amber-500', lightBg: 'bg-amber-500/10', btnText: 'text-white' },
    emerald: { bg: 'bg-emerald-600 hover:bg-emerald-700', text: 'text-emerald-600', border: 'border-emerald-600/30', ring: 'focus:ring-emerald-600', lightBg: 'bg-emerald-600/10', btnText: 'text-white' },
    rose: { bg: 'bg-rose-600 hover:bg-rose-705', text: 'text-rose-600', border: 'border-rose-600/30', ring: 'focus:ring-rose-500', lightBg: 'bg-rose-600/10', btnText: 'text-white' },
    indigo: { bg: 'bg-indigo-600 hover:bg-indigo-705', text: 'text-indigo-600', border: 'border-indigo-600/30', ring: 'focus:ring-indigo-500', lightBg: 'bg-indigo-600/10', btnText: 'text-white' },
    orange: { bg: 'bg-orange-500 hover:bg-orange-600', text: 'text-orange-600', border: 'border-orange-500/30', ring: 'focus:ring-orange-500', lightBg: 'bg-orange-500/10', btnText: 'text-white' },
  };

  const currentColor = colorMap[parsedParams.accentColor] || colorMap.amber;

  // Construct items database dynamically
  const itemsByCategory = useMemo(() => {
    const list: Record<string, Array<{ name: string; price: number; desc: string; tags: { veggie?: boolean; vegan?: boolean; spicy?: boolean; gf?: boolean } }>> = {
      Vorspeisen: [
        { name: 'Bruschetta Classica', price: 7.50, desc: 'Geröstetes Ciabatta-Brot mit frischen Tomaten, Knoblauch, Basilikum und bestem Olivenöl.', tags: { veggie: true } },
        { name: 'Carpaccio di Manzo', price: 13.90, desc: 'Hauchdünnes Rinderfilet mit Rucola, gehobeltem Grana Padano und Zitronen-Olivenöl-Vinaigrette.', tags: {} },
      ],
      Hauptspeisen: [
        { name: 'Pizza Margherita', price: 9.80, desc: 'Mit fruchtiger Tomatensauce, frischem Mozzarella und frischem Basilikum.', tags: { veggie: true } }
      ],
      Desserts: [
        { name: 'Tiramisu della Casa', price: 6.50, desc: 'Klassisches hausgemachtes Tiramisu nach originalem Familienrezept.', tags: { veggie: true } },
        { name: 'Panna Cotta', price: 5.90, desc: 'Klassisches italienisches Sahnedessert an feinem Fruchtspiegel.', tags: { veggie: true } },
      ],
      Drinks: [
        { name: 'Aperol Spritz', price: 7.50, desc: 'Feinperlig, frisch, fruchtig - Aperol, Prosecco, Mineralwasser und Orangenscheibe.', tags: {} },
        { name: 'Hausgemachte Eistee-Zitrone', price: 4.90, desc: 'Aus schwarzem Tee, spritziger Zitrone und frischer Minze.', tags: { vegan: true } },
      ]
    };

    // Inject custom user item
    const customItem = {
      name: parsedParams.customName,
      price: parsedParams.customPrice,
      desc: parsedParams.customDesc,
      tags: {
        veggie: parsedParams.isVegetarian,
        vegan: parsedParams.isVegan,
        spicy: parsedParams.isSpicy,
        gf: parsedParams.isGlutenFree
      }
    };

    if (list[parsedParams.customCategory]) {
      list[parsedParams.customCategory] = [customItem, ...list[parsedParams.customCategory]];
    } else {
      list[parsedParams.customCategory] = [customItem];
    }

    return list;
  }, [parsedParams]);

  const [activeCategory, setActiveCategory] = useState('Hauptspeisen');

  const addToCart = (name: string, price: number) => {
    setCart(prev => {
      const current = prev[name] || { price, quantity: 0 };
      return {
        ...prev,
        [name]: { ...current, quantity: current.quantity + 1 }
      };
    });
  };

  const removeFromCart = (name: string) => {
    setCart(prev => {
      const current = prev[name];
      if (!current) return prev;
      if (current.quantity <= 1) {
        const next = { ...prev };
        delete next[name];
        return next;
      }
      return {
        ...prev,
        [name]: { ...current, quantity: current.quantity - 1 }
      };
    });
  };

  const cartTotal = Object.values(cart).reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartItemsCount = Object.values(cart).reduce((sum, item) => sum + item.quantity, 0);

  const placeOrder = () => {
    setOrderPlaced(true);
    setCart({});
  };

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 flex flex-col font-sans max-w-md mx-auto shadow-2xl relative border-x border-zinc-200">
      
      {/* Header Banner */}
      <div className="relative h-44 bg-gradient-to-tr from-white to-zinc-50 flex flex-col justify-end p-6 border-b border-zinc-150">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-zinc-50"></div>
        {/* Glow */}
        <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${currentColor.bg} opacity-10 blur-3xl pointer-events-none`}></div>

        <div className="relative z-10 space-y-2">
          <div className="flex items-center space-x-2">
            <span className="inline-flex px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 text-[10px] font-bold uppercase">
              Geöffnet
            </span>
            <span className="text-[10px] text-zinc-500 font-semibold flex items-center">
              <Clock className="h-3 w-3 mr-1" /> 11:30 - 22:00
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-zinc-950 tracking-tight">{parsedParams.restaurantName}</h1>
          <p className="text-xs text-zinc-555 flex items-center">
            <MapPin className="h-3.5 w-3.5 text-zinc-400 mr-1 shrink-0" /> Tisch {parsedParams.tableNumber} • Digitaler Service
          </p>
        </div>
      </div>

      {/* Categories Selector Tabs */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-zinc-200/60 flex space-x-2.5 overflow-x-auto px-4 py-3 scrollbar-none whitespace-nowrap">
        {Object.keys(itemsByCategory).map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`text-xs font-bold px-4 py-2 rounded-full transition-all ${
              activeCategory === cat
                ? `${currentColor.bg} ${currentColor.btnText} shadow-sm`
                : 'bg-zinc-100 text-zinc-500 hover:text-zinc-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Items Section */}
      <div className="flex-1 px-4 py-6 space-y-5 pb-28">
        <h2 className="text-lg font-bold text-zinc-800 tracking-tight flex items-center">
          <span className={`w-1.5 h-4 rounded-full ${currentColor.bg} mr-2`}></span>
          {activeCategory}
        </h2>

        {itemsByCategory[activeCategory]?.map((item, index) => (
          <div
            key={index}
            className="bg-white border border-zinc-200 p-4 rounded-2xl flex flex-col justify-between hover:border-zinc-250 transition-colors shadow-sm"
          >
            <div className="flex justify-between items-start gap-4">
              <div className="space-y-1">
                <h3 className="font-bold text-sm text-zinc-950 leading-tight">{item.name}</h3>
                <p className="text-xs text-zinc-500 leading-normal">{item.desc}</p>
              </div>
              <span className={`text-sm font-extrabold ${currentColor.text} shrink-0`}>
                {item.price.toFixed(2)} €
              </span>
            </div>

            {/* Dietary Tags and Buy Button */}
            <div className="flex items-center justify-between mt-4">
              <div className="flex flex-wrap gap-1">
                {item.tags.veggie && (
                  <span className={`inline-flex items-center text-[9px] font-bold px-2 py-0.5 rounded-full ${currentColor.lightBg} ${currentColor.text}`}>
                    <Leaf className="h-2.5 w-2.5 mr-0.5 text-emerald-600" /> Veggie
                  </span>
                )}
                {item.tags.vegan && (
                  <span className={`inline-flex items-center text-[9px] font-bold px-2 py-0.5 rounded-full ${currentColor.lightBg} ${currentColor.text}`}>
                    <Leaf className="h-2.5 w-2.5 mr-0.5 text-emerald-600" /> Vegan
                  </span>
                )}
                {item.tags.spicy && (
                  <span className="inline-flex items-center text-[9px] font-bold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600">
                    <Flame className="h-2.5 w-2.5 mr-0.5 text-rose-500" /> Scharf
                  </span>
                )}
                {item.tags.gf && (
                  <span className={`inline-flex items-center text-[9px] font-bold px-2 py-0.5 rounded-full ${currentColor.lightBg} ${currentColor.text}`}>
                    Glutenfrei
                  </span>
                )}
              </div>

              {/* Quantity Changer or Buy button */}
              {cart[item.name] ? (
                <div className="flex items-center space-x-2 bg-zinc-50 border border-zinc-200 px-2 py-1 rounded-xl">
                  <button
                    onClick={() => removeFromCart(item.name)}
                    className="p-1 bg-white hover:bg-zinc-100 rounded-lg text-zinc-400 hover:text-zinc-950 border border-zinc-200 shadow-sm"
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                  <span className="text-xs font-bold text-zinc-950 px-1.5">{cart[item.name].quantity}</span>
                  <button
                    onClick={() => addToCart(item.name, item.price)}
                    className="p-1 bg-white hover:bg-zinc-100 rounded-lg text-zinc-400 hover:text-zinc-950 border border-zinc-200 shadow-sm"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => addToCart(item.name, item.price)}
                  className={`flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs font-bold ${currentColor.bg} ${currentColor.btnText} hover:opacity-95 active:scale-95 transition-all shadow-sm`}
                >
                  <Plus className="h-3.5 w-3.5 shrink-0" />
                  <span>Hinzufügen</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Floating Cart bar at the bottom */}
      {cartItemsCount > 0 && !showCart && (
        <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto p-4 z-40">
          <button
            onClick={() => setShowCart(true)}
            className={`w-full flex items-center justify-between px-6 py-4 rounded-2xl ${currentColor.bg} ${currentColor.btnText} font-bold shadow-xl hover:opacity-95 active:scale-[0.98] transition-all`}
          >
            <div className="flex items-center space-x-2.5">
              <div className="p-1.5 bg-white/20 rounded-lg relative">
                <ShoppingBag className="h-5 w-5" />
                <span className="absolute -top-1 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-zinc-950 text-[9px] font-black text-white">
                  {cartItemsCount}
                </span>
              </div>
              <span className="text-sm">Warenkorb anzeigen</span>
            </div>
            <span className="text-sm tracking-wide">{cartTotal.toFixed(2)} €</span>
          </button>
        </div>
      )}

      {/* CART DRAWER OVERLAY */}
      {showCart && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-zinc-900/60 backdrop-blur-sm max-w-md mx-auto border-x border-zinc-200">
          <div className="bg-white border-t border-zinc-200 rounded-t-[30px] p-6 max-h-[85vh] flex flex-col shadow-2xl">
            
            {/* Cart Header */}
            <div className="flex items-center justify-between pb-4 border-b border-zinc-150 mb-6">
              <button
                onClick={() => setShowCart(false)}
                className="flex items-center text-xs font-semibold text-zinc-500 hover:text-zinc-900 transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-1.5" /> Zurück
              </button>
              <h2 className="text-base font-extrabold text-zinc-950">Ihre Bestellung</h2>
              <span className="text-xs text-zinc-400 font-bold">Tisch {parsedParams.tableNumber}</span>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto space-y-4 mb-6 pr-1">
              {Object.entries(cart).map(([name, detail]) => (
                <div key={name} className="flex justify-between items-center bg-zinc-50 p-4 rounded-xl border border-zinc-200">
                  <div className="space-y-0.5">
                    <h4 className="text-sm font-bold text-zinc-950">{name}</h4>
                    <p className="text-xs text-zinc-500">{(detail.price * detail.quantity).toFixed(2)} €</p>
                  </div>

                  <div className="flex items-center space-x-2 bg-white border border-zinc-200 px-2 py-1 rounded-xl shadow-sm">
                    <button
                      onClick={() => removeFromCart(name)}
                      className="p-1 hover:bg-zinc-100 rounded-lg text-zinc-400 hover:text-zinc-950"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="text-xs font-bold text-zinc-950 px-1.5">{detail.quantity}</span>
                    <button
                      onClick={() => addToCart(name, detail.price)}
                      className="p-1 hover:bg-zinc-100 rounded-lg text-zinc-400 hover:text-zinc-950"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Price Summary */}
            <div className="space-y-3.5 mb-6 bg-zinc-50 p-4 rounded-xl border border-zinc-200 text-sm">
              <div className="flex justify-between text-zinc-500">
                <span>Zwischensumme</span>
                <span>{cartTotal.toFixed(2)} €</span>
              </div>
              <div className="flex justify-between text-zinc-500">
                <span>Servicegebühr</span>
                <span className="text-emerald-600 font-semibold">0.00 € (Gratis)</span>
              </div>
              <hr className="border-zinc-200" />
              <div className="flex justify-between font-bold text-zinc-950">
                <span>Gesamtsumme</span>
                <span className={`${currentColor.text}`}>{cartTotal.toFixed(2)} €</span>
              </div>
            </div>

            {/* Submit Order Action */}
            <button
              onClick={placeOrder}
              className={`w-full py-4 rounded-2xl ${currentColor.bg} ${currentColor.btnText} font-extrabold text-sm shadow-lg hover:opacity-95 active:scale-[0.98] transition-all`}
            >
              Jetzt bestellen ({cartTotal.toFixed(2)} €)
            </button>
          </div>
        </div>
      )}

      {/* ORDER PLACED SUCCESS POPUP */}
      {orderPlaced && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-sm max-w-md mx-auto border-x border-zinc-200 animate-fade-in">
          <div className="bg-white border border-zinc-200 rounded-3xl p-8 text-center max-w-xs shadow-2xl relative">
            <CheckCircle2 className="h-14 w-14 text-emerald-600 mx-auto mb-4 animate-bounce" />
            <h3 className="text-lg font-bold text-zinc-950 mb-2">Bestellung gesendet!</h3>
            <p className="text-xs text-zinc-500 leading-relaxed mb-6">
              Ihre Gerichte werden frisch in der Küche zubereitet. Die Lieferung erfolgt in wenigen Minuten direkt an <strong>Tisch {parsedParams.tableNumber}</strong>.
            </p>
            <button
              onClick={() => setOrderPlaced(false)}
              className="w-full py-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-bold rounded-xl border border-zinc-200"
            >
              Schließen
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
