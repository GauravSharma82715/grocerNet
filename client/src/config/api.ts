import axios from "axios"
const api = axios.create({
    baseURL: import.meta.env.VITE_BASE_URL
})
//INJECT JWT TOKEN FROM SESSION/LOCAL STORAGE FOR EVERY REQUEST
api.interceptors.request.use((config) => {
    const isDeliveryApi = config.url?.startsWith('/api/delivery');
    const isDeliveryPage = typeof window !== "undefined" && window.location.pathname.startsWith('/delivery');

    let token: string | null = null;
    if (isDeliveryApi || isDeliveryPage) {
        token = sessionStorage.getItem('delivery_token') || localStorage.getItem('delivery_token');
    } else {
        token = sessionStorage.getItem('auth_token') || localStorage.getItem('auth_token');
    }

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

//Handle Authentication errors globally
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            const isDelivery = typeof window !== "undefined" && window.location.pathname.startsWith("/delivery");
            if (isDelivery) {
                sessionStorage.removeItem("delivery_token");
                sessionStorage.removeItem("delivery_partner");
                localStorage.removeItem("delivery_token");
                localStorage.removeItem("delivery_partner");
                if (window.location.pathname !== "/login") {
                    window.location.href = "/login";
                }
            } else {
                sessionStorage.removeItem("auth_token");
                sessionStorage.removeItem("auth_user");
                localStorage.removeItem("auth_token");
                localStorage.removeItem("auth_user");
                if (!window.location.pathname.includes("/login") && !window.location.pathname.includes("/register")) {
                    window.location.href = "/login";
                }
            }
        }
        return Promise.reject(error);
    }
);
export default api;