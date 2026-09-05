import { appPromoBannerData, assets } from "../../assets/assets";

const AppPromoBanner = () => {
  return (
    <section className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-[#122419] via-[#183324] to-[#0f1d14] border border-[#234230] shadow-2xl my-16 px-6 sm:px-10 lg:px-14 py-12 lg:py-16">
      {/* Ambient Lighting Glow */}
      <div className="absolute -top-20 -right-20 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10 xl:px-4">
        {/* Left Side Content */}
        <div className="text-center md:text-left max-w-xl">
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-[42px] font-bold text-white mb-4 leading-tight tracking-tight">
            {appPromoBannerData.title}
          </h2>
          <p className="text-zinc-300 text-sm sm:text-base leading-relaxed mb-8 max-w-md font-light">
            {appPromoBannerData.description}
          </p>
          <div className="flex flex-wrap gap-3.5 justify-center md:justify-start">
            <button className="px-7 py-3.5 bg-white hover:bg-zinc-100 text-gray-900 font-bold text-xs sm:text-sm rounded-2xl shadow-lg transition-all active:scale-95 cursor-pointer">
              App Store
            </button>
            <button className="px-7 py-3.5 bg-white/10 hover:bg-white/15 text-white font-semibold text-xs sm:text-sm rounded-2xl border border-white/20 backdrop-blur-md transition-all active:scale-95 cursor-pointer">
              Google Play
            </button>
          </div>
        </div>

        {/* Right Side Delivery Graphic */}
        <div className="flex justify-center md:justify-end shrink-0">
          <img
            src={assets.delivery_truck}
            alt="Delivery Truck"
            className="w-full max-w-xs sm:max-w-md lg:max-w-lg object-contain filter drop-shadow-[0_25px_35px_rgba(0,0,0,0.6)]"
          />
        </div>
      </div>
    </section>
  );
};

export default AppPromoBanner;
