import express from "express"
import auth from "../middleware/auth.js"
import multer from "multer"
import cloudinary from "../config/cloudinary.js";

const uploadRouter = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage })
uploadRouter.post('/', auth, upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No image provided" });

        }
        const b64 = Buffer.from(req.file.buffer).toString("base64");
        const dataURI = `data:${req.file.mimetype};base64,${b64}`;
        try {
            const result = await cloudinary.uploader.upload(dataURI, {
                folder: "grocer-del",
            });
            return res.json({ url: result.secure_url });
        } catch (cloudErr: any) {
            console.warn("Cloudinary upload failed, falling back to data URI:", cloudErr?.message);
            return res.json({ url: dataURI });
        }
    }
    catch (error: any) {
        res.status(500).json({ message: error.message })
    }
})
export default uploadRouter;
