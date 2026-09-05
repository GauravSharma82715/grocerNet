import { MailIcon } from "lucide-react";

const NewsLetter = () => {
  return (
    <section className="relative overflow-hidden bg-white border border-gray-100 py-12 sm:py-16 px-6 sm:px-10 lg:px-12 rounded-[32px] mx-auto shadow-[0_10px_35px_rgba(0,0,0,0.04)] mb-16">
      <div className="max-w-2xl mx-auto text-center relative z-10">
        {/* Mail Icon Badge */}
        <div className="size-14 bg-emerald-50 border border-emerald-100 rounded-2xl flex-center mx-auto mb-5 text-emerald-700 shadow-xs">
          <MailIcon className="size-6 text-emerald-700" />
        </div>

        {/* Heading */}
        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-gray-900 mb-3 tracking-tight">
          Subscribe to our Newsletter
        </h2>

        {/* Subheading */}
        <p className="text-xs sm:text-sm text-gray-500 mb-8 max-w-lg mx-auto font-normal leading-relaxed">
          Get weekly updates on fresh produce, seasonal offers, and exclusive
          discounts right to your inbox
        </p>

        {/* Form */}
        <form
          onSubmit={(e) => e.preventDefault()}
          className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
        >
          <input
            type="email"
            placeholder="Enter your email address"
            required
            className="flex-1 px-5 py-3.5 rounded-2xl border border-gray-200 bg-gray-50 text-gray-900 placeholder:text-gray-400 text-sm focus:bg-white focus:border-emerald-600 focus:ring-3 focus:ring-emerald-600/15 transition-all"
          />
          <button
            type="submit"
            className="px-7 py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm rounded-2xl shadow-md shadow-emerald-700/20 active:scale-[0.98] transition-all whitespace-nowrap cursor-pointer"
          >
            Subscribe
          </button>
        </form>
      </div>
    </section>
  );
};

export default NewsLetter;
