import { Outlet, useNavigate, useOutletContext } from "react-router-dom";
import { LogOutIcon, TruckIcon } from "lucide-react";
import { useEffect, useState } from "react";
import type { DeliveryPartner } from "../../types";
import api from "../../config/api";
import toast from "react-hot-toast";

export interface DeliveryContextType {
    partner: DeliveryPartner;
    setPartner: React.Dispatch<React.SetStateAction<DeliveryPartner | null>>;
    toggleOnlineStatus: () => Promise<void>;
    isOnline: boolean;
}

export default function DeliveryLayout() {
    const navigate = useNavigate();
    const [partner, setPartner] = useState<DeliveryPartner | null>(() => {
        const saved = sessionStorage.getItem("delivery_partner") || localStorage.getItem("delivery_partner");
        const token = sessionStorage.getItem("delivery_token") || localStorage.getItem("delivery_token");
        if (saved && token) {
            try {
                return JSON.parse(saved);
            } catch {
                return null;
            }
        }
        return null;
    });
    const [toggling, setToggling] = useState(false);

    useEffect(() => {
        const saved = sessionStorage.getItem("delivery_partner") || localStorage.getItem("delivery_partner");
        const token = sessionStorage.getItem("delivery_token") || localStorage.getItem("delivery_token");
        if (!saved || !token) {
            navigate('/login');
            return;
        }
        try {
            setPartner(JSON.parse(saved));
        } catch {
            navigate('/login');
        }

        // Fetch fresh profile from server to keep online status in sync
        api.get("/api/delivery/profile")
            .then(({ data }) => {
                if (data.partner) {
                    setPartner(data.partner);
                    sessionStorage.setItem("delivery_partner", JSON.stringify(data.partner));
                    localStorage.setItem("delivery_partner", JSON.stringify(data.partner));
                }
            })
            .catch(() => {});
    }, [navigate]);

    const handleLogout = async () => {
        try {
            await api.post("/api/delivery/logout");
        } catch (e) {
            // continue logout locally
        } finally {
            sessionStorage.removeItem("delivery_partner");
            sessionStorage.removeItem("delivery_token");
            localStorage.removeItem("delivery_partner");
            localStorage.removeItem("delivery_token");
            setPartner(null);
            toast.success("Logged out and marked offline");
            navigate("/login");
        }
    };

    const toggleOnlineStatus = async () => {
        if (toggling || !partner) return;
        setToggling(true);
        try {
            const { data } = await api.put("/api/delivery/toggle-status");
            const updated = { ...partner, isActive: data.isOnline };
            sessionStorage.setItem("delivery_partner", JSON.stringify(updated));
            localStorage.setItem("delivery_partner", JSON.stringify(updated));
            setPartner(updated);
            if (data.isOnline) {
                toast.success("You are now ONLINE. Ready for deliveries!");
            } else {
                toast.success("You are now OFFLINE. Deliveries paused.");
            }
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Failed to toggle status");
        } finally {
            setToggling(false);
        }
    };

    if (!partner) return null;

    const isOnline = Boolean(partner.isActive);

    return (
        <div className="min-h-screen bg-app-cream">
            {/* Top Bar */}
            <header className="bg-white border-b border-app-border sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <TruckIcon className="size-6 text-app-green" />
                        <span className="text-lg font-semibold text-app-green">Instacart Delivery</span>
                    </div>
                    <div className="flex items-center gap-3">
                        {/* Online / Offline Status Toggle Button */}
                        <button
                            onClick={toggleOnlineStatus}
                            disabled={toggling}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-all border shadow-xs cursor-pointer ${
                                isOnline
                                    ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                                    : "bg-zinc-100 text-zinc-600 border-zinc-300 hover:bg-zinc-200"
                            }`}
                        >
                            <span
                                className={`size-2 rounded-full ${
                                    isOnline ? "bg-emerald-500 animate-pulse" : "bg-zinc-400"
                                }`}
                            />
                            <span>{isOnline ? "Online" : "Offline"}</span>
                        </button>

                        <span className="text-sm font-medium text-zinc-600 hidden sm:inline">{partner.name}</span>
                        <button
                            onClick={handleLogout}
                            title="Log out and go offline"
                            className="p-2 text-zinc-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        >
                            <LogOutIcon className="size-4" />
                        </button>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col lg:flex-row gap-6">
                <main className="flex-1 min-w-0">
                    <Outlet context={{ partner, setPartner, toggleOnlineStatus, isOnline }} />
                </main>
            </div>
        </div>
    );
}

export function useDeliveryContext() {
    return useOutletContext<DeliveryContextType>();
}
