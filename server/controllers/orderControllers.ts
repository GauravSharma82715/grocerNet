import { Request, Response } from "express";
import { prisma } from "../config/prisma.js";
import { inngest } from "../inngest/index.js";
import crypto from "crypto";
import { getRazorpayInstance } from "../config/razorpay.js";

export const createOrder = async (req: Request, res: Response) => {
    try {
        const { items, shippingAddress, paymentMethod } = req.body;

        if (!items || items.length === 0) {
            return res.status(400).json({ message: "No order items" });
        }

        const productIds = items.map((i: any) => i.product);
        const products = await prisma.product.findMany({ where: { id: { in: productIds } } });
        const productMap: Record<string, (typeof products)[0]> = {};
        products.forEach((p: any) => { productMap[p.id] = p; });

        // check product is in stock or not
        for (const item of items) {
            const product = productMap[item.product];
            if (!product || (product.stock ?? 0) < item.quantity) {
                return res.status(404).json({ message: `Product "${product ? product.name : item.product}" is out of stock` });
            }
        }

        const orderItems = items.map((item: any) => {
            const dbProduct = productMap[item.product];
            if (!dbProduct) throw new Error(`Product ${item.product} not found`);
            return {
                product: dbProduct.id,
                name: dbProduct.name,
                price: dbProduct.price,
                image: dbProduct.image,
                quantity: item.quantity,
                unit: dbProduct.unit,
            };
        });

        const subtotal = orderItems.reduce((sum: number, item: any) =>
            sum + item.price * item.quantity, 0
        );
        const deliveryFee = subtotal > 20 ? 0 : 1.99;
        const tax = Math.round(subtotal * 0.08 * 100) / 100;
        const total = Math.round((subtotal + deliveryFee + tax) * 100) / 100;

        const order = await prisma.order.create({
            data: {
                userId: req.user!.id,
                items: orderItems,
                shippingAddress: shippingAddress,
                paymentMethod: paymentMethod,
                subtotal: subtotal,
                deliveryFee: deliveryFee,
                tax: tax,
                total: total,
                isPaid: false,
                statusHistory: [{ status: "Placed", note: "Order placed successfully", timestamp: new Date().toISOString() }]
            }
        });

        if (paymentMethod === "card" || paymentMethod === "razorpay") {
            const keyId = (process.env.RAZORPAY_KEY_ID || "").trim();
            const keySecret = (process.env.RAZORPAY_KEY_SECRET || "").trim();

            if (!keyId || !keySecret) {
                return res.status(500).json({ message: "Razorpay credentials are not configured in server .env" });
            }

            const razorpay = getRazorpayInstance();
            const options = {
                amount: Math.round(total * 100), // amount in paise
                currency: "INR",
                receipt: `rcpt_${order.id.replace(/-/g, '').slice(0, 30)}`,
            };

            const razorpayOrder = await razorpay.orders.create(options);

            return res.json({
                order,
                razorpayOrder,
                keyId
            });
        }

        // For Cash on Delivery:
        // decrease stock
        for (const item of orderItems) {
            await prisma.product.update({
                where: { id: item.product },
                data: { stock: { decrement: item.quantity } },
            });
        }

        // send stock update event for each product in the order
        for (const item of orderItems) {
            await inngest.send({
                name: "inventoiry.stock.updated",
                data: { productId: item.product }
            });
        }
        await inngest.send({ name: "order/placed", data: { orderId: order.id } });

        return res.json({ order });
    } catch (error: any) {
        console.error("Create order error:", error);
        return res.status(500).json({ message: error.message || "Failed to create order" });
    }
};

// Verify Razorpay Payment
export const verifyRazorpayPayment = async (req: Request, res: Response) => {
    try {
        const { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        if (!orderId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({ message: "Missing required payment verification fields" });
        }

        const secret = process.env.RAZORPAY_KEY_SECRET;
        if (!secret) {
            return res.status(500).json({ message: "Razorpay secret key not configured" });
        }

        const hmac = crypto.createHmac("sha256", secret);
        hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
        const generatedSignature = hmac.digest("hex");

        if (generatedSignature !== razorpay_signature) {
            return res.status(400).json({ success: false, message: "Invalid payment signature" });
        }

        const order = await prisma.order.findUnique({
            where: { id: orderId }
        });

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        if (order.userId !== req.user!.id) {
            return res.status(403).json({ message: "Unauthorized order access" });
        }

        if (order.isPaid) {
            return res.json({ success: true, message: "Order already marked as paid", order });
        }

        const history = (Array.isArray(order.statusHistory) ? order.statusHistory : []) as any[];
        history.push({
            status: "Paid",
            note: `Payment verified successfully via Razorpay (Payment ID: ${razorpay_payment_id})`,
            timestamp: new Date()
        });

        const updatedOrder = await prisma.order.update({
            where: { id: orderId },
            data: {
                isPaid: true,
                statusHistory: history
            }
        });

        // Decrease stock now that payment is confirmed
        const orderItems = (Array.isArray(order.items) ? order.items : []) as any[];
        for (const item of orderItems) {
            if (item.product) {
                await prisma.product.update({
                    where: { id: item.product },
                    data: { stock: { decrement: item.quantity || 1 } }
                });

                await inngest.send({
                    name: "inventoiry.stock.updated",
                    data: { productId: item.product }
                });
            }
        }

        await inngest.send({ name: "order/placed", data: { orderId: updatedOrder.id } });

        return res.json({ success: true, message: "Payment verified successfully", order: updatedOrder });
    } catch (error: any) {
        console.error("Razorpay verification error:", error);
        return res.status(500).json({ message: error.message || "Payment verification failed" });
    }
};

//get user's order
export const getUserOrder = async (req: Request, res: Response) => {
    const { status } = req.query
    const where: any = {
        userId: req.user!.id,
        OR: [
            { isPaid: true },
            { paymentMethod: "cash" }
        ]
    }
    if (status && status != "all") {
        where.status = status;
    }
    const orders = await prisma.order.findMany({
        where,
        include: { deliveryPartner: { select: { name: true, phone: true } } },
        orderBy: { createdAt: "desc" }
    })

    const productIds: string[] = [];
    orders.forEach((order) => {
        if (Array.isArray(order.items)) {
            order.items.forEach((item: any) => {
                if (item.product) productIds.push(item.product);
            });
        }
    });

    const products = productIds.length > 0
        ? await prisma.product.findMany({ where: { id: { in: productIds } } })
        : [];
    const productMap: Record<string, typeof products[0]> = {};
    products.forEach((p) => { productMap[p.id] = p; });

    const enrichedOrders = orders.map((order) => {
        if (!Array.isArray(order.items)) return order;
        const enrichedItems = order.items.map((item: any) => {
            const prod = productMap[item.product];
            const isInvalidImg =
                !item.image ||
                typeof item.image === "number" ||
                (!isNaN(Number(item.image)) && typeof item.image === "string" && !item.image.includes("/"));
            return {
                ...item,
                image: isInvalidImg && prod ? prod.image : item.image,
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
//get single order
export const getOrder = async (req: Request, res: Response) => {
    const order = await prisma.order.findFirst({
        where: { id: req.params.id as string, userId: req.user!.id },
        include: { deliveryPartner: { select: { name: true, phone: true, avatar: true, vehicleType: true } } }
    })
    if (!order) {
        return res.status(404).json({ message: "Order not found" })
    }

    if (Array.isArray(order.items)) {
        const productIds = order.items.map((item: any) => item.product).filter(Boolean);
        const products = productIds.length > 0
            ? await prisma.product.findMany({ where: { id: { in: productIds } } })
            : [];
        const productMap: Record<string, typeof products[0]> = {};
        products.forEach((p) => { productMap[p.id] = p; });

        const enrichedItems = order.items.map((item: any) => {
            const prod = productMap[item.product];
            const isInvalidImg =
                !item.image ||
                typeof item.image === "number" ||
                (!isNaN(Number(item.image)) && typeof item.image === "string" && !item.image.includes("/"));
            return {
                ...item,
                image: isInvalidImg && prod ? prod.image : item.image,
                price: item.price ?? (prod ? prod.price : (!isNaN(Number(item.image)) ? Number(item.image) : 0)),
            };
        });
        const subtotal = enrichedItems.reduce((sum: number, it: any) => sum + (Number(it.price) || 0) * (Number(it.quantity) || 1), 0);
        const total = Number(order.total) > 0 ? Number(order.total) : subtotal + (Number(order.deliveryFee) || 0) + (Number(order.tax) || 0);
        return res.json({ order: { ...order, items: enrichedItems, total, subtotal: Number(order.subtotal) > 0 ? Number(order.subtotal) : subtotal } });
    }

    res.json({ order })
}
//update the order status
export const updateOrderStatus = async (req: Request, res: Response) => {
    const { status, note } = req.body;
    const order = await prisma.order.findUnique({ where: { id: req.params.id as string } })
    if (!order) {
        return res.status(404).json({ message: "Order not found" });
    }
    const history = (Array.isArray(order.statusHistory) ? order.statusHistory : []) as any[];
    history.push({ status, note: note || `Order ${status.toLowerCase()}`, timeStamp: new Date() })

    const updatedOrder = await prisma.order.update({
        where: { id: req.params.id as string },
        data: { status, statusHistory: history }
    })

    res.json({ order: updatedOrder })


}

export const getAllOrders = async (req: Request, res: Response) => {
    const { status } = req.query;

    const where: any = {
        OR: [
            { isPaid: true },
            { paymentMethod: "cash" }
        ]
    };
    if (status && status !== "all") {
        where.status = status;
    }

    const orders = await prisma.order.findMany({
        where,
        include: {
            user: { select: { id: true, name: true, email: true, phone: true } },
            deliveryPartner: { select: { id: true, name: true, phone: true, email: true, vehicleType: true, avatar: true } }
        },
        orderBy: { createdAt: "desc" }
    })

    const productIds: string[] = [];
    orders.forEach((order) => {
        if (Array.isArray(order.items)) {
            order.items.forEach((item: any) => {
                if (item.product) productIds.push(item.product);
            });
        }
    });

    const products = productIds.length > 0
        ? await prisma.product.findMany({ where: { id: { in: productIds } } })
        : [];
    const productMap: Record<string, typeof products[0]> = {};
    products.forEach((p) => { productMap[p.id] = p; });

    const enrichedOrders = orders.map((order) => {
        if (!Array.isArray(order.items)) return order;
        const enrichedItems = order.items.map((item: any) => {
            const prod = productMap[item.product];
            const isInvalidImg =
                !item.image ||
                typeof item.image === "number" ||
                (!isNaN(Number(item.image)) && typeof item.image === "string" && !item.image.includes("/"));
            return {
                ...item,
                image: isInvalidImg && prod ? prod.image : item.image,
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

//get order location
export const getOrderLocation = async (req: Request, res: Response) => {
    const order = await prisma.order.findFirst(

        {
            where: { id: req.params.id as string, userId: req.user!.id },
            select: { liveLocation: true, status: true }
        }
    )
    if (!order) return res.status(400).json({ message: "Order not found" });
    res.json({ liveLocation: order.liveLocation, status: order.status })
}