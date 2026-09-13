//Login delivery partner
//post/api/delivery/login
import bcrypt from "bcrypt";
import { Request, Response } from "express";
import { prisma } from "../config/prisma.js";
import jwt from "jsonwebtoken";
const generateToken = (id: string) => {
    return jwt.sign({ id, role: "delivery" }, process.env.JWT_SECRET as string, { expiresIn: "30d" })
}

export const loginPartner = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: "email and password are required" })
    }
    const partner = await prisma.deliveryPartner.findUnique({
        where: {
            email: email.toLowerCase()
        }
    })
    if (!partner) {
        return res.status(401).json({ message: "Delivery partner account does not exist" });
    }
    const isMatch = await bcrypt.compare(password, partner.password);
    if (!isMatch) {
        return res.status(401).json({ message: "Incorrect password" });
    }
    // Automatically set online on login
    const updatedPartner = await prisma.deliveryPartner.update({
        where: { id: partner.id },
        data: { isActive: true }
    });
    const token = generateToken(updatedPartner.id);
    const { password: _, ...partnerData } = updatedPartner;
    res.json({ partner: partnerData, token });
}

// Logout delivery partner and mark offline
export const logoutPartner = async (req: Request, res: Response) => {
    if (req.partner?.id) {
        await prisma.deliveryPartner.update({
            where: { id: req.partner.id },
            data: { isActive: false }
        });
    }
    res.json({ success: true, message: "Logged out and marked offline" });
};

// Toggle or update online/offline status
export const toggleOnlineStatus = async (req: Request, res: Response) => {
    const { isOnline } = req.body;
    const partnerId = req.partner!.id;
    const current = await prisma.deliveryPartner.findUnique({
        where: { id: partnerId }
    });
    if (!current) {
        return res.status(404).json({ message: "Delivery partner not found" });
    }
    const newStatus = typeof isOnline === "boolean" ? isOnline : !current.isActive;
    const updated = await prisma.deliveryPartner.update({
        where: { id: partnerId },
        data: { isActive: newStatus }
    });
    const { password: _, ...partnerData } = updated;
    res.json({ partner: partnerData, isOnline: newStatus, message: `Status updated to ${newStatus ? "Online" : "Offline"}` });
};

// Get current delivery partner profile
export const getPartnerProfile = async (req: Request, res: Response) => {
    const partner = await prisma.deliveryPartner.findUnique({
        where: { id: req.partner!.id }
    });
    if (!partner) {
        return res.status(404).json({ message: "Delivery partner not found" });
    }
    const { password: _, ...partnerData } = partner;
    res.json({ partner: partnerData });
};

//GET assigned deliveries or available packed deliveries
export const getMyDeliveries = async (req: Request, res: Response) => {
    const { status } = req.query;
    const partnerId = req.partner?.id;

    if (!partnerId) {
        return res.status(401).json({ message: "Unauthorized delivery partner" });
    }

    let where: any = { deliveryPartnerId: partnerId };
    if (status === "available") {
        where = {
            deliveryPartnerId: null,
            status: "Packed",
            NOT: [{ paymentMethod: "card", isPaid: false }]
        };
    } else if (status === "active") {
        where = {
            deliveryPartnerId: partnerId,
            status: { in: ["Assigned", "Out for Delivery", "Out for delivery"] }
        };
    } else if (status === "completed") {
        where = {
            deliveryPartnerId: partnerId,
            status: { in: ["Delivered", "Cancelled"] }
        };
    }

    const [orders, availableCount, activeCount, completedCount] = await Promise.all([
        prisma.order.findMany({
            where,
            include: { user: { select: { name: true, email: true, phone: true } } },
            orderBy: { createdAt: "desc" }
        }),
        prisma.order.count({
            where: {
                deliveryPartnerId: null,
                status: "Packed",
                NOT: [{ paymentMethod: "card", isPaid: false }]
            }
        }),
        prisma.order.count({
            where: {
                deliveryPartnerId: partnerId,
                status: { in: ["Assigned", "Out for Delivery", "Out for delivery"] }
            }
        }),
        prisma.order.count({
            where: {
                deliveryPartnerId: partnerId,
                status: { in: ["Delivered", "Cancelled"] }
            }
        })
    ]);

    const productIds: string[] = [];
    orders.forEach((order) => {
        const items = typeof order.items === "string" ? JSON.parse(order.items || "[]") : (Array.isArray(order.items) ? order.items : []);
        items.forEach((item: any) => {
            if (item.product) productIds.push(item.product);
        });
    });

    const products = productIds.length > 0
        ? await prisma.product.findMany({ where: { id: { in: productIds } } })
        : [];
    const productMap: Record<string, typeof products[0]> = {};
    products.forEach((p) => { productMap[p.id] = p; });

    const enrichedOrders = orders.map((order) => {
        const items = typeof order.items === "string" ? JSON.parse(order.items || "[]") : (Array.isArray(order.items) ? order.items : []);
        const enrichedItems = items.map((item: any) => {
            const prod = productMap[item.product];
            return {
                ...item,
                price: item.price ?? (prod ? prod.price : (!isNaN(Number(item.image)) ? Number(item.image) : 0)),
            };
        });
        const subtotal = enrichedItems.reduce((sum: number, it: any) => sum + (Number(it.price) || 0) * (Number(it.quantity) || 1), 0);
        const total = Number(order.total) > 0 ? Number(order.total) : subtotal + (Number(order.deliveryFee) || 0) + (Number(order.tax) || 0);
        return {
            ...order,
            items: enrichedItems,
            total,
            subtotal: Number(order.subtotal) > 0 ? Number(order.subtotal) : subtotal,
        };
    });

    res.json({
        orders: enrichedOrders,
        counts: {
            available: availableCount,
            active: activeCount,
            completed: completedCount
        }
    });
};

// Accept delivery of a packed order
export const acceptDelivery = async (req: Request, res: Response) => {
    const partnerId = req.partner!.id;
    const orderId = req.params.id as string;

    const partner = await prisma.deliveryPartner.findUnique({
        where: { id: partnerId }
    });

    if (!partner || !partner.isActive) {
        return res.status(400).json({ message: "You must be online to accept orders" });
    }

    const order = await prisma.order.findUnique({
        where: { id: orderId }
    });

    if (!order) {
        return res.status(404).json({ message: "Order not found" });
    }

    if (order.deliveryPartnerId) {
        return res.status(400).json({ message: "This order has already been accepted by another partner" });
    }

    if (order.status !== "Packed") {
        return res.status(400).json({ message: "Order is not ready for pickup yet (must be Packed first by store)" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const history = (Array.isArray(order.statusHistory) ? order.statusHistory : []) as any[];
    history.push({
        status: "Assigned",
        note: `Accepted by ${partner.name}`,
        timestamp: new Date()
    });

    const updatedOrder = await prisma.order.update({
        where: { id: orderId },
        data: {
            deliveryPartnerId: partner.id,
            deliveryOtp: otp,
            status: "Assigned",
            statusHistory: history
        }
    });

    res.json({ order: updatedOrder, message: "Order accepted successfully" });
};

//get single delivery detail

export const getDeliveryDetails = async (req: Request, res: Response) => {
    const order = await prisma.order.findFirst({
        where: { id: req.params.id as string, deliveryPartnerId: req.partner!.id },
        include: { user: { select: { name: true, email: true, phone: true } } },
    })
    if (!order) {
        return res.status(404).json({ message: "delivery not found" });
    }
    res.json({ order })
}

//complete delivery with otp

export const completeDelivery = async (req: Request, res: Response) => {
    const { otp } = req.body;
    const order = await prisma.order.findFirst({
        where: { id: req.params.id as string, deliveryPartnerId: req.partner!.id }
    })
    if (!order || order.status === "Cancelled" || order.status === "Delivered") {
        return res.status(400).json({ message: "Invalid Request" })
    }
    if (order.deliveryOtp !== otp && order.deliveryOtp?.slice(0, 6) !== otp) {
        return res.status(400).json({ message: "Invalid OTP" })
    }
    const history = order.statusHistory as any[];
    history.push({ status: "Delivered", note: "Delivered by partner", timestamp: new Date() })
    const updatedOrder = await prisma.order.update({
        where: { id: order.id },
        data: { status: "Delivered", statusHistory: history, deliveryOtp: "" }
    })
    res.json({ order: updatedOrder, message: "Delivery completed successfully" })
}

//Cancel delivery
export const cancelDelivery = async (_req: Request, res: Response) => {
    return res.status(400).json({ message: "Orders cannot be cancelled once accepted by a delivery partner" });
};

//update order status

export const upadteDeliveryStatus = async (req: Request, res: Response) => {
    const { status } = req.body;
    const allowedStatuses = ["Packed", "Out for Delivery", "Out for delivery", "Assigned"];
    if (!allowedStatuses.includes(status)) {
        return res.status(400).json({ message: "Invalid status update" });
    }
    const order = await prisma.order.findFirst({
        where: {
            id: req.params.id as string, deliveryPartnerId: req.partner!.id
        }
    })
    if (!order) {
        return res.status(404).json({ message: "Delivery not found" });
    }
    const history = order.statusHistory as any[];
    history.push({
        status, note: `Status updated to ${status}`, timestamp: new Date()
    })
    const updatedOrder = await prisma.order.update({
        where: { id: order.id },
        data: { status, statusHistory: history }
    })
    res.json({ order: updatedOrder, message: "Status updated successfully" });
}

//update live location

export const updateLocation = async (req: Request, res: Response) => {
    const { lat, lng } = req.body;
    const order = await prisma.order.findFirst({
        where: {
            id: req.params.id as string,
            deliveryPartnerId: req.partner!.id,
            status: { in: ["Assigned", "Packed", "Out for Delivery", "Out for delivery"] }

        }
    })
    await prisma.order.update({
        where: { id: order!.id },
        data: { liveLocation: { lat, lng, updatedAt: new Date() } }
    })
    res.json({ success: true })

}