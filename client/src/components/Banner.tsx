import { TruckIcon, XIcon, ZapIcon, SparklesIcon, ShieldCheckIcon } from "lucide-react";
import { useState } from "react";

const Banner = () => {
  const [bannerVisible, setBannerVisible] = useState(() => {
    return sessionStorage.getItem("banner_dismissed") !== "true";
  });
  const dismissBanner = () => {
    setBannerVisible(false);
    sessionStorage.setItem("banner_dismissed", "true");
  };
  return (
    <div>
      {bannerVisible && (
        <div className="bg-gradient-to-r from-[#122419] via-[#1b3826] to-[#122419] text-white text-xs sm:text-sm relative overflow-hidden py-2 border-b border-[#254631] shadow-xs">
          {/* Continuous Moving Ticker Track */}
          <div className="animate-marquee flex items-center gap-12 text-zinc-100 whitespace-nowrap">
            {/* Loop Item Block 1 */}
            <div className="flex items-center gap-12 shrink-0">
              <div className="flex items-center gap-2">
                <TruckIcon className="size-4 text-emerald-400 shrink-0" />
                <span className="font-semibold text-emerald-100">
                  Free delivery on orders above $20
                </span>
              </div>
              <span className="text-emerald-500/50">•</span>
              <div className="flex items-center gap-2">
                <ZapIcon className="size-3.5 fill-amber-400 text-amber-400 shrink-0" />
                <span>Farm fresh products delivered daily in 15 minutes</span>
              </div>
              <span className="text-emerald-500/50">•</span>
              <div className="flex items-center gap-2">
                <SparklesIcon className="size-3.5 text-orange-400 shrink-0" />
                <span className="text-orange-300 font-semibold">Special Harvest Sale: Save up to 30% today</span>
              </div>
              <span className="text-emerald-500/50">•</span>
              <div className="flex items-center gap-2">
                <ShieldCheckIcon className="size-4 text-emerald-400 shrink-0" />
                <span>100% Certified Organic & Contactless Delivery</span>
              </div>
              <span className="text-emerald-500/50">•</span>
            </div>

            {/* Loop Item Block 2 (Seamless Duplicate for Continuous Loop) */}
            <div className="flex items-center gap-12 shrink-0">
              <div className="flex items-center gap-2">
                <TruckIcon className="size-4 text-emerald-400 shrink-0" />
                <span className="font-semibold text-emerald-100">
                  Free delivery on orders above $20
                </span>
              </div>
              <span className="text-emerald-500/50">•</span>
              <div className="flex items-center gap-2">
                <ZapIcon className="size-3.5 fill-amber-400 text-amber-400 shrink-0" />
                <span>Farm fresh products delivered daily in 15 minutes</span>
              </div>
              <span className="text-emerald-500/50">•</span>
              <div className="flex items-center gap-2">
                <SparklesIcon className="size-3.5 text-orange-400 shrink-0" />
                <span className="text-orange-300 font-semibold">Special Harvest Sale: Save up to 30% today</span>
              </div>
              <span className="text-emerald-500/50">•</span>
              <div className="flex items-center gap-2">
                <ShieldCheckIcon className="size-4 text-emerald-400 shrink-0" />
                <span>100% Certified Organic & Contactless Delivery</span>
              </div>
              <span className="text-emerald-500/50">•</span>
            </div>
          </div>

          {/* Dismiss Button */}
          <button
            onClick={dismissBanner}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 bg-black/40 hover:bg-black/70 text-zinc-300 hover:text-white rounded-full transition-colors backdrop-blur-sm z-10 cursor-pointer"
            aria-label="Dismiss banner"
          >
            <XIcon className="size-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};

export default Banner;
