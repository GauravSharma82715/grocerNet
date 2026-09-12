import { useEffect, useState } from "react";
import type { Order } from "../assets/types";
import { Link, useSearchParams } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { statusColors } from "../assets/assets";
import Loading from "../components/Loading";
import { CalendarIcon, PackageIcon } from "lucide-react";
import api from "../config/api";
import toast from "react-hot-toast";

const MyOrders = () => {
  const currency = import.meta.env.VITE_CURRENCY_SYMBOL || "₹";
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [searchParams, setSearchParams] = useSearchParams();
  const tabs = ["all", "Placed", "Out for Delivery", "Delivered"];
  const { clearCart } = useCart();

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = activeTab !== "all" ? `?status=${activeTab}` : "";
      const { data } = await api.get(`/api/orders${params}`);
      const ordersList = Array.isArray(data) ? data : data?.orders || [];
      setOrders(ordersList);
    } catch (error: any) {
      toast.error(error.response?.data?.message || error?.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (searchParams.get("clearCart")) {
      clearCart();
      setSearchParams({});
      setTimeout(() => {
        fetchOrders();
      }, 500);
    } else {
      fetchOrders();
    }
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-app-cream mb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-semibold text-app-green mb-6">
          My Orders
        </h1>
        {/*Tabs*/}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium rounded-xl whitespace-nowrap transition-colors ${
                activeTab === tab
                  ? "bg-app-green text-white"
                  : "bg-white text-app-text-light hover:bg-app-cream"
              }`}
            >
              {tab === "all" ? "All Orders" : tab}
            </button>
          ))}
        </div>
        {/*Orders list*/}
        {loading ? (
          <Loading />
        ) : !orders || orders.length === 0 ? (
          <div className="text-center py-16">
            <PackageIcon className="size-16 text-app-border mx-auto mb-2" />
            <h2 className="text-lg font-medium text-app-green mb-2">No orders yet</h2>
            <p className="text-sm text-app-text-light mb-4">Start shopping to your orders here</p>
            <Link to="/products" className="inline-flex px-4 py-2 bg-app-green text-white text-sm rounded-lg">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-4 max-w-4xl">
            {orders.map((order) => {
              const orderItems = Array.isArray(order.items) ? order.items : [];
              const orderId = order.id ? order.id.slice(-8).toUpperCase() : "";
              const calculatedTotal = orderItems.reduce((sum: number, item: any) => {
                const price =
                  item.price ??
                  (typeof item.image === "number" || (!isNaN(Number(item.image)) && typeof item.image === "string" && !item.image.includes("/"))
                    ? Number(item.image)
                    : 0);
                return sum + price * (item.quantity || 1);
              }, 0);
              const totalAmount =
                order.total && order.total > 0
                  ? Number(order.total).toFixed(2)
                  : calculatedTotal.toFixed(2);

              const orderDate = order.createdAt
                ? new Date(order.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                : "";

              return (
                <Link
                  key={order.id}
                  to={`/orders/${order.id}`}
                  className="block bg-white rounded-2xl p-5 border border-app-border shadow-xs hover:shadow-md hover:border-app-green/30 transition-all"
                >
                  {/* Order ID, Date & Status */}
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-sm font-semibold text-app-green">
                        Order #{orderId}
                      </p>
                      {orderDate && (
                        <div className="flex items-center gap-1.5 mt-1 text-app-text-light">
                          <CalendarIcon className="size-3.5" />
                          <span className="text-xs">{orderDate}</span>
                        </div>
                      )}
                    </div>

                    {/* Status Badge */}
                    <span
                      className={`px-3 py-1 text-xs font-semibold rounded-full ${
                        statusColors[order.status] || "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {order.status || "Placed"}
                    </span>
                  </div>

                  {/* Items Thumbnails */}
                  <div className="flex items-center gap-3 py-3 border-y border-app-border my-3 overflow-x-auto no-scrollbar">
                    {orderItems.map((item: any, idx: number) => {
                      const isImgUrl =
                        typeof item.image === "string" &&
                        item.image.trim().length > 0 &&
                        (item.image.startsWith("http") ||
                          item.image.startsWith("/") ||
                          item.image.startsWith("data:") ||
                          item.image.includes(".png") ||
                          item.image.includes(".jpg") ||
                          item.image.includes(".jpeg") ||
                          item.image.includes(".webp") ||
                          item.image.includes(".svg"));

                      const itemPrice =
                        item.price ??
                        (!isImgUrl && !isNaN(Number(item.image))
                          ? Number(item.image)
                          : 0);
                      const itemQuantity = Number(item.quantity || 1);

                      return (
                        <div
                          key={idx}
                          className="flex items-center gap-2 shrink-0 bg-app-cream/60 p-2 rounded-xl border border-app-border/60"
                        >
                          {isImgUrl ? (
                            <img
                              src={item.image}
                              alt={item.name || "Item"}
                              className="size-10 rounded-lg object-contain bg-white"
                            />
                          ) : (
                            <div className="size-10 rounded-lg bg-white flex items-center justify-center border border-app-border text-app-green">
                              <PackageIcon className="size-5 text-app-green/60" />
                            </div>
                          )}
                          <div className="text-xs pr-1">
                            <p className="font-medium text-app-green truncate max-w-[120px]">
                              {item.name || "Product"}
                            </p>
                            <p className="text-app-text-light">
                              {currency}
                              {itemPrice} × {itemQuantity}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Total items and price */}
                  <div className="flex items-center justify-between text-xs sm:text-sm pt-1">
                    <span className="text-app-text-light">
                      {orderItems.reduce((sum: number, item: any) => sum + Number(item.quantity || 1), 0)} items • Payment:{" "}
                      <span className="uppercase font-medium text-app-green">
                        {order.paymentMethod || "Card"}
                      </span>
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-app-text-light">Total:</span>
                      <span className="text-base font-semibold text-app-green">
                        {currency}
                        {totalAmount}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrders;
