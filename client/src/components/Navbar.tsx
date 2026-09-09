import {
  ArrowUpRightIcon,
  BikeIcon,
  ChevronDownIcon,
  FlameIcon,
  LogOutIcon,
  MapPinIcon,
  MenuIcon,
  PackageIcon,
  SearchIcon,
  ShieldIcon,
  ShoppingCartIcon,
  User,
  UserIcon,
  XIcon,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/authContext";

const Navbar = () => {
  const { user, logout } = useAuth();

  const { cartCount, setIsCartOpen } = useCart();
  const [searchQuery, setSearchQuery] = useState("");
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const navigate = useNavigate();
  const handleSearch = (e: React.SubmitEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };
  const handleLogout = () => {
    logout()
    setUserMenuOpen(false);
    navigate("/");
  };

  return (
    <nav className="bg-white/95 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-17 gap-6 lg:gap-10">

        {/* Brand Logo */}
        <Link
          to="/"
          className="flex items-center gap-2.5 text-xl font-bold tracking-tight text-gray-900 shrink-0 group"
        >
          <div className="size-9 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 flex-center text-white shadow-md shadow-emerald-500/25 group-hover:scale-105 transition-transform">
            <BikeIcon size={20} className="text-white stroke-[2.5]" />
          </div>
          <span>
            Grocer<span className="text-orange-500">Net</span>
          </span>
        </Link>

        <div className="w-full flex items-center justify-end gap-4 lg:gap-8">

          {/* Nav Links - Desktops */}
          <div className="hidden md:flex items-center gap-1.5 text-sm font-semibold text-gray-600">
            <Link
              to="/"
              className="px-3.5 py-2 rounded-xl text-gray-700 hover:text-emerald-700 hover:bg-emerald-50/60 transition-all"
            >
              Home
            </Link>
            <Link
              to="/products"
              className="px-3.5 py-2 rounded-xl text-gray-700 hover:text-emerald-700 hover:bg-emerald-50/60 transition-all"
            >
              Products
            </Link>
            <Link
              to="/deals"
              className="px-3.5 py-2 rounded-xl text-orange-600 hover:text-orange-700 hover:bg-orange-50 flex items-center gap-1.5 transition-all"
            >
              <FlameIcon size={15} className="text-orange-500" />
              Deals
            </Link>
          </div>

          {/* Search Form */}
          <form
            onSubmit={handleSearch}
            className="hidden sm:flex flex-1 max-w-sm text-xs sm:text-sm"
          >
            <div className="relative w-full group">
              <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-gray-400 group-focus-within:text-emerald-600 transition-colors pointer-events-none" />
              <input
                type="text"
                placeholder="Search fresh groceries, dairy..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 hover:bg-gray-100/60 text-gray-900 placeholder:text-gray-400 border border-gray-200/80 rounded-2xl focus:bg-white focus:border-emerald-500 focus:ring-3 focus:ring-emerald-500/15 transition-all"
              />
            </div>
          </form>

          {/* Right Actions */}
          <div className="flex items-center gap-3">

            {/* Cart Button */}
            <button
              className="relative p-2.5 rounded-2xl bg-emerald-50/80 hover:bg-emerald-100/80 border border-emerald-200/60 text-emerald-800 transition-all shadow-xs active:scale-95 cursor-pointer"
              onClick={() => setIsCartOpen(true)}
              aria-label="Open cart"
            >
              <ShoppingCartIcon className="size-5 text-emerald-700" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 size-4.5 bg-orange-500 text-white text-[9px] font-extrabold rounded-full flex-center shadow-sm">
                  {cartCount}
                </span>
              )}
            </button>

            {/* User Profile */}
            <div className="relative">
              {user ? (
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 p-1.5 pr-3 rounded-2xl bg-gray-50 hover:bg-gray-100 border border-gray-200/80 transition-all cursor-pointer group"
                >
                  <div className="size-7.5 rounded-xl bg-gradient-to-br from-emerald-600 to-green-700 text-white flex-center text-xs font-bold shadow-xs">
                    {(user.name || user.email || "U").charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden sm:block text-xs font-semibold text-gray-700 group-hover:text-gray-900">
                    {user.name ? user.name.split(" ")[0] : user.email?.split("@")[0]}
                  </span>
                  <ChevronDownIcon className="size-3 text-gray-400 group-hover:text-gray-600 transition-transform" />
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    to="/login"
                    className="hidden md:flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-orange-500 hover:bg-orange-600 rounded-xl transition-all shadow-md shadow-orange-500/20 active:scale-95"
                  >
                    <UserIcon size={14} /> Sign In
                  </Link>
                  {userMenuOpen ? (
                    <XIcon
                      className="md:hidden text-gray-700 cursor-pointer"
                      onClick={() => setUserMenuOpen(!userMenuOpen)}
                    />
                  ) : (
                    <MenuIcon
                      className="md:hidden text-gray-700 cursor-pointer"
                      onClick={() => setUserMenuOpen(!userMenuOpen)}
                    />
                  )}
                </div>
              )}

              {/* User Dropdown Menu */}
              {userMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setUserMenuOpen(false)}
                  />
                  <div className="absolute right-0 top-full mt-2.5 w-60 bg-white border border-gray-100 rounded-2xl shadow-xl py-2 z-50 animate-fade-in text-gray-700">
                    {user && (
                      <div className="px-4 py-3 border-b border-gray-100 mb-1 bg-gray-50/60 rounded-xl mx-1.5">
                        <p className="text-xs sm:text-sm font-bold text-gray-900">
                          {user?.name}
                        </p>
                        <p className="text-[11px] text-gray-500 mt-0.5 truncate">{user?.email}</p>
                      </div>
                    )}

                    <div onClick={() => setUserMenuOpen(false)} className="space-y-0.5 px-1">
                      {!user && (
                        <Link to="/login" className="flex items-center gap-3 px-3 py-2 text-xs font-semibold text-gray-700 hover:text-emerald-700 hover:bg-emerald-50/60 rounded-xl transition-colors">
                          <UserIcon size={15} /> Sign In
                        </Link>
                      )}
                      {user && (
                        <Link to="/orders" className="flex items-center gap-3 px-3 py-2 text-xs font-semibold text-gray-700 hover:text-emerald-700 hover:bg-emerald-50/60 rounded-xl transition-colors">
                          <PackageIcon size={15} className="text-emerald-600" />
                          My Orders
                        </Link>
                      )}
                      {user && (
                        <Link to="/addresses" className="flex items-center gap-3 px-3 py-2 text-xs font-semibold text-gray-700 hover:text-emerald-700 hover:bg-emerald-50/60 rounded-xl transition-colors">
                          <MapPinIcon size={15} className="text-emerald-600" />
                          Address
                        </Link>
                      )}
                      <Link to="/products" className="flex items-center gap-3 px-3 py-2 text-xs font-semibold text-gray-700 hover:text-emerald-700 hover:bg-emerald-50/60 rounded-xl transition-colors">
                        <ArrowUpRightIcon size={15} />
                        Products
                      </Link>
                      <Link to="/deals" className="flex items-center gap-3 px-3 py-2 text-xs font-semibold text-gray-700 hover:text-orange-600 hover:bg-orange-50/60 rounded-xl transition-colors">
                        <ArrowUpRightIcon size={15} />
                        Deals
                      </Link>
                      {user?.isAdmin && (
                        <Link to="/admin/products" className="flex items-center gap-3 px-3 py-2 text-xs font-bold text-orange-600 hover:bg-orange-50 rounded-xl transition-colors">
                          <ShieldIcon
                            className="text-orange-500"
                            size={15}
                          />
                          <span>
                            Admin Panel
                          </span>
                        </Link>
                      )}
                      {user && (
                        <div className="border-t border-gray-100 mt-1 pt-1">
                          <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 px-4 py-2 text-xs font-semibold text-red-500 hover:bg-red-50 rounded-xl w-full transition-colors cursor-pointer text-left"
                          >
                            <LogOutIcon size={15} /> Logout
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

        </div>
      </div>
    </nav>
  );
};

export default Navbar;
