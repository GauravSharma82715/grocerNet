import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import type { Address } from "../assets/types";
import {
  ArrowLeftIcon,
  CheckIcon,
  ChevronRightIcon,
  CreditCardIcon,
  MapPinIcon,
  ShieldCheckIcon,
  ShoppingBagIcon,
  TruckIcon,
} from "lucide-react";
import CheckoutAddress from "../components/Checkout/CheckoutAddress";
import CheckoutPayment from "../components/Checkout/CheckoutPayment";
import CheckoutReview from "../components/Checkout/CheckoutReview";
import api from "../config/api";
import toast from "react-hot-toast";
import { useAuth } from "../context/authContext";

const CheckOut = () => {
  const navigate = useNavigate();
  const currency = import.meta.env.VITE_CURRENCY_SYMBOL || "₹";
  const { items, cartTotal, clearCart } = useCart();
  const { user } = useAuth();

  const [step, setStep] = useState<"address" | "payment" | "review">("address");
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState<Address>({
    id: "",
    label: "Home",
    address: "",
    city: "",
    state: "",
    zip: "",
    isDefault: false,
    lat: 0,
    lng: 0,
  });
  const [paymentMethod, setPaymentMethod] = useState("card");

  const deliveryFee = cartTotal >= 25 ? 0 : 2.99;
  const tax = cartTotal * 0.08;
  const total = cartTotal + deliveryFee + tax;

  const steps = [
    { key: "address", label: "Delivery Address", icon: MapPinIcon },
    { key: "payment", label: "Payment Method", icon: CreditCardIcon },
    { key: "review", label: "Review & Confirm", icon: CheckIcon },
  ] as const;

  const handlePlaceOrder = async () => {
    if (!address.address.trim() || !address.city.trim()) {
      toast.error("Please provide a valid delivery address.");
      setStep("address");
      return;
    }

    setLoading(true);
    try {
      const orderData = {
        items: items.map((item) => ({
          product: item.product.id,
          quantity: item.quantity,
        })),
        shippingAddress: address,
        paymentMethod,
      };

      const { data } = await api.post("/api/orders", orderData);

      // If online payment via Razorpay
      if (data.razorpayOrder) {
        if (!(window as any).Razorpay) {
          toast.error("Razorpay SDK failed to load. Please check your connection.");
          setLoading(false);
          return;
        }

        const options = {
          key: data.keyId,
          amount: data.razorpayOrder.amount,
          currency: data.razorpayOrder.currency,
          name: "GrocerNet",
          description: `Order #${data.order.id.slice(0, 8)} Payment`,
          image: "/favicon.svg",
          order_id: data.razorpayOrder.id,
          handler: async (response: any) => {
            try {
              setLoading(true);
              const verifyRes = await api.post("/api/orders/verify-razorpay", {
                orderId: data.order.id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              });

              if (verifyRes.data.success) {
                clearCart();
                toast.success("Payment successful! Order placed.");
                navigate(`/orders/${data.order.id}`);
              } else {
                toast.error("Payment verification failed.");
              }
            } catch (err: any) {
              toast.error(err?.response?.data?.message || "Payment verification failed.");
            } finally {
              setLoading(false);
            }
          },
          prefill: {
            name: user?.name || "",
            email: user?.email || "",
            contact: user?.phone || "",
          },
          theme: {
            color: "#166534",
          },
          modal: {
            ondismiss: () => {
              setLoading(false);
              toast("Payment window closed. You can retry checkout anytime.", { icon: "ℹ️" });
            },
          },
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.on("payment.failed", (response: any) => {
          toast.error(response?.error?.description || "Payment failed. Please try again.");
          setLoading(false);
        });
        rzp.open();
        return;
      }

      // Cash on Delivery
      clearCart();
      toast.success("Order placed successfully!");
      navigate(`/orders/${data.order.id}`);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error.message);
    } finally {
      setLoading(false);
      scrollTo(0, 0);
    }
  };

  useEffect(() => {
    if (user?.addresses?.length) {
      const defaultAddr =
        user.addresses.find((addr) => addr.isDefault) || user.addresses[0];
      setAddress({
        id: defaultAddr?.id || "",
        label: defaultAddr?.label || "Home",
        address: defaultAddr?.address || "",
        city: defaultAddr?.city || "",
        state: defaultAddr?.state || "",
        zip: defaultAddr?.zip || "",
        isDefault: Boolean(defaultAddr?.isDefault),
        lat: defaultAddr?.lat || 0,
        lng: defaultAddr?.lng || 0,
      });
    }
  }, []);

  if (items.length === 0) {
    return (
      <div className="min-h-[75vh] bg-app-cream flex-center px-4 py-16">
        <div className="text-center bg-white p-8 sm:p-12 rounded-3xl border border-zinc-200/80 shadow-md max-w-md w-full">
          <div className="size-20 rounded-3xl bg-zinc-100 flex-center mx-auto mb-5 text-zinc-400">
            <ShoppingBagIcon className="size-10 text-app-green" />
          </div>
          <h2 className="text-2xl font-serif font-bold text-zinc-900 mb-2">
            Your cart is empty
          </h2>
          <p className="text-sm text-zinc-500 mb-6">
            Add items to your cart before proceeding to checkout.
          </p>
          <button
            onClick={() => navigate("/products")}
            className="w-full py-3.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold rounded-xl shadow-md shadow-orange-500/20 transition-all cursor-pointer"
          >
            Browse Fresh Groceries
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-app-cream py-8 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-zinc-500 hover:text-app-green mb-6 transition-colors cursor-pointer"
        >
          <ArrowLeftIcon className="size-4" />
          <span>Back</span>
        </button>

        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-zinc-900">
            Secure Checkout
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1">
            Complete your order in 3 simple steps
          </p>
        </div>

        {/* Step Indicator Navigation */}
        <div className="flex items-center gap-2 sm:gap-3 mb-8 overflow-x-auto pb-2 no-scrollbar">
          {steps.map((s, i) => {
            const isActive = step === s.key;
            return (
              <div key={s.key} className="flex items-center gap-2 sm:gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setStep(s.key as any)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer ${isActive
                    ? "bg-app-green text-white shadow-xs"
                    : "bg-white text-zinc-600 hover:text-zinc-900 border border-zinc-200/80"
                    }`}
                >
                  <s.icon className={`size-4 ${isActive ? "text-orange-300" : "text-zinc-400"}`} />
                  <span>{s.label}</span>
                </button>
                {i < steps.length - 1 && (
                  <ChevronRightIcon className="size-4 text-zinc-400 shrink-0" />
                )}
              </div>
            );
          })}
        </div>

        {/* 2-Column Checkout Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Step Form */}
          <div className="lg:col-span-8">
            {step === "address" && (
              <CheckoutAddress
                address={address}
                setAddress={setAddress}
                setStep={setStep}
                user={user}
              />
            )}

            {step === "payment" && (
              <CheckoutPayment
                paymentMethod={paymentMethod}
                setPaymentMethod={setPaymentMethod}
                setStep={setStep}
              />
            )}

            {step === "review" && (
              <CheckoutReview
                address={address}
                items={items}
                handlePlaceOrder={handlePlaceOrder}
                loading={loading}
                total={total}
              />
            )}
          </div>

          {/* Sticky Order Summary Sidebar */}
          <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-zinc-200/80 shadow-xs sticky top-24">
            <h3 className="text-lg font-serif font-bold text-zinc-900 mb-4 pb-3 border-b border-zinc-100">
              Order Summary
            </h3>

            <div className="space-y-3 text-xs sm:text-sm text-zinc-600">
              <div className="flex items-center justify-between">
                <span>
                  Items Subtotal ({items.length} {items.length === 1 ? "item" : "items"})
                </span>
                <span className="font-bold text-zinc-900">
                  {currency}{cartTotal.toFixed(2)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span>Delivery Charge</span>
                <span>
                  {deliveryFee === 0 ? (
                    <span className="font-bold text-emerald-600">FREE</span>
                  ) : (
                    <span className="font-bold text-zinc-900">
                      {currency}{deliveryFee.toFixed(2)}
                    </span>
                  )}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span>Estimated Sales Tax (8%)</span>
                <span className="font-bold text-zinc-900">
                  {currency}{tax.toFixed(2)}
                </span>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-zinc-100 text-base font-bold text-zinc-900">
                <span>Grand Total</span>
                <span className="text-xl text-app-green">
                  {currency}{total.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Trust Assurance */}
            <div className="mt-6 pt-4 border-t border-zinc-100 space-y-2 text-xs text-zinc-500">
              <div className="flex items-center gap-2">
                <TruckIcon className="size-4 text-emerald-600" />
                <span>30-minute Express Delivery Guarantee</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheckIcon className="size-4 text-emerald-600" />
                <span>Bank-grade 256-bit SSL Encrypted Payment</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckOut;