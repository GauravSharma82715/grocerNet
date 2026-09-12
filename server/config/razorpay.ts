import Razorpay from "razorpay";
import dotenv from "dotenv";
dotenv.config();

export const getRazorpayInstance = () => {
    dotenv.config();
    const key_id = (process.env.RAZORPAY_KEY_ID || "").trim();
    const key_secret = (process.env.RAZORPAY_KEY_SECRET || "").trim();
    return new Razorpay({
        key_id,
        key_secret,
    });
};
