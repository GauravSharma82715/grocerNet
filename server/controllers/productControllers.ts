import { Request, Response } from "express";
import { prisma } from "../config/prisma.js";

//Get /api/products/flash-deals
export const getFlashDeals = async (req: Request, res: Response) => {
    const products = await prisma.product.findMany({
        where: { stock: { gt: 0 } },
        orderBy: { originalPrice: "desc" }
    })
    const productsWithDiscount = products.map((p: any) => {
        const discount = p.originalPrice && p.price ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100) : 0;
        return { ...p, id: p.id, discount };
    });
    res.json({ products: productsWithDiscount.slice(0, 8) });

}
//get/api/products
export const getProducts = async (req: Request, res: Response) => {
    const { category, search, minPrice, maxPrice, sort, organic, page, limit } = req.query;
    const where: any = {};
    if (category && category !== "all") where.category = category as string;
    if (organic && organic !== "all") where.isOrganic = organic === "true";

    if (search) where.name = { contains: search as string, mode: "insensitive" };
    if (minPrice || maxPrice) {
        where.price = {};
        if (minPrice) where.price.gte = Number(minPrice);
        if (maxPrice) where.price.lte = Number(maxPrice);
    }
    const orderBy: any = {};
    if (sort === "price-low") orderBy.price = "asc";
    else if (sort === "price-high") orderBy.price = "desc";
    else if (sort === "rating") orderBy.rating = "desc";
    else orderBy.createdAt = "desc";

    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 12;
    const skip = (pageNum - 1) * limitNum;

    const [totalCount, products] = await Promise.all([
        prisma.product.count({ where }),
        prisma.product.findMany({
            where,
            orderBy,
            skip,
            take: limitNum,
        }),
    ]);

    const productsWithDiscount = products.map((p: any) => {
        const discount = p.originalPrice && p.price ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100) : 0;
        return { ...p, _id: p.id, id: p.id, discount };
    });

    const totalPages = Math.ceil(totalCount / limitNum) || 1;

    res.json({
        products: productsWithDiscount,
        totalPages,
        totalCount,
        currentPage: pageNum,
    });
};


//get/api/products/:id
export const getProduct = async (req: Request, res: Response) => {
    const product = await prisma.product.findUnique({ where: { id: req.params.id as string } });
    if (!product) {
        res.status(404).json({ message: "product not found" })
        return;
    }
    const discount = product.originalPrice && product.price ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;
    res.json({ product: { ...product, id: product.id, discount } })

}


//post /api/products
export const createProduct = async (req: Request, res: Response) => {
    const product = await prisma.product.create({ data: req.body })
    res.status(201).json({ product })
}

//put /apiproduct/:id
export const updateProduct = async (req: Request, res: Response) => {
    const product = await prisma.product.update({ where: { id: req.params.id as string }, data: req.body })
    res.status(200).json({ product })
}

//delete /api/products/:id
export const deleteProduct = async (req: Request, res: Response) => {
    const product = await prisma.product.delete({ where: { id: req.params.id as string } })
    res.json({ message: "product deleted successfully" })
}