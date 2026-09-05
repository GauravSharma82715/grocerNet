import { useEffect, useState } from "react";
import type { Product } from "../../assets/types";
import { dummyProducts } from "../../assets/assets";
import { Link } from "react-router-dom";
import { ArrowRightIcon } from "lucide-react";
import ProductCard from "../ProductCard";

const PopularProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    setProducts(dummyProducts.slice(0, 10));
  }, []);

  return (
    <section className="py-6 mb-12">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-gray-900 tracking-tight">
              Popular Products
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 font-normal mt-1">
              Top-rated organic harvest and kitchen staples this season
            </p>
          </div>
          <Link
            to="/products"
            className="text-xs sm:text-sm font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1.5 transition-colors group"
          >
            <span>View All</span>
            <ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default PopularProducts;
