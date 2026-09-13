import { CheckCircleIcon, ClockIcon, MapPinIcon, PhoneIcon, TruckIcon, XCircleIcon } from 'lucide-react'
import type { Order } from '../../types'
import { statusColors } from '../../assets/assets';

interface DeliveryOrderCardProps {
    order: Order;
    tab: "available" | "active" | "completed";
    handleAcceptDelivery?: (orderId: string) => void;
    handleDeclineOrder?: (orderId: string) => void;
    handleUpdateStatus: (orderId: string, status: string) => void;
    setOtpModal: (orderId: string) => void;
}

export default function DeliveryOrderCard({
    order,
    tab,
    handleAcceptDelivery,
    handleDeclineOrder,
    handleUpdateStatus,
    setOtpModal
}: DeliveryOrderCardProps) {

    const currency = import.meta.env.VITE_CURRENCY_SYMBOL || "₹";

    const user = typeof order.user === "object" && order.user !== null ? order.user : { name: "Customer", email: "", phone: "" };

    const shippingAddress: any = typeof order.shippingAddress === "string"
        ? (JSON.parse(order.shippingAddress || "{}"))
        : (order.shippingAddress || {});

    const items: any[] = typeof order.items === "string"
        ? (JSON.parse(order.items || "[]"))
        : (Array.isArray(order.items) ? order.items : []);

    const subtotalFromItems = items.reduce(
        (sum: number, it: any) => sum + (Number(it.price) || 0) * (Number(it.quantity) || 1),
        0
    );
    const calculatedTotal = Number(order.total) > 0
        ? Number(order.total)
        : (subtotalFromItems > 0 ? subtotalFromItems + (Number(order.deliveryFee) || 0) + (Number(order.tax) || 0) : Number(order.subtotal || 0));

    const totalAmount = calculatedTotal.toFixed(2);

    return (
        <div key={order.id} className="bg-white rounded-2xl border border-app-border overflow-hidden shadow-xs hover:shadow-md transition-shadow">
            {/* Header */}
            <div className="px-5 py-4 border-b border-app-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <span className="text-sm font-mono font-semibold text-zinc-600">#{order.id.slice(-6).toUpperCase()}</span>
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${statusColors[order.status] || "bg-zinc-100 text-zinc-600"}`}>
                        {order.status}
                    </span>
                </div>
                <span className="text-sm font-semibold text-zinc-900">{currency}{totalAmount}</span>
            </div>

            {/* Body */}
            <div className="px-5 py-4 space-y-3">
                {/* Customer */}
                <div className="flex items-center gap-2 text-sm">
                    <div className="size-8 rounded-full bg-app-cream flex-center">
                        <span className="text-xs font-semibold text-app-green">{user.name?.charAt(0) || "C"}</span>
                    </div>
                    <div>
                        <p className="font-medium text-zinc-900">{user.name || "Customer"}</p>
                        {user.phone && <p className="text-xs text-zinc-500 flex items-center gap-1"><PhoneIcon className="size-3" /> {user.phone}</p>}
                    </div>
                </div>

                {/* Address */}
                <div className="flex items-start gap-2 text-sm text-zinc-600">
                    <MapPinIcon className="size-4 text-app-green shrink-0 mt-0.5" />
                    <p>{shippingAddress.address || "N/A"}, {shippingAddress.city || ""}, {shippingAddress.state || ""} {shippingAddress.zip || ""}</p>
                </div>

                {/* Items count */}
                <p className="text-xs text-zinc-500">{items.length} item{items.length !== 1 ? "s" : ""} • {(order.paymentMethod || "card").toUpperCase()}</p>
            </div>

            {/* Available Actions (Accept or Decline) */}
            {tab === "available" && (
                <div className="px-5 py-3 border-t border-app-border flex items-center justify-between gap-3 bg-zinc-50/50">
                    <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100 flex items-center gap-1.5">
                        <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Packed & Ready for Pickup
                    </span>
                    <div className="flex items-center gap-2">
                        {handleDeclineOrder && (
                            <button
                                onClick={() => handleDeclineOrder(order.id)}
                                className="px-3.5 py-2 text-xs font-semibold text-zinc-600 bg-white border border-zinc-200 hover:bg-red-50 hover:text-red-700 hover:border-red-200 rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                            >
                                <XCircleIcon className="w-3.5 h-3.5" /> Decline
                            </button>
                        )}
                        {handleAcceptDelivery && (
                            <button
                                onClick={() => handleAcceptDelivery(order.id)}
                                className="px-4 py-2 text-xs font-semibold text-white bg-app-green hover:bg-app-green-light active:scale-95 rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
                            >
                                <CheckCircleIcon className="w-3.5 h-3.5" /> Accept Order
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Active Actions */}
            {tab === "active" && (
                <div className="px-5 py-3 border-t border-app-border flex flex-wrap items-center gap-2">
                    {(order.status === "Assigned" || order.status === "Packed") && (
                        <button
                            onClick={() => handleUpdateStatus(order.id, "Out for Delivery")}
                            className="px-4 py-2 text-xs sm:text-sm font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                            <TruckIcon className="w-3.5 h-3.5" /> Out for Delivery
                        </button>
                    )}
                    {order.status === "Out for Delivery" && (
                        <button
                            onClick={() => setOtpModal(order.id)}
                            className="px-4 py-2 text-xs sm:text-sm font-semibold bg-app-green text-white hover:bg-app-green-light rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                        >
                            <CheckCircleIcon className="w-3.5 h-3.5" /> Mark Delivered (Enter OTP)
                        </button>
                    )}
                </div>
            )}

            {/* Completed Footer */}
            {tab === "completed" && (
                <div className="px-5 py-3 border-t border-app-border">
                    <p className="text-xs text-zinc-500 flex items-center gap-1">
                        <ClockIcon className="size-3" />
                        {new Date(order.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </p>
                </div>
            )}
        </div>
    );
}
