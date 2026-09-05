import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { Order } from "../assets/types";
import { dummyDashboardOrdersData } from "../assets/assets";
import Loading from "../components/Loading";
import { ArrowLeftIcon, MapPinIcon, PhoneIcon } from "lucide-react";
import OrderOTP from "../components/OrderTracking/OrderOTP";
import LiveMap from "../components/OrderTracking/LiveMap";
import OrderTimeLine from "../components/OrderTracking/OrderTimeLine";

const OrderTracking = () => {
  const currency = import.meta.env.VITE_CURRENCY_SYMBOL || "$";
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [liveLocation, setLiveLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    const list = dummyDashboardOrdersData as any[];
    const foundOrder = list.find((o) => o._id === id);
    if (foundOrder) {
      setOrder(foundOrder as Order);
      if (foundOrder.shippingAddress?.lat && foundOrder.shippingAddress?.lng) {
        setLiveLocation({
          lat: foundOrder.shippingAddress.lat + 0.003,
          lng: foundOrder.shippingAddress.lng + 0.003,
        });
      }
    }
    setLoading(false);
  }, [id, navigate]);

  if (loading) return <Loading />;

  if (!order) {
    return (
      <div className="min-h-screen bg-app-cream flex flex-col items-center justify-center p-4">
        <h2 className="text-xl font-semibold text-app-green mb-2">Order Not Found</h2>
        <p className="text-sm text-app-text-light mb-6">
          We couldn't find an order with ID #{id?.slice(-8).toUpperCase() || id}
        </p>
        <button
          onClick={() => navigate("/orders")}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-app-green text-white text-sm font-medium rounded-xl hover:bg-app-green-light transition-colors cursor-pointer"
        >
          <ArrowLeftIcon className="size-4" /> Back to Orders
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-app-cream mb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back button */}
        <button
          onClick={() => navigate("/orders")}
          className="inline-flex items-center gap-2 text-sm font-medium text-app-text-light hover:text-app-green transition-colors mb-4 cursor-pointer"
        >
          <ArrowLeftIcon className="size-4" /> Back to Orders
        </button>

        {/* Order ID, date, status */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-app-green">
              Order #{order._id.slice(-8).toUpperCase()}
            </h1>
            <p className="text-xs sm:text-sm text-app-text-light mt-1">
              Placed on{" "}
              {new Date(order.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
          <span
            className={`px-4 py-1.5 text-xs sm:text-sm font-semibold rounded-full ${order.status === "Delivered"
                ? "bg-green-100 text-green-700"
                : order.status === "Cancelled"
                  ? "bg-red-100 text-red-700"
                  : "bg-orange-100 text-app-orange"
              }`}
          >
            {order.status}
          </span>
        </div>

        {/* Grid layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main tracking column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery OTP */}
            <OrderOTP order={order} />

            {/* Live Tracking Map */}
            <LiveMap order={order} liveLocation={liveLocation} />

            {/* Progress timeline */}
            <OrderTimeLine order={order} />

            {/* Delivery Partner */}
            {order.deliveryPartner &&
              order.status !== "Delivered" &&
              order.status !== "Cancelled" && (
                <div className="bg-white rounded-2xl p-5 border border-app-border flex items-center justify-between shadow-xs">
                  <div className="flex items-center gap-3">
                    <div className="size-11 rounded-full bg-app-green flex items-center justify-center shrink-0">
                      <span className="text-white font-semibold text-sm">
                        {order.deliveryPartner.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-app-green text-sm">
                        {order.deliveryPartner.name}
                      </p>
                      <p className="text-xs text-app-text-light capitalize mt-0.5">
                        {order.deliveryPartner.vehicleType} ✦ Delivery Partner
                      </p>
                    </div>
                  </div>
                  {order.deliveryPartner.phone && (
                    <a
                      href={`tel:${order.deliveryPartner.phone}`}
                      className="size-10 rounded-xl bg-app-cream hover:bg-app-cream-dark flex items-center justify-center border border-app-border transition-colors text-app-green"
                      title="Call Delivery Partner"
                    >
                      <PhoneIcon className="size-4 text-app-green" />
                    </a>
                  )}
                </div>
              )}
          </div>

          {/* Orders details sidebar */}
          <div className="space-y-5">
            {/* Delivery Address */}
            <div className="bg-white rounded-2xl p-5 border border-app-border shadow-xs">
              <h3 className="flex items-center gap-2 font-semibold text-app-green text-sm mb-3">
                <MapPinIcon className="size-4 text-app-green" />
                Delivery Address
              </h3>
              <p className="text-sm font-medium text-app-green mb-1">
                {order.shippingAddress.label}
              </p>
              <p className="text-xs sm:text-sm text-app-text-light leading-relaxed">
                {order.shippingAddress.address}
                <br />
                {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                {order.shippingAddress.zip}
              </p>
            </div>

            {/* Items & Price Summary */}
            <div className="bg-white rounded-2xl p-5 border border-app-border shadow-xs">
              <h3 className="font-semibold text-app-green text-sm mb-3">
                Items ({order.items.length})
              </h3>

              {/* Items List */}
              <div className="space-y-3 divide-y divide-app-border/60">
                {order.items.map((item, i) => (
                  <div
                    key={i}
                    className={`flex items-center gap-3 ${i > 0 ? "pt-3" : ""}`}
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="size-11 rounded-xl object-contain bg-app-cream p-1 border border-app-border shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-app-green truncate">
                        {item.name}
                      </p>
                      <p className="text-xs text-app-text-light">
                        {currency}
                        {item.price} × {item.quantity}
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-app-green shrink-0">
                      {currency}
                      {(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Price Breakdown */}
              <div className="mt-4 pt-3 border-t border-app-border space-y-2 text-xs sm:text-sm">
                <div className="flex justify-between text-app-text-light">
                  <span>Subtotal</span>
                  <span className="font-medium text-app-green">
                    {currency}
                    {order.subtotal.toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between text-app-text-light">
                  <span>Delivery</span>
                  <span className="font-medium text-app-green">
                    {order.deliveryFee === 0
                      ? "Free"
                      : `${currency}${order.deliveryFee.toFixed(2)}`}
                  </span>
                </div>

                <div className="flex justify-between text-app-text-light">
                  <span>Tax</span>
                  <span className="font-medium text-app-green">
                    {currency}
                    {order.tax.toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between pt-2 border-t border-app-border font-semibold text-app-green text-sm sm:text-base">
                  <span>Total</span>
                  <span>
                    {currency}
                    {order.total.toFixed(2)}
                  </span>
                </div>

                <div className="pt-2 text-xs text-app-text-light flex items-center justify-between">
                  <span>Payment</span>
                  <span className="uppercase font-medium text-app-green">
                    {order.paymentMethod} ({order.isPaid ? "Paid" : "Pending"})
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;
