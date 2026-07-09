import { Router } from "express";

import {
  createCheckoutSession,
  listAdminPayments,
  listMyPayments,
  listProducts
} from "../controllers/paymentController.js";
import { requireAdmin, requireAuth } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/products", listProducts);
router.post("/checkout-session", requireAuth, createCheckoutSession);
router.get("/mine", requireAuth, listMyPayments);
router.get("/admin", requireAuth, requireAdmin, listAdminPayments);

export default router;
