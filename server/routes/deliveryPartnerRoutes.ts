import express from "express";
import {
    acceptDelivery,
    cancelDelivery,
    completeDelivery,
    getDeliveryDetails,
    getMyDeliveries,
    getPartnerProfile,
    loginPartner,
    logoutPartner,
    toggleOnlineStatus,
    upadteDeliveryStatus,
    updateLocation
} from "../controllers/deliveryPartnerController.js";
import deliveryAuth from "../middleware/deliveryAuth.js";
const deliveryPartnerRouter = express.Router();

deliveryPartnerRouter.post('/login', loginPartner);
deliveryPartnerRouter.post('/logout', deliveryAuth, logoutPartner);
deliveryPartnerRouter.get('/profile', deliveryAuth, getPartnerProfile);
deliveryPartnerRouter.put('/toggle-status', deliveryAuth, toggleOnlineStatus);
deliveryPartnerRouter.get('/my-deliveries', deliveryAuth, getMyDeliveries);
deliveryPartnerRouter.get('/my-deliveries/:id', deliveryAuth, getDeliveryDetails);
deliveryPartnerRouter.post('/my-deliveries/:id/accept', deliveryAuth, acceptDelivery);
deliveryPartnerRouter.put('/my-deliveries/:id/accept', deliveryAuth, acceptDelivery);
deliveryPartnerRouter.put('/my-deliveries/:id/complete', deliveryAuth, completeDelivery);
deliveryPartnerRouter.put('/my-deliveries/:id/cancel', deliveryAuth, cancelDelivery);
deliveryPartnerRouter.put('/my-deliveries/:id/status', deliveryAuth, upadteDeliveryStatus);
deliveryPartnerRouter.put('/my-deliveries/:id/location', deliveryAuth, updateLocation);

export default deliveryPartnerRouter
