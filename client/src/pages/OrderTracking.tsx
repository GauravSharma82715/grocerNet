import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { Order } from "../assets/types";
import Loading from "../components/Loading";
import { ArrowLeftIcon, MapPinIcon, PackageIcon, PhoneIcon } from "lucide-react";
import OrderOTP from "../components/OrderTracking/OrderOTP";
import LiveMap from "../components/OrderTracking/LiveMap";
import OrderTimeLine from "../components/OrderTracking/OrderTimeLine";
import api from "../config/api";

const OrderTracking = () => {
  const currency = import.meta.env.VITE_CURRENCY_SYMBOL || "$";
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [liveLocation, setLiveLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    api
      .get(`/api/orders/${id}`)
      .then((res) => {
        setOrder(res.data?.order || res.data || null);
      })
      .catch((err) => {
        console.error("Failed to load order:", err);
      })
      .finally(() => setLoading(false));
  }, [id]);

  //live location every 10 seconds
  useEffect(() => {
    if (!order || ["Delivered", "Cancelled", "Placed"].includes(order.status))
      return;
    const fetchLocation = async () => {
      try {
        const { data } = await api.get(`/api/orders/${id}/location`)
        if (data.liveLocation?.lat && data.liveLocation?.lng && data.liveLocation.updatedAt) {
          setLiveLocation({
            lat: data.liveLocation.lat,
            lng: data.liveLocation.lng,
          })
        }
        if (data.status && data.status !== order.status) {
          setOrder((prev) => prev ? { ...prev, status: data.status } : prev)
        }
      } catch {


      }
    }
    fetchLocation();
    const interval = setInterval(fetchLocation, 10000);
    return () => clearInterval(interval);
  }, [id, order?.status])


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

  const orderItems = Array.isArray(order.items) ? order.items : [];
  const orderId = order.id ? order.id.slice(-8).toUpperCase() : id || "";
  const calculatedSubtotal = orderItems.reduce((sum: number, item: any) => {
    const isImgUrl =
      typeof item.image === "string" &&
      (item.image.startsWith("http") ||
        item.image.startsWith("/") ||
        item.image.startsWith("data:"));
    const price =
      item.price ??
      (!isImgUrl && !isNaN(Number(item.image)) ? Number(item.image) : 0);
    return sum + price * (item.quantity || 1);
  }, 0);

  const subtotal =
    order.subtotal && order.subtotal > 0
      ? Number(order.subtotal).toFixed(2)
      : calculatedSubtotal.toFixed(2);
  const deliveryFeeNum = Number(order.deliveryFee || 0);
  const tax =
    order.tax && order.tax > 0
      ? Number(order.tax).toFixed(2)
      : (calculatedSubtotal * 0.08).toFixed(2);
  const total =
    order.total && order.total > 0
      ? Number(order.total).toFixed(2)
      : (
        calculatedSubtotal +
        deliveryFeeNum +
        Number(tax)
      ).toFixed(2);

  const orderDate = order.createdAt
    ? new Date(order.createdAt).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
    : "";

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
              Order #{orderId}
            </h1>
            {orderDate && (
              <p className="text-xs sm:text-sm text-app-text-light mt-1">
                Placed on {orderDate}
              </p>
            )}
          </div>
          <span
            className={`px-4 py-1.5 text-xs sm:text-sm font-semibold rounded-full ${order.status === "Delivered"
              ? "bg-green-100 text-green-700"
              : order.status === "Cancelled"
                ? "bg-red-100 text-red-700"
                : "bg-orange-100 text-app-orange"
              }`}
          >
            {order.status || "Placed"}
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
                        {order.deliveryPartner.name?.charAt(0)?.toUpperCase() || "D"}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-app-green text-sm">
                        {order.deliveryPartner.name}
                      </p>
                      <p className="text-xs text-app-text-light capitalize mt-0.5">
                        {order.deliveryPartner.vehicleType || "Vehicle"} ✦ Delivery Partner
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
            {order.shippingAddress && (
              <div className="bg-white rounded-2xl p-5 border border-app-border shadow-xs">
                <h3 className="flex items-center gap-2 font-semibold text-app-green text-sm mb-3">
                  <MapPinIcon className="size-4 text-app-green" />
                  Delivery Address
                </h3>
                <p className="text-sm font-medium text-app-green mb-1">
                  {order.shippingAddress.label || "Delivery Location"}
                </p>
                <p className="text-xs sm:text-sm text-app-text-light leading-relaxed">
                  {order.shippingAddress.address}
                  <br />
                  {order.shippingAddress.city ? `${order.shippingAddress.city}, ` : ""}
                  {order.shippingAddress.state ? `${order.shippingAddress.state} ` : ""}
                  {order.shippingAddress.zip || ""}
                </p>
              </div>
            )}

            {/* Items & Price Summary */}
            <div className="bg-white rounded-2xl p-5 border border-app-border shadow-xs">
              <h3 className="font-semibold text-app-green text-sm mb-3">
                Items ({orderItems.length})
              </h3>

              {/* Items List */}
              <div className="space-y-3 divide-y divide-app-border/60">
                {orderItems.map((item: any, i: number) => {
                  const isImgUrl =
                    typeof item.image === "string" &&
                    (item.image.startsWith("http") ||
                      item.image.startsWith("/") ||
                      item.image.startsWith("data:"));

                  const itemPrice =
                    item.price ??
                    (!isImgUrl && !isNaN(Number(item.image))
                      ? Number(item.image)
                      : 0);
                  const itemQuantity = Number(item.quantity || 1);
                  const itemTotal = (itemPrice * itemQuantity).toFixed(2);

                  return (
                    <div
                      key={i}
                      className={`flex items-center gap-3 ${i > 0 ? "pt-3" : ""}`}
                    >
                      {isImgUrl ? (
                        <img
                          src={item.image}
                          alt={item.name || "Item"}
                          className="size-11 rounded-xl object-contain bg-app-cream p-1 border border-app-border shrink-0"
                        />
                      ) : (
                        <div className="size-11 rounded-xl bg-app-cream p-1 border border-app-border flex items-center justify-center shrink-0 text-app-green">
                          <PackageIcon className="size-5 text-app-green/60" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-app-green truncate">
                          {item.name || "Product"}
                        </p>
                        <p className="text-xs text-app-text-light">
                          {currency}
                          {itemPrice} × {itemQuantity}
                        </p>
                      </div>
                      <span className="text-sm font-semibold text-app-green shrink-0">
                        {currency}
                        {itemTotal}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Price Breakdown */}
              <div className="mt-4 pt-3 border-t border-app-border space-y-2 text-xs sm:text-sm">
                <div className="flex justify-between text-app-text-light">
                  <span>Subtotal</span>
                  <span className="font-medium text-app-green">
                    {currency}
                    {subtotal}
                  </span>
                </div>

                <div className="flex justify-between text-app-text-light">
                  <span>Delivery</span>
                  <span className="font-medium text-app-green">
                    {deliveryFeeNum === 0
                      ? "Free"
                      : `${currency}${deliveryFeeNum.toFixed(2)}`}
                  </span>
                </div>

                <div className="flex justify-between text-app-text-light">
                  <span>Tax</span>
                  <span className="font-medium text-app-green">
                    {currency}
                    {tax}
                  </span>
                </div>

                <div className="flex justify-between pt-2 border-t border-app-border font-semibold text-app-green text-sm sm:text-base">
                  <span>Total</span>
                  <span>
                    {currency}
                    {total}
                  </span>
                </div>

                <div className="pt-2 text-xs text-app-text-light flex items-center justify-between">
                  <span>Payment</span>
                  <span className="uppercase font-medium text-app-green">
                    {order.paymentMethod || "Card"} ({order.isPaid ? "Paid" : "Pending"})
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
