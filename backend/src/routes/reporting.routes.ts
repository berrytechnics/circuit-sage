import express, { Request, Response } from "express";
import { validateRequest } from "../middlewares/auth.middleware.js";
import { requireLocationContext } from "../middlewares/location.middleware.js";
import { requireRole } from "../middlewares/rbac.middleware.js";
import { requireTenantContext } from "../middlewares/tenant.middleware.js";
import { validate } from "../middlewares/validation.middleware.js";
import reportingService from "../services/reporting.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  dashboardStatsValidation,
  revenueOverTimeValidation,
} from "../validators/reporting.validator.js";

const router = express.Router();

// All routes require authentication and tenant context
router.use(validateRequest);
router.use(requireTenantContext);

// GET /reporting/dashboard-stats - Get dashboard summary statistics
router.get(
  "/dashboard-stats",
  requireLocationContext,
  validate(dashboardStatsValidation),
  requireRole(["admin", "manager", "technician"]),
  asyncHandler(async (req: Request, res: Response) => {
    const companyId = req.companyId!;
    const locationId = req.locationId!;
    const startDate = req.query.startDate as string | undefined;
    const endDate = req.query.endDate as string | undefined;

    const stats = await reportingService.getDashboardStats(
      companyId,
      locationId,
      startDate,
      endDate
    );

    res.json({ success: true, data: stats });
  })
);

// GET /reporting/revenue-over-time - Get revenue chart data
router.get(
  "/revenue-over-time",
  requireLocationContext,
  validate(revenueOverTimeValidation),
  requireRole(["admin", "manager"]),
  asyncHandler(async (req: Request, res: Response) => {
    const companyId = req.companyId!;
    const locationId = req.locationId!;
    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;
    const groupBy = (req.query.groupBy as "day" | "week" | "month") || "day";

    const revenueData = await reportingService.getRevenueOverTime(
      companyId,
      startDate,
      endDate,
      groupBy,
      locationId
    );

    res.json({ success: true, data: revenueData });
  })
);

export default router;

