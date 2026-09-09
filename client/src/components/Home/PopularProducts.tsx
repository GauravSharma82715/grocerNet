import { useEffect, useState } from "react";
import type { Product } from "../../assets/types";

import { Link } from "react-router-dom";
import { ArrowRightIcon } from "lucide-react";
import ProductCard from "../ProductCard";
import api from "../../config/api";
import toast from "react-hot-toast";

const PopularProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    api.get('/api/products?limit=15&sort=rating').then(({ data }) => {
      setProducts(data.products)
    }).catch((error: any) => {
      toast.error(error.response.data.message || error?.message);
    })

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
          {products.slice(0, 15).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default PopularProducts;
