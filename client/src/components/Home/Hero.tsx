import { useEffect, useState } from "react";
import {
  ArrowRightIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  FlameIcon,
  ShieldCheckIcon,
  SparklesIcon,
  StarIcon,
  TruckIcon,
} from "lucide-react";
import { Link } from "react-router-dom";
import fruitsDisplay from "../../assets/Fruits_vegetables_display.jpeg";
import groceryDisplay from "../../assets/grocery_display.png";
import pantryDisplay from "../../assets/pantry_staples_display.png";

const categories = [
  {
    id: 0,
    tabLabel: "Fresh Produce",
    tag: "100% Organic",
    title: "Farm-Fresh Fruits & Veggies",
    desc: "Crisp, sun-ripened produce harvested daily from local sustainable farms.",
    price: "Starting at $1.99",
    offer: "Save 25% Today",
    image: fruitsDisplay,
    rating: "4.9",
    reviews: "14.2k",
    shadowColor: "rgba(16, 185, 129, 0.25)",
    link: "/products?category=fruits_vegetables",
  },
  {
    id: 1,
    tabLabel: "Daily Essentials",
    tag: "Best Sellers",
    title: "Everyday Groceries & Dairy",
    desc: "Farm milk, artisanal bread, free-range eggs, and morning kitchen staples.",
    price: "Starting at $0.99",
    offer: "Fresh Today",
    image: groceryDisplay,
    rating: "4.8",
    reviews: "28.5k",
    shadowColor: "rgba(249, 115, 22, 0.25)",
    link: "/products?category=dairy_eggs",
  },
  {
    id: 2,
    tabLabel: "Pantry Staples",
    tag: "Chef's Choice",
    title: "Premium Oils, Grains & Spices",
    desc: "Cold-pressed oils, organic pulses, whole grains, and aromatic cooking essentials.",
    price: "Starting at $3.49",
    offer: "Up to 30% OFF",
    image: pantryDisplay,
    rating: "4.9",
    reviews: "9.8k",
    shadowColor: "rgba(234, 179, 8, 0.25)",
    link: "/products?category=pantry_staples",
  },
];

const Hero = () => {
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTab((prev) => (prev + 1) % categories.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const current = categories[activeTab];

  const handlePrev = () => {
    setActiveTab((prev) => (prev - 1 + categories.length) % categories.length);
  };

  const handleNext = () => {
    setActiveTab((prev) => (prev + 1) % categories.length);
  };

  return (
    <section className="relative overflow-hidden min-h-[580px] lg:min-h-[640px] mb-12 rounded-[32px] lg:rounded-[40px] shadow-[0_30px_70px_-20px_rgba(0,0,0,0.8)] border border-app-green/30 flex items-center bg-[#132419]">
      {/* Background with Dark Forest Tint */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#14261c] via-[#1a3326] to-[#122218]" />
      <div className="absolute inset-0 bg-radial from-[#1b3022]/60 via-[#132419]/90 to-[#0e1b12]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 w-full z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-10 items-center">
          
          {/* Left Hero Narrative */}
          <div className="lg:col-span-5 xl:col-span-5 text-left">
            {/* Pill Tag */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-950/70 border border-emerald-500/30 text-emerald-300 text-xs font-semibold backdrop-blur-md mb-6 shadow-md shadow-black/30">
              <SparklesIcon className="size-3.5 text-orange-400" />
              <span>Certified Organic & Farm Delivered</span>
            </div>

            {/* Heading */}
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-[50px] text-white leading-[1.12] mb-5 tracking-tight font-bold drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)]">
              Fresh from nature,
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-300 via-amber-200 to-orange-400 font-serif">
                Made for your home.
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-sm sm:text-base text-zinc-300 leading-relaxed mb-8 max-w-md font-light drop-shadow-sm">
              GrocerNet delivers pure, handpicked farm produce and everyday kitchen
              essentials straight to your door with uncompromising quality.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 mb-10">
              <Link
                to="/products"
                className="px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-full shadow-[0_10px_25px_rgba(249,115,22,0.35)] hover:shadow-[0_15px_30px_rgba(249,115,22,0.45)] transition-all flex items-center gap-2 active:scale-95 cursor-pointer"
              >
                Shop All Groceries
                <ArrowRightIcon className="size-4" />
              </Link>
              <Link
                to="/deals"
                className="px-7 py-4 bg-white/10 hover:bg-white/15 text-white text-sm font-medium rounded-full border border-white/20 backdrop-blur-md shadow-md shadow-black/20 transition-all flex items-center gap-2 cursor-pointer"
              >
                <FlameIcon className="size-4 text-orange-400" />
                Special Offers
              </Link>
            </div>

            {/* Social Proof Badges */}
            <div className="flex flex-wrap items-center gap-6 pt-6 border-t border-white/10 text-xs sm:text-sm text-zinc-300">
              <div className="flex items-center gap-2">
                <TruckIcon className="size-4 text-emerald-400 drop-shadow-sm" />
                <span>Express Delivery</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheckIcon className="size-4 text-emerald-400 drop-shadow-sm" />
                <span>100% Quality Guaranteed</span>
              </div>
            </div>
          </div>

          {/* Right Column: Frameless Enhanced Big Image with Deep Multi-Layer Shadows */}
          <div className="lg:col-span-7 xl:col-span-7 flex flex-col items-center lg:items-end">
            <div className="w-full max-w-xl relative group">
              
              {/* Dynamic Backlight Ambient Shadow */}
              <div
                className="absolute -inset-2 rounded-[36px] blur-2xl opacity-40 transition-all duration-1000 pointer-events-none"
                style={{ background: current.shadowColor }}
              />

              {/* Main Image Showcase Frame with Multi-Layer Shadow */}
              <div className="relative h-84 sm:h-[420px] md:h-[460px] rounded-[32px] overflow-hidden shadow-[0_30px_70px_-15px_rgba(0,0,0,0.9),_0_10px_30px_-5px_rgba(0,0,0,0.6)] bg-[#102016]">
                {categories.map((cat, idx) => (
                  <div
                    key={cat.id}
                    className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                      activeTab === idx
                        ? "opacity-100 z-10"
                        : "opacity-0 z-0 pointer-events-none"
                    }`}
                  >
                    <img
                      src={cat.image}
                      alt={cat.title}
                      className="w-full h-full object-cover filter contrast-[1.06] saturate-[1.12] brightness-[1.02]"
                    />
                  </div>
                ))}

                {/* Soft Bottom Gradient for Text Contrast */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent z-10 pointer-events-none" />

                {/* Top Badges with Soft Elevation Shadows */}
                <div className="absolute top-5 left-5 z-20 flex items-center gap-2">
                  <span className="px-3.5 py-1.5 bg-emerald-500 text-black text-xs font-bold uppercase tracking-wider rounded-xl shadow-[0_4px_14px_rgba(0,0,0,0.4)]">
                    {current.tag}
                  </span>
                  <span className="px-3 py-1.5 bg-black/60 backdrop-blur-md text-orange-300 text-xs font-semibold rounded-xl border border-white/10 shadow-[0_4px_14px_rgba(0,0,0,0.4)]">
                    {current.offer}
                  </span>
                </div>

                {/* Rating Badge on Top Right */}
                <div className="absolute top-5 right-5 z-20 flex items-center gap-1.5 px-3 py-1.5 bg-black/60 backdrop-blur-md rounded-xl text-xs text-amber-300 font-bold border border-white/10 shadow-[0_4px_14px_rgba(0,0,0,0.4)]">
                  <StarIcon className="size-3.5 fill-amber-300 text-amber-300" />
                  <span>{current.rating}</span>
                  <span className="text-[10px] text-zinc-300 font-normal">({current.reviews})</span>
                </div>

                {/* Left/Right Navigation Arrows with Backdrop Shadow */}
                <button
                  onClick={handlePrev}
                  className="absolute left-3 top-1/2 -translate-y-1/2 z-20 size-9 rounded-full bg-black/50 hover:bg-black/80 text-white flex-center backdrop-blur-md border border-white/15 shadow-lg shadow-black/50 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                  aria-label="Previous"
                >
                  <ChevronLeftIcon className="size-5" />
                </button>
                <button
                  onClick={handleNext}
                  className="absolute right-3 top-1/2 -translate-y-1/2 z-20 size-9 rounded-full bg-black/50 hover:bg-black/80 text-white flex-center backdrop-blur-md border border-white/15 shadow-lg shadow-black/50 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                  aria-label="Next"
                >
                  <ChevronRightIcon className="size-5" />
                </button>

                {/* Bottom Overlay Content & Action with Enhanced Shadows */}
                <div className="absolute bottom-6 left-6 right-6 z-20 flex items-end justify-between gap-4">
                  <div className="max-w-[70%]">
                    <h3 className="text-xl sm:text-2xl font-bold text-white leading-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] mb-1">
                      {current.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-zinc-200 line-clamp-1 font-light drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] mb-1.5">
                      {current.desc}
                    </p>
                    <span className="text-sm sm:text-base font-bold text-emerald-400 drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)]">
                      {current.price}
                    </span>
                  </div>

                  <Link
                    to={current.link}
                    className="px-5 py-3 bg-orange-500 hover:bg-orange-600 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-[0_8px_20px_rgba(249,115,22,0.4)] flex items-center gap-2 group/btn cursor-pointer transition-all active:scale-95 shrink-0"
                  >
                    <span>Browse</span>
                    <ArrowRightIcon className="size-4 transition-transform group-hover/btn:translate-x-1" />
                  </Link>
                </div>
              </div>

              {/* Progress Indicator Underneath (3-second cycle) with Soft Shadow */}
              <div className="grid grid-cols-3 gap-2 mt-4 px-2">
                {categories.map((_, idx) => (
                  <div
                    key={idx}
                    onClick={() => setActiveTab(idx)}
                    className="h-1.5 rounded-full bg-white/15 overflow-hidden cursor-pointer shadow-inner"
                  >
                    <div
                      className={`h-full bg-orange-400 rounded-full transition-all duration-300 ${
                        activeTab === idx ? "w-full" : "w-0"
                      }`}
                      style={{
                        transitionDuration: activeTab === idx ? "3000ms" : "300ms",
                      }}
                    />
                  </div>
                ))}
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Hero;
