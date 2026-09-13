import { useEffect, useRef, useState, useCallback } from "react";
import { PackageIcon, NavigationIcon, AlertCircleIcon } from "lucide-react";
import OtpModal from "../../components/Delivery/OtpModal";
import DeliveryOrderCard from "../../components/Delivery/DeliveryOrderCard";
import Loading from "../../components/Loading";
import type { Order } from "../../types";
import api from "../../config/api";
import toast from "react-hot-toast";
import { useDeliveryContext } from "./DeliveryLayout";

export default function DeliveryDashboard() {
    const { partner, isOnline, toggleOnlineStatus } = useDeliveryContext();
    const [orders, setOrders] = useState<Order[]>([]);
    const [counts, setCounts] = useState<{ available: number; active: number; completed: number }>({
        available: 0,
        active: 0,
        completed: 0
    });
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState<"available" | "active" | "completed">("available");
    const [tracking, setTracking] = useState(false);

    // Declined orders stored per partner
    const declinedStorageKey = partner?.id ? `declined_orders_${partner.id}` : "declined_orders";
    const [declinedOrderIds, setDeclinedOrderIds] = useState<string[]>(() => {
        try {
            const saved = localStorage.getItem(declinedStorageKey);
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });

    // OTP modal
    const [otpModal, setOtpModal] = useState<string | null>(null);
    const [otp, setOtp] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const watchIdRef = useRef<number | null>(null);

    const fetchOrders = useCallback(async (isSilent = false) => {
        if (!isSilent) setLoading(true);
        try {
            const { data } = await api.get(`/api/delivery/my-deliveries?status=${tab}`);
            setOrders(data.orders || []);
            if (data.counts) {
                setCounts(data.counts);
            }
        } catch (error: any) {
            if (!isSilent) {
                toast.error(error?.response?.data?.message || "Failed to load deliveries");
            }
        } finally {
            if (!isSilent) setLoading(false);
        }
    }, [tab]);

    useEffect(() => {
        fetchOrders(false);
    }, [fetchOrders]);

    // Background auto-refresh every 3 seconds to auto-sync status updates and new packed orders
    useEffect(() => {
        const interval = setInterval(() => {
            fetchOrders(true);
        }, 3000);
        return () => clearInterval(interval);
    }, [fetchOrders]);

    // Live location sharing
    useEffect(() => {
        const activeOrders = orders.filter((o) => ["Assigned", "Out for Delivery"].includes(o.status));
        if (activeOrders.length === 0 || !tracking || !isOnline) {
            if (watchIdRef.current) {
                navigator.geolocation.clearWatch(watchIdRef.current);
                watchIdRef.current = null;
            }
            return;
        }
        const sendLocation = (pos: GeolocationPosition) => {
            const { latitude: lat, longitude: lng } = pos.coords;
            activeOrders.forEach((order) => {
                api.put(`/api/delivery/my-deliveries/${order.id}/location`, { lat, lng }).catch(() => {
                    // silently fail - user location may be inaccurate 
                });
            });
        };
        watchIdRef.current = navigator.geolocation.watchPosition(sendLocation, () => { }, {
            enableHighAccuracy: true,
            maximumAge: 10000,
        });
        const interval = setInterval(() => {
            navigator.geolocation.getCurrentPosition(sendLocation, () => { }, { enableHighAccuracy: true });
        }, 10000);
        return () => {
            if (watchIdRef.current !== null) {
                navigator.geolocation.clearWatch(watchIdRef.current);
                watchIdRef.current = null;
            }
            clearInterval(interval);
        };
    }, [tracking, orders, isOnline]);

    const handleAcceptDelivery = async (orderId: string) => {
        if (!isOnline) {
            toast.error("Please switch to Online status to accept orders");
            return;
        }
        try {
            const { data } = await api.post(`/api/delivery/my-deliveries/${orderId}/accept`);
            toast.success(data.message || "Order accepted! Moved to Active deliveries.");
            setTab("active");
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Failed to accept order");
            fetchOrders(true);
        }
    };

    const handleDeclineOrder = (orderId: string) => {
        const updated = [...declinedOrderIds, orderId];
        setDeclinedOrderIds(updated);
        try {
            localStorage.setItem(declinedStorageKey, JSON.stringify(updated));
        } catch {
            // ignore storage error
        }
        toast("Order skipped from available list", { icon: "ℹ️" });
    };

    const handleUpdateStatus = async (orderId: string, status: string) => {
        if (!isOnline) {
            toast.error("Please switch to Online status to update deliveries");
            return;
        }
        try {
            await api.put(`/api/delivery/my-deliveries/${orderId}/status`, { status });
            toast.success(`Status updated to ${status}`);
            fetchOrders(false);
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Failed to update status");
        }
    };

    const handleComplete = async () => {
        if (!otpModal || !otp) return;
        if (!isOnline) {
            toast.error("Please switch to Online status to complete deliveries");
            return;
        }
        setSubmitting(true);
        try {
            await api.put(`/api/delivery/my-deliveries/${otpModal}/complete`, { otp });
            toast.success("Delivery completed successfully!");
            setOtpModal(null);
            setOtp("");
            fetchOrders(false);
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Invalid OTP");
        } finally {
            setSubmitting(false);
        }
    };

    // Filter out declined orders in available tab
    const displayOrders = tab === "available"
        ? orders.filter((o) => !declinedOrderIds.includes(o.id))
        : orders;

    return (
        <div className="space-y-6">
            {/* Offline Alert Banner */}
            {!isOnline && (
                <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-4 flex items-center justify-between gap-4 shadow-xs animate-fade-in">
                    <div className="flex items-center gap-3">
                        <AlertCircleIcon className="size-5 text-amber-600 shrink-0" />
                        <div>
                            <h4 className="text-sm font-semibold text-amber-950">You are currently Offline</h4>
                            <p className="text-xs text-amber-800/80 mt-0.5">
                                Switch to Online when you are ready to accept new delivery orders and update statuses.
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={toggleOnlineStatus}
                        className="px-4 py-2 bg-app-green text-white text-xs font-semibold rounded-xl hover:bg-app-green-light active:scale-95 transition-all shrink-0 cursor-pointer shadow-xs"
                    >
                        Go Online
                    </button>
                </div>
            )}

            {/* Tabs + Tracking toggle */}
            <div className="flex items-center gap-2 flex-wrap justify-between">
                <div className="flex items-center gap-2 flex-wrap">
                    <button
                        onClick={() => setTab("available")}
                        className={`px-4 py-2 text-sm font-medium rounded-xl transition-all cursor-pointer flex items-center gap-2 ${tab === "available"
                            ? "bg-app-green text-white shadow-xs font-semibold"
                            : "bg-white text-zinc-600 hover:bg-app-cream border border-app-border"
                            }`}
                    >
                        <span>Available for Pickup</span>
                        {counts.available > 0 && (
                            <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${
                                tab === "available" ? "bg-white text-app-green" : "bg-emerald-100 text-emerald-800"
                            }`}>
                                {counts.available}
                            </span>
                        )}
                    </button>

                    <button
                        onClick={() => setTab("active")}
                        className={`px-4 py-2 text-sm font-medium rounded-xl transition-all cursor-pointer flex items-center gap-2 ${tab === "active"
                            ? "bg-app-green text-white shadow-xs font-semibold"
                            : "bg-white text-zinc-600 hover:bg-app-cream border border-app-border"
                            }`}
                    >
                        <span>Active Deliveries</span>
                        {counts.active > 0 && (
                            <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${
                                tab === "active" ? "bg-white text-app-green" : "bg-indigo-100 text-indigo-800"
                            }`}>
                                {counts.active}
                            </span>
                        )}
                    </button>

                    <button
                        onClick={() => setTab("completed")}
                        className={`px-4 py-2 text-sm font-medium rounded-xl transition-all cursor-pointer flex items-center gap-2 ${tab === "completed"
                            ? "bg-app-green text-white shadow-xs font-semibold"
                            : "bg-white text-zinc-600 hover:bg-app-cream border border-app-border"
                            }`}
                    >
                        <span>Completed</span>
                        {counts.completed > 0 && (
                            <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${
                                tab === "completed" ? "bg-white text-app-green" : "bg-zinc-100 text-zinc-700"
                            }`}>
                                {counts.completed}
                            </span>
                        )}
                    </button>
                </div>

                <div className="ml-auto">
                    <button
                        onClick={() => {
                            if (!isOnline) {
                                toast.error("Please go online to share live location");
                                return;
                            }
                            setTracking((prev) => !prev);
                        }}
                        className={`px-4 py-2 text-sm font-medium rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer ${tracking
                            ? "bg-emerald-600 text-white shadow-xs"
                            : "bg-white text-zinc-600 border border-app-border hover:bg-app-cream"
                            }`}
                    >
                        <NavigationIcon className={`w-3.5 h-3.5 ${tracking ? "animate-pulse" : ""}`} />
                        {tracking ? "Sharing Location" : "Share Location"}
                    </button>
                </div>
            </div>

            {/* Orders List */}
            {loading ? (
                <Loading />
            ) : displayOrders.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-app-border shadow-xs">
                    <PackageIcon className="size-12 text-zinc-300 mx-auto mb-3" />
                    <p className="text-lg font-semibold text-zinc-900 mb-1">
                        {tab === "available" && "No packed orders waiting for pickup"}
                        {tab === "active" && "No active deliveries in progress"}
                        {tab === "completed" && "No completed deliveries yet"}
                    </p>
                    <p className="text-sm text-zinc-500 max-w-md mx-auto">
                        {tab === "available" && "When store admin marks placed orders as 'Packed', they will automatically appear here for you to accept."}
                        {tab === "active" && "Accept orders from the 'Available for Pickup' tab to start delivering them."}
                        {tab === "completed" && "Orders you successfully deliver will be archived here."}
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {displayOrders.map((order) => (
                        <DeliveryOrderCard
                            key={order.id}
                            order={order}
                            tab={tab}
                            handleAcceptDelivery={handleAcceptDelivery}
                            handleDeclineOrder={handleDeclineOrder}
                            handleUpdateStatus={handleUpdateStatus}
                            setOtpModal={setOtpModal}
                        />
                    ))}
                </div>
            )}

            {/* OTP Modal */}
            {otpModal && (
                <OtpModal
                    setOtpModal={setOtpModal}
                    otp={otp}
                    setOtp={setOtp}
                    handleComplete={handleComplete}
                    submitting={submitting}
                />
            )}
        </div>
    );
}
