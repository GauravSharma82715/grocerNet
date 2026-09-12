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
        return res.status(401).json({ message: "Invalid email or password" });
    }
    if (!partner.isActive) {
        return res.status(403).json({ message: "your account has been deactivated" });
    }
    const isMatch = await bcrypt.compare(password, partner.password);
    if (!isMatch) {
        return res.status(401).json({ message: "Invalid email or password" });
    }
    const token = generateToken(partner.id)
    const { password: _, ...partnerData } = partner;
    res.json({ partner: partnerData, token })

}

//GET assigned deliveries
export const getMyDeliveries = async (req: Request, res: Response) => {
    const { status } = req.query;
    const where: any = { deliveryPartnerId: req.partner!.id }
    if (status === "active") {
        where.status = { in: ["Assigned", "Packed", "Out for Delivery", "Out for delivery"] }
    }
    else if (status === "completed") {
        where.status = { in: ["Delivered", "Cancelled"] }
    }
    const orders = await prisma.order.findMany({
        where,
        include: { user: { select: { name: true, email: true, phone: true } } },
        orderBy: { createdAt: "desc" }
    })

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

    res.json({ orders: enrichedOrders })

}

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
export const cancelDelivery = async (req: Request, res: Response) => {
    const { reason } = req.body;
    const order = await prisma.order.findFirst({
        where: { id: req.params.id as string, deliveryPartnerId: req.partner!.id }
    })
    if (!order) {
        return res.status(404).json({ message: "Delivery not found" });
    }
    if (order.status === "Delivered") {
        return res.status(400).json({ message: "Cannot cancel a delivered order" });
    }
    const history = order.statusHistory as any[];
    history.push({
        status: "Cancelled", note: reason || "", timestamp: new Date()
    })
    const updatedOrder = await prisma.order.update({
        where: { id: order.id },
        data: { status: "Cancelled", statusHistory: history }
    })

    res.json({ order: updatedOrder, message: "Delivery cancelled" })
}

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