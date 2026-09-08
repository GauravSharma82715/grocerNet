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
        where.status = { in: ["Assigned", "Packed", "Out for delivery"] }
    }
    else if (status === "completed") {
        where.status = { in: ["Delivered", "Cancelled"] }
    }
    const orders = await prisma.order.findMany({
        where,
        include: { user: { select: { name: true, email: true, phone: true } } },
        orderBy: { createdAt: "desc" }
    })
    res.json({ orders })

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
    if (order.deliveryOtp != otp) {
        return res.status(500).json({ message: "Invalid OTP" })
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
    if (order!.status === "Deliverd") {
        return res.status(400).json({ message: "Cnnot cancel a delivered order" });
    }
    const history = order!.statusHistory as any[];
    history.push({
        status: "Cancelled", note: reason || "", timestamp: new Date()
    })
    const updatedOrder = await prisma.order.update({
        where: { id: order!.id },
        data: { status: "Cancelled", statusHistory: history }
    })

    res.json({ order: updatedOrder, message: "Delivery cancelled" })
}

//update order status

export const upadteDeliveryStatus = async (req: Request, res: Response) => {
    const { status } = req.body;
    const allowedStatues = ["Pacekd", "Out for Delivery"];
    if (!allowedStatues.includes(status)) {
        return res.status(400).json({ message: "Invalid status update" });
    }
    const order = await prisma.order.findFirst({
        where: {
            id: req.params.id as string, deliveryPartnerId: req.partner!.id
        }
    })
    const history = order!.statusHistory as any[];
    history.push({
        status, note: `Status updated to ${status}`, timestamp: new Date()
    })
    const updatedOrder = await prisma.order.update({
        where: { id: order!.id },
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
            status: { in: ["Assigned", "Packed", "Out for Delivery"] }

        }
    })
    await prisma.order.update({
        where: { id: order!.id },
        data: { liveLocation: { lat, lng, updatedAt: new Date() } }
    })
    res.json({ success: true })

}