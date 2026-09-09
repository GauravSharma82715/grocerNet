import { useEffect, useState } from "react";
import hero_Bg from "../assets/hero_bg.jpeg";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { BikeIcon, Loader2Icon, Lock, Mail, UserIcon } from "lucide-react";
import { useAuth } from "../context/authContext";
import toast from "react-hot-toast";


const Login = () => {
  const [isLoginState, setIsLoginState] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const { login, register, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as { from?: { pathname?: string } })?.from?.pathname || "/";

  useEffect(() => {
    if (user) {
      navigate(from, { replace: true });
    }
  }, [user, navigate, from]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      let success = false;
      if (isLoginState) {
        success = await login(email, password);
      } else {
        success = await register(name, email, password);
      }
      if (success) {
        navigate(from, { replace: true });
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || error?.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className=" hidden lg:flex lg:w-1/2 bg-app-green relative items-center justify-center">
        <img
          src={hero_Bg}
          alt=""
          className="absolute inset-0 object-cover h-full bg-center opacity-10"
        />
        <div className="relative text-center px-12">
          <h2 className=" text-4xl font-semibold text-white mb-4">
            {" "}
            Welcome to GrocerNet
          </h2>
          <p className=" text -4xl font-semibold text-white mb-4">
            {" "}
            Fresh grocieries and organic produce, delievered to your doorstep.
          </p>
        </div>
      </div>
      {/*right half*/}
      <div className="flex-1 flex-center px-4 py-12 bg-app-cream">
        <div className="w-full max-w-md">
          {/*form header*/}
          <div className="text-center mb-8">
            <Link to='/' className="inline-flex items-center gap-2 mb-6">
              <BikeIcon className="size-8 text-app-green" />
              <span className="text-2xl font-semibold text-app-green"> GrocerNet</span>
            </Link>
            <h1 className=" text-2xl font-semibold text-app-green mb-2">
              {isLoginState ? "Sign in to your account" : " Sign up for an account"}
            </h1>
            <p className="text-sm text-app-text-light">
              {isLoginState ? "Don't have an account" : "Already have an account"}
              <button onClick={() => setIsLoginState(!isLoginState)}
                className="text-orange-500 ml-1 font-semibold hover:text-orange-600 transition-color">
                {isLoginState ? "Create one" : "Sign in"}
              </button>
            </p>

          </div>
          {/*form*/}
          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLoginState && (
              <label className="text-sm flex flex-col gap-1">
                Name
                <div className="relative">
                  <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-app-text-light" />
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Your name" className="w-full pl-11 pr-4 py-3 text-sm bg-white rounded-xl border not-focus:border-app-border" />


                </div>
              </label>

            )
            }
            <label className="text-sm flex flex-col gap-1">
              Email Address
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-app-text-light" />
                <input type="text" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@example.com" className="w-full pl-11 pr-4 py-3 text-sm bg-white rounded-xl border not-focus:border-app-border" />


              </div>
            </label>
            <label className="text-sm flex flex-col gap-1">
              Password
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-app-text-light" />
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="........" className="w-full pl-11 pr-4 py-3 text-sm bg-white rounded-xl border not-focus:border-app-border" />


              </div>
            </label>
            <button type="submit" disabled={loading} className="flex-center w-full py-3 bg-green-950 text-white font-semibold rounded-xl hover:bg-green-900 transition-colors disabled:opacity-50">
              {loading ? <Loader2Icon className="animate-spin" /> : isLoginState ? "Sign In" : "Sign Up"}
            </button>

          </form>
        </div>

      </div>
    </div>
  );
};

export default Login;
