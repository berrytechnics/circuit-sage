import express, { Request, Response } from "express";
import { NotFoundError } from "../config/errors";
import { InventoryTransferStatus } from "../config/types";
import { validateRequest } from "../middlewares/auth.middleware";
import { requireLocationContext } from "../middlewares/location.middleware";
import { requireManagerOrAdmin } from "../middlewares/rbac.middleware";
import { requireTenantContext } from "../middlewares/tenant.middleware";
import { validate } from "../middlewares/validation.middleware";
import inventoryTransferService from "../services/inventory-transfer.service";
import { UserWithoutPassword } from "../services/user.service";
import { asyncHandler } from "../utils/asyncHandler";
import {
  createTransferValidation,
} from "../validators/inventory-transfer.validator";

const router = express.Router();

// All routes require authentication and tenant context
router.use(validateRequest);
router.use(requireTenantContext);

// GET /api/inventory-transfers - List all inventory transfers (with optional filters)
router.get(
  "/",
  asyncHandler(async (req: Request, res: Response) => {
    const companyId = req.companyId!;
    const status = req.query.status as InventoryTransferStatus | undefined;
    const fromLocation = req.query.fromLocation as string | undefined;
    const toLocation = req.query.toLocation as string | undefined;
    const transfers = await inventoryTransferService.findAll(
      companyId,
      status,
      fromLocation,
      toLocation
    );
    res.json({ success: true, data: transfers });
  })
);

// GET /api/inventory-transfers/:id - Get inventory transfer details
router.get(
  "/:id",
  asyncHandler(async (req: Request, res: Response) => {
    const companyId = req.companyId!;
    const { id } = req.params;
    const transfer = await inventoryTransferService.findById(id, companyId);
    if (!transfer) {
      throw new NotFoundError("Inventory transfer not found");
    }
    res.json({ success: true, data: transfer });
  })
);

// POST /api/inventory-transfers - Create inventory transfer (manager/admin only)
router.post(
  "/",
  requireLocationContext,
  validate(createTransferValidation),
  requireManagerOrAdmin(),
  asyncHandler(async (req: Request, res: Response) => {
    const companyId = req.companyId!;
    const user = req.user as UserWithoutPassword;
    const transfer = await inventoryTransferService.create(
      req.body,
      companyId,
      user.id
    );
    res.status(201).json({ success: true, data: transfer });
  })
);

// POST /api/inventory-transfers/:id/complete - Complete inventory transfer (manager/admin only)
router.post(
  "/:id/complete",
  requireManagerOrAdmin(),
  asyncHandler(async (req: Request, res: Response) => {
    const companyId = req.companyId!;
    const { id } = req.params;
    const transfer = await inventoryTransferService.complete(id, companyId);
    res.json({ success: true, data: transfer });
  })
);

// POST /api/inventory-transfers/:id/cancel - Cancel inventory transfer (manager/admin only)
router.post(
  "/:id/cancel",
  requireManagerOrAdmin(),
  asyncHandler(async (req: Request, res: Response) => {
    const companyId = req.companyId!;
    const { id } = req.params;
    const transfer = await inventoryTransferService.cancel(id, companyId);
    res.json({ success: true, data: transfer });
  })
);

export default router;

