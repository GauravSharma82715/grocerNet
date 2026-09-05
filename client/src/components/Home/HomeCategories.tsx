import { Link } from "react-router-dom";
import { categoriesData } from "../../assets/assets";

const HomeCategories = () => {
  return (
    <section className="py-8 mb-10">
      <div className="max-w-7xl mx-auto">
        <div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-gray-900 tracking-tight">
            Browse Categories
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 font-normal mt-1">
            Find exactly what you need from our fresh selection
          </p>
        </div>
        <div className="flex items-center gap-4 sm:gap-5 mt-6 overflow-x-scroll no-scrollbar pb-3">
          {categoriesData.map((cat) => (
            <Link
              key={cat.slug}
              to={`/products?category=${cat.slug}`}
              onClick={() => window.scrollTo(0, 0)}
              className="group flex flex-col items-center gap-3 p-3.5 rounded-2xl transition-all duration-300 hover:-translate-y-2 hover:bg-white hover:shadow-[0_10px_30px_rgba(0,0,0,0.07)] shrink-0 min-w-[120px] sm:min-w-[145px]"
            >
              <div className="size-24 sm:size-32 p-3 rounded-2xl overflow-hidden bg-white border border-gray-100 shadow-[0_4px_14px_rgba(0,0,0,0.04)] transition-all duration-300 group-hover:border-emerald-200 group-hover:shadow-lg flex items-center justify-center">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-contain rounded-xl transition-transform duration-300 group-hover:scale-110"
                />
              </div>

              <span className="text-xs sm:text-sm font-semibold text-gray-800 text-center leading-tight transition-colors duration-200 group-hover:text-emerald-700">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HomeCategories;
