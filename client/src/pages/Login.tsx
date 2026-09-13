import { useEffect, useState } from "react";
import hero_Bg from "../assets/hero_bg.jpeg";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  BikeIcon,
  Loader2Icon,
  Lock,
  Mail,
  ShieldCheck,
  Truck,
  UserCheck,
  UserIcon,
  Sparkles,
} from "lucide-react";
import { useAuth } from "../context/authContext";
import api from "../config/api";
import toast from "react-hot-toast";

type Role = "user" | "delivery" | "admin";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ROLES = [
  {
    id: "user" as Role,
    label: "User",
    badge: "Customer",
    icon: UserCheck,
    title: "Welcome to GrocerNet",
    subtitle: "Fresh groceries and organic produce, delivered right to your doorstep.",
    featureBadge: "🌱 100% Organic & Farm Fresh",
    featureText: "Fast 15-minute home delivery directly from local farms and trusted vendors.",
    color: "from-emerald-500/20 to-green-500/10",
  },
  {
    id: "delivery" as Role,
    label: "Delivery Partner",
    badge: "Rider",
    icon: Truck,
    title: "Delivery Partner Portal",
    subtitle: "Manage your assigned deliveries, live GPS routes, and customer orders.",
    featureBadge: "🛵 Live GPS Navigation & Fast OTP",
    featureText: "Instant order dispatching, live customer tracking, and hassle-free payouts.",
    color: "from-amber-500/20 to-orange-500/10",
  },
  {
    id: "admin" as Role,
    label: "Admin",
    badge: "Manager",
    icon: ShieldCheck,
    title: "Administrator Portal",
    subtitle: "Complete control over store inventory, orders, partners, and analytics.",
    featureBadge: "🛡️ Store Operations & Live Analytics",
    featureText: "Manage products, track order pipelines, onboard partners, and monitor stats.",
    color: "from-blue-500/20 to-indigo-500/10",
  },
];

const Login = () => {
  const [role, setRole] = useState<Role>("user");
  const [isLoginState, setIsLoginState] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);

  const activeIndex = ROLES.findIndex((r) => r.id === role);
  const currentRoleConfig = ROLES[activeIndex] || ROLES[0];

  const isEmailInvalid = emailTouched && email.trim().length > 0 && !emailRegex.test(email.trim());

  const { login, register, logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as { from?: { pathname?: string } })?.from?.pathname || "/";

  useEffect(() => {
    if (user && role === "user") {
      navigate(from, { replace: true });
    }
  }, [user, role, navigate, from]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailTouched(true);
    if (!emailRegex.test(email.trim())) {
      toast.error("Please enter a valid email address");
      return;
    }
    setLoading(true);
    try {
      if (role === "delivery") {
        const { data } = await api.post("/api/delivery/login", {
          email: email.trim(),
          password,
        });
        sessionStorage.setItem("delivery_token", data.token);
        sessionStorage.setItem("delivery_partner", JSON.stringify(data.partner));
        localStorage.setItem("delivery_token", data.token);
        localStorage.setItem("delivery_partner", JSON.stringify(data.partner));
        toast.success(`Welcome back, ${data.partner.name}!`);
        navigate("/delivery", { replace: true });
        return;
      }

      if (role === "admin") {
        const success = await login(email.trim(), password);
        if (success) {
          const storedUser = localStorage.getItem("auth_user");
          const parsedUser = storedUser ? JSON.parse(storedUser) : null;
          if (parsedUser?.isAdmin) {
            navigate("/admin", { replace: true });
          } else {
            toast.error("Access denied: This account does not have Admin privileges");
            logout();
          }
        }
        return;
      }

      // Customer / User
      let success = false;
      if (isLoginState) {
        success = await login(email.trim(), password);
      } else {
        success = await register(name, email.trim(), password);
      }
      if (success) {
        navigate(from, { replace: true });
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || error?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side hero banner with animated role theme */}
      <div className="hidden lg:flex lg:w-1/2 bg-app-green relative items-center justify-center p-12 overflow-hidden">
        <img
          src={hero_Bg}
          alt=""
          className="absolute inset-0 object-cover h-full w-full opacity-10"
        />

        {/* Dynamic ambient backdrop glow based on active role */}
        <div
          key={`glow-${role}`}
          className={`absolute inset-0 bg-radial ${currentRoleConfig.color} transition-all duration-700 pointer-events-none`}
        />

        <div
          key={`hero-${role}`}
          className="relative text-center max-w-lg mx-auto animate-role-slide z-10 space-y-6"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-semibold uppercase tracking-wider shadow-sm">
            <Sparkles className="size-3.5 text-amber-300 animate-pulse" />
            <span>{currentRoleConfig.featureBadge}</span>
          </div>

          <h2 className="text-4xl xl:text-5xl font-semibold text-white tracking-tight leading-tight">
            {currentRoleConfig.title}
          </h2>

          <p className="text-lg text-white/80 max-w-md mx-auto leading-relaxed">
            {currentRoleConfig.subtitle}
          </p>

          <div className="pt-4">
            <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-4 text-left shadow-lg text-white/90 flex items-start gap-3.5">
              <div className="p-2 rounded-xl bg-white/15 text-emerald-300 shrink-0">
                <currentRoleConfig.icon className="size-5" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-emerald-300">
                  {currentRoleConfig.badge} Features
                </p>
                <p className="text-sm text-white/85 mt-0.5">{currentRoleConfig.featureText}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 py-12 bg-app-cream">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-6">
            <Link to="/" className="inline-flex items-center gap-2.5 mb-5 group">
              <div className="p-2 rounded-xl bg-app-green/10 group-hover:bg-app-green/20 transition-colors">
                <BikeIcon className="size-7 text-app-green" />
              </div>
              <span className="text-2xl font-bold text-app-green tracking-tight">GrocerNet</span>
            </Link>

            <div key={`header-${role}-${isLoginState}`} className="animate-role-slide">
              <h1 className="text-2xl sm:text-3xl font-bold text-app-green mb-1.5 tracking-tight">
                {role === "user" && (isLoginState ? "Sign in to your account" : "Create an account")}
                {role === "delivery" && "Delivery Partner Sign In"}
                {role === "admin" && "Administrator Sign In"}
              </h1>

              {role === "user" ? (
                <p className="text-sm text-app-text-light">
                  {isLoginState ? "Don't have an account?" : "Already have an account?"}
                  <button
                    type="button"
                    onClick={() => setIsLoginState(!isLoginState)}
                    className="text-orange-500 ml-1.5 font-semibold hover:text-orange-600 transition-colors cursor-pointer"
                  >
                    {isLoginState ? "Create one" : "Sign in"}
                  </button>
                </p>
              ) : (
                <p className="text-sm text-app-text-light">
                  {role === "delivery"
                    ? "Enter your delivery partner credentials to proceed"
                    : "Enter your administrator credentials to access dashboard"}
                </p>
              )}
            </div>
          </div>

          {/* Animated Sliding Segmented Tab Controller */}
          <div className="relative bg-zinc-200/90 p-1.5 rounded-2xl flex items-center shadow-inner border border-zinc-300/80 mb-6 select-none">
            {/* The sliding active capsule pill */}
            <div
              className="absolute top-1.5 bottom-1.5 rounded-xl bg-app-green shadow-md transition-transform duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] pointer-events-none"
              style={{
                width: "calc((100% - 12px) / 3)",
                transform: `translateX(${activeIndex * 100}%)`,
              }}
            />

            {ROLES.map((r) => {
              const Icon = r.icon;
              const isActive = role === r.id;
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => {
                    setRole(r.id);
                    if (r.id !== "user") setIsLoginState(true);
                  }}
                  className={`relative z-10 flex-1 flex items-center justify-center gap-1.5 py-2.5 px-2 text-xs sm:text-sm font-semibold rounded-xl transition-colors duration-200 cursor-pointer ${
                    isActive ? "text-white" : "text-zinc-600 hover:text-zinc-900"
                  }`}
                >
                  <Icon
                    className={`size-4 transition-transform duration-250 ${
                      isActive ? "scale-110 text-emerald-300" : "text-zinc-500"
                    }`}
                  />
                  <span>{r.label}</span>
                </button>
              );
            })}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name field for customer registration */}
            {role === "user" && !isLoginState && (
              <label className="text-sm flex flex-col gap-1 animate-role-slide">
                <span className="font-medium text-app-text">Full Name</span>
                <div className="relative">
                  <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-app-text-light" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="John Doe"
                    className="w-full pl-11 pr-4 py-3 text-sm bg-white rounded-xl border border-app-border focus:border-app-green outline-none transition-colors shadow-xs"
                  />
                </div>
              </label>
            )}

            {/* Email field */}
            <label className="text-sm flex flex-col gap-1">
              <span className="font-medium text-app-text">Email Address</span>
              <div className="relative">
                <Mail
                  className={`absolute left-3.5 top-1/2 -translate-y-1/2 size-4 transition-colors ${
                    isEmailInvalid ? "text-red-500" : "text-app-text-light"
                  }`}
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => setEmailTouched(true)}
                  required
                  placeholder={
                    role === "admin"
                      ? "admin@grocer.net"
                      : role === "delivery"
                      ? "partner@grocer.net"
                      : "you@example.com"
                  }
                  className={`w-full pl-11 pr-4 py-3 text-sm bg-white rounded-xl border outline-none transition-colors shadow-xs ${
                    isEmailInvalid
                      ? "border-red-500 focus:border-red-500 ring-1 ring-red-500 text-red-900"
                      : "border-app-border focus:border-app-green"
                  }`}
                />
              </div>
              {isEmailInvalid && (
                <span className="text-xs text-red-500 font-medium">
                  Please enter a valid email address (e.g. name@example.com)
                </span>
              )}
            </label>

            {/* Password field */}
            <label className="text-sm flex flex-col gap-1">
              <span className="font-medium text-app-text">Password</span>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-app-text-light" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-3 text-sm bg-white rounded-xl border border-app-border focus:border-app-green outline-none transition-colors shadow-xs"
                />
              </div>
            </label>

            {/* Submit button with dynamic animated label */}
            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center gap-2 w-full py-3.5 mt-2 bg-app-green text-white font-semibold rounded-xl hover:bg-app-green-light active:scale-[0.99] transition-all duration-200 shadow-md disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <Loader2Icon className="animate-spin size-5" />
              ) : (
                <>
                  <currentRoleConfig.icon className="size-4.5 text-emerald-300" />
                  <span>
                    {role === "user"
                      ? isLoginState
                        ? "Sign In as User"
                        : "Create User Account"
                      : role === "delivery"
                      ? "Sign In as Delivery Partner"
                      : "Sign In as Admin"}
                  </span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
