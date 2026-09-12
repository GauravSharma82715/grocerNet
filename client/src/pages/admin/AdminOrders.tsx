import { useState, useEffect } from "react";
import { SearchIcon, TruckIcon, XIcon } from "lucide-react";
import toast from "react-hot-toast";
import type { DeliveryPartner } from "../../types";
import Loading from "../../components/Loading";
import api from "../../config/api";

export default function AdminOrders() {
    const currency = import.meta.env.VITE_CURRENCY_SYMBOL || "₹";

    const [orders, setOrders] = useState<any[]>([]);
    const [partners, setPartners] = useState<DeliveryPartner[]>([]);
    const [loading, setLoading] = useState(true);
    const [assignModal, setAssignModal] = useState<string | null>(null);
    const [selectedPartner, setSelectedPartner] = useState("");
    const [activeTab, setActiveTab] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");

    const fetchOrders = async () => {
        try {
            const { data } = await api.get("/api/orders/all");
            setOrders(Array.isArray(data.orders) ? data.orders : Array.isArray(data) ? data : []);
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to load orders");
        } finally {
            setLoading(false);
        }
    };

    const fetchPartners = async () => {
        try {
            const { data } = await api.get("/api/admin/delivery-partners");
            const list = Array.isArray(data.partners) ? data.partners : Array.isArray(data) ? data : [];
            setPartners(list.filter((p: DeliveryPartner) => p.isActive));
        } catch {
            // silent catch
        }
    };

    useEffect(() => {
        fetchOrders();
        fetchPartners();
    }, []);

    const handleStatusChange = async (id: string, newStatus: string) => {
        try {
            await api.put(`/api/orders/${id}/status`, { status: newStatus });
            toast.success("Order status updated");
            setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status: newStatus } : o)));
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to update order status");
        }
    };

    const handleAssign = async () => {
        if (!assignModal || !selectedPartner) return;
        try {
            await api.put(`/api/admin/orders/${assignModal}/assign`, { partnerId: selectedPartner });
            toast.success("Delivery partner assigned");
            setAssignModal(null);
            setSelectedPartner("");
            fetchOrders();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to assign delivery partner");
        }
    };

    const statusOptions = ["Placed", "Confirmed", "Assigned", "Packed", "Out for Delivery", "Delivered", "Cancelled"];
    const tabs = ["all", ...statusOptions];

    const statusColors: Record<string, string> = {
        Placed: "bg-blue-100 text-blue-800",
        Confirmed: "bg-amber-100 text-amber-800",
        Assigned: "bg-indigo-100 text-indigo-800",
        Packed: "bg-cyan-100 text-cyan-800",
        "Out for Delivery": "bg-purple-100 text-purple-800",
        Delivered: "bg-green-100 text-green-800",
        Cancelled: "bg-red-100 text-red-800",
    };

    const filteredOrders = orders.filter((order) => {
        const matchesTab = activeTab === "all" || order.status === activeTab;
        const q = searchQuery.toLowerCase().trim();
        const matchesQuery =
            !q ||
            (order.id && order.id.toLowerCase().includes(q)) ||
            (order.user?.name && order.user.name.toLowerCase().includes(q)) ||
            (order.user?.email && order.user.email.toLowerCase().includes(q));
        return matchesTab && matchesQuery;
    });

    if (loading) return <Loading />;

    return (
        <div className="space-y-6">
            {/* Header and Controls */}
            <div className="bg-white rounded-2xl shadow-sm border border-app-border p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                    <h2 className="text-xl font-semibold text-zinc-900">
                        Orders ({filteredOrders.length})
                    </h2>
                    {/* Search Bar */}
                    <div className="relative max-w-xs w-full">
                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-400" />
                        <input
                            type="text"
                            placeholder="Search order ID or customer..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:border-app-green outline-none transition-all"
                        />
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                    {tabs.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                                activeTab === tab
                                    ? "bg-app-green text-white"
                                    : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                            }`}
                        >
                            {tab === "all" ? "All Orders" : tab}
                        </button>
                    ))}
                </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-app-border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-app-cream/50 text-zinc-500 uppercase text-xs font-semibold">
                            <tr>
                                <th className="px-6 py-4">Order Details</th>
                                <th className="px-6 py-4">Customer</th>
                                <th className="px-6 py-4">Items & Payment</th>
                                <th className="px-6 py-4">Total</th>
                                <th className="px-6 py-4">Delivery Partner</th>
                                <th className="px-6 py-4">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-app-border">
                            {filteredOrders.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-zinc-500">
                                        No orders found.
                                    </td>
                                </tr>
                            ) : (
                                filteredOrders.map((order: any) => {
                                    const orderId = order.id ? order.id.slice(-6).toUpperCase() : "";
                                    const itemsTotal = Array.isArray(order.items) ? order.items.reduce((sum: number, it: any) => sum + (Number(it.price) || 0) * (Number(it.quantity) || 1), 0) : 0;
                                    const totalAmount = Number(Number(order.total) > 0 ? order.total : itemsTotal).toFixed(2);
                                    const itemsCount = Array.isArray(order.items)
                                        ? order.items.reduce((sum: number, i: any) => sum + (Number(i.quantity) || 1), 0)
                                        : 0;
                                    const orderDate = order.createdAt
                                        ? new Date(order.createdAt).toLocaleString("en-US", {
                                              month: "short",
                                              day: "numeric",
                                              year: "numeric",
                                              hour: "2-digit",
                                              minute: "2-digit",
                                          })
                                        : "—";

                                    return (
                                        <tr key={order.id} className="hover:bg-zinc-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <p className="font-semibold text-zinc-900">#{orderId}</p>
                                                <p className="text-xs text-zinc-500">{orderDate}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="font-medium text-zinc-900">{order.user?.name || "Customer"}</p>
                                                <p className="text-xs text-zinc-500">{order.user?.email || "—"}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-zinc-700 font-medium">
                                                    {itemsCount} {itemsCount === 1 ? "item" : "items"}
                                                </p>
                                                <span className="inline-block mt-0.5 px-2 py-0.5 bg-zinc-100 text-zinc-600 text-[10px] font-semibold rounded uppercase">
                                                    {order.paymentMethod || "CARD"}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 font-semibold text-zinc-900">
                                                {currency}{totalAmount}
                                            </td>
                                            <td className="px-6 py-4">
                                                {order.deliveryPartner ? (
                                                    <div className="flex items-center gap-2">
                                                        <div className="size-7 rounded-full bg-app-green text-white flex-center text-xs font-semibold">
                                                            {order.deliveryPartner.name?.charAt(0)?.toUpperCase() || "D"}
                                                        </div>
                                                        <div>
                                                            <p className="text-xs font-medium text-zinc-900">{order.deliveryPartner.name}</p>
                                                            <p className="text-[10px] text-zinc-500">{order.deliveryPartner.phone}</p>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => {
                                                            setAssignModal(order.id);
                                                            setSelectedPartner("");
                                                        }}
                                                        className="px-3 py-1.5 text-xs font-semibold bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors flex items-center gap-1.5 cursor-pointer"
                                                    >
                                                        <TruckIcon className="size-3.5" /> Assign
                                                    </button>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <select
                                                    value={order.status}
                                                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border-r-8 border-transparent outline-none cursor-pointer leading-tight ${
                                                        statusColors[order.status] || "bg-zinc-100 text-zinc-800"
                                                    }`}
                                                >
                                                    {statusOptions.map((s) => (
                                                        <option key={s} value={s}>
                                                            {s}
                                                        </option>
                                                    ))}
                                                </select>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Assign Modal */}
            {assignModal && (
                <>
                    <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50" onClick={() => setAssignModal(null)} />
                    <div className="fixed inset-0 z-50 flex-center p-4">
                        <div className="bg-white rounded-2xl p-6 w-full max-w-sm animate-fade-in shadow-xl">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-app-green">Assign Delivery Partner</h3>
                                <button onClick={() => setAssignModal(null)} className="text-zinc-400 hover:text-zinc-600">
                                    <XIcon className="size-4" />
                                </button>
                            </div>
                            {partners.length === 0 ? (
                                <p className="text-sm text-zinc-500 mb-4">No active delivery partners found.</p>
                            ) : (
                                <div className="space-y-2 mb-5 max-h-60 overflow-y-auto">
                                    {partners.map((p) => (
                                        <label
                                            key={p.id}
                                            className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                                                selectedPartner === p.id
                                                    ? "border-app-green bg-app-green/5"
                                                    : "border-app-border hover:bg-app-cream"
                                            }`}
                                        >
                                            <input
                                                type="radio"
                                                name="partner"
                                                value={p.id}
                                                checked={selectedPartner === p.id}
                                                onChange={() => setSelectedPartner(p.id)}
                                                className="text-app-green"
                                            />
                                            <div className="size-8 rounded-full bg-app-green flex-center text-white text-xs font-semibold">
                                                {p.name?.charAt(0)?.toUpperCase() || "D"}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-zinc-900">{p.name}</p>
                                                <p className="text-xs text-zinc-500 capitalize">{p.vehicleType || "bike"} • {p.phone}</p>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            )}
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setAssignModal(null)}
                                    className="flex-1 py-2.5 text-sm font-medium text-zinc-600 bg-zinc-100 rounded-xl hover:bg-zinc-200 transition-colors cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAssign}
                                    disabled={!selectedPartner}
                                    className="flex-1 py-2.5 text-sm font-medium text-white bg-app-green rounded-xl hover:bg-app-green-light transition-colors disabled:opacity-50 cursor-pointer"
                                >
                                    Assign
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
