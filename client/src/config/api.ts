import axios from "axios"
const api = axios.create({
    baseURL: import.meta.env.VITE_BASE_URL
})
//INJECT JWT TOKEN FROM LOCAL STORAGE FOR EVERY REQUEST
api.interceptors.request.use((config) => {
    const isDeliveryApi = config.url?.startsWith('/api/delivery');
    const isDeliveryPage = typeof window !== "undefined" && window.location.pathname.startsWith('/delivery');

    let token = localStorage.getItem('auth_token');
    if (isDeliveryApi || isDeliveryPage) {
        token = localStorage.getItem('delivery_token') || token;
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
                localStorage.removeItem("delivery_token");
                localStorage.removeItem("delivery_partner");
                if (window.location.pathname !== "/delivery/login") {
                    window.location.href = "/delivery/login";
                }
            } else {
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