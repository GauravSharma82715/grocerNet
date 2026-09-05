import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ChevronRightIcon, HomeIcon, SearchIcon } from "lucide-react";
import type { Product } from "../assets/types";
import { dummyProducts } from "../assets/assets";
import Loading from "../components/Loading";
import ProductCard from "../components/ProductCard";

const SearchResults = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      if (query.trim()) {
        const filtered = dummyProducts.filter((p: any) =>
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.category?.toLowerCase().includes(query.toLowerCase())
        );
        setProducts(filtered);
      } else {
        setProducts([]);
      }
      setLoading(false);
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="min-h-screen bg-app-cream py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-sm text-app-text-light mb-6">
          <Link
            to="/"
            className="hover:text-app-green flex items-center gap-1.5 transition-colors"
          >
            <HomeIcon className="size-4" />
            <span>Home</span>
          </Link>
          <ChevronRightIcon className="size-3.5 text-zinc-400" />
          <span className="text-app-green font-medium">Search Results</span>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-semibold text-app-green mb-1">
            {query ? `Results for "${query}"` : "Search Products"}
          </h1>
          <p className="text-sm text-app-text-light">
            {loading
              ? "Searching products..."
              : `${products.length} ${products.length === 1 ? "product" : "products"
              } found`}
          </p>
        </div>

        {/* Results */}
        {loading ? (
          <Loading />
        ) : products.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-app-border/50 max-w-lg mx-auto p-8 shadow-xs">
            <div className="size-20 rounded-2xl bg-app-cream flex-center mx-auto mb-4">
              <SearchIcon className="size-10 text-app-green" />
            </div>
            <h2 className="text-xl font-semibold text-app-green mb-2">
              No results found
            </h2>
            <p className="text-sm text-app-text-light mb-6 leading-relaxed">
              {query ? (
                <>
                  We couldn't find any products matching{" "}
                  <span className="font-semibold text-app-green">"{query}"</span>.
                  Try searching with a different term or keyword.
                </>
              ) : (
                "Type a product name or category in the search bar above."
              )}
            </p>
            <Link
              to="/products"
              className="inline-flex items-center justify-center px-6 py-3 bg-app-green text-white text-sm font-semibold rounded-xl hover:bg-app-green-light transition-colors shadow-xs"
            >
              Browse All Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
            {products.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchResults;