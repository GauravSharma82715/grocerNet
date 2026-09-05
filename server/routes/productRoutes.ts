import express from "express";
import {
    createProduct,
    deleteProduct,
    getFlashDeals,
    getProduct,
    getProducts,
    updateProduct,
} from "../controllers/productControllers.js";
import auth from "../middleware/auth.js";
import admin from "../middleware/admin.js";

const productRouter = express.Router();

// Public routes
productRouter.get("/flash-deals", getFlashDeals);
productRouter.get("/", getProducts);
productRouter.get("/:id", getProduct);

// Protected admin routes
productRouter.post("/", auth, admin, createProduct);
productRouter.put("/:id", auth, admin, updateProduct);
productRouter.delete("/:id", auth, admin, deleteProduct);

export default productRouter;
