import { useNavigate } from "react-router-dom";
import type { Product } from "../assets/types";
import { Plus, Star } from "lucide-react";
import { useCart } from "../context/CartContext";

interface Props {
  product: Product;
}

const ProductCard = ({ product }: Props) => {
  const currency = import.meta.env.VITE_CURRENCY_SYMBOL || "$";

  const { addToCart } = useCart();
  const navigate = useNavigate();

  return (
    <div
      className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_30px_rgba(0,0,0,0.08)] hover:border-emerald-200/80 hover:-translate-y-1 transition-all duration-300 group animate-fade-in cursor-pointer flex flex-col justify-between"
      onClick={() => navigate(`/products/${product._id}`)}
    >
      {/* Product Image Canvas */}
      <div className="relative aspect-square overflow-hidden bg-gray-50/70 p-5 flex items-center justify-center">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-contain group-hover:scale-108 transition-transform duration-300"
        />

        {/* Discount Badge */}
        {product.discount > 0 && (
          <span className="absolute top-2.5 left-2.5 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider bg-orange-500 text-white rounded-lg shadow-sm">
            {product.discount}% OFF
          </span>
        )}
      </div>

      {/* Product Details */}
      <div className="p-3.5 sm:p-4 text-gray-700 flex flex-col flex-1 justify-between">
        <div>
          {/* Product Name */}
          <h3 className="text-xs sm:text-sm font-semibold text-gray-900 leading-snug mb-1.5 line-clamp-2 group-hover:text-emerald-700 transition-colors">
            {product.name}
          </h3>

          {/* Rating */}
          {product.rating > 0 && (
            <div className="flex items-center gap-1.5 mb-2.5">
              <Star className="size-3.5 text-amber-400 fill-amber-400" />

              <span className="text-xs font-bold text-gray-800">
                {product.rating}
              </span>

              <span className="text-[11px] text-gray-400">
                ({product.reviewCount})
              </span>
            </div>
          )}
        </div>

        {/* Price + Add to Cart Button */}
        <div className="flex items-center justify-between pt-2.5 border-t border-gray-100 mt-2">
          <div className="flex items-baseline gap-1 truncate">
            <span className="text-sm sm:text-base font-bold text-gray-900">
              {currency}
              {product.price.toFixed(1)}
            </span>

            <span className="text-[11px] text-gray-500">/{product.unit}</span>

            {product.originalPrice > product.price && (
              <span className="text-xs text-gray-400 line-through ml-1">
                {currency}
                {product.originalPrice.toFixed(1)}
              </span>
            )}
          </div>

          {/* Add Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              addToCart(product);
            }}
            className="size-8 rounded-xl bg-orange-500 text-white flex items-center justify-center shrink-0 hover:bg-orange-600 shadow-md shadow-orange-500/20 transition-all active:scale-90 cursor-pointer"
            aria-label="Add to cart"
          >
            <Plus className="size-4 stroke-[2.5]" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
