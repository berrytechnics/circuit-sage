import express, { Request, Response } from "express";
import {
    NotFoundError,
} from "../config/errors";
import { TicketStatus } from "../config/types";
import { validateRequest } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validation.middleware";
import ticketService from "../services/ticket.service";
import customerService from "../services/customer.service";
import userService, { UserWithoutPassword } from "../services/user.service";
import { asyncHandler } from "../utils/asyncHandler";
import {
    createTicketValidation,
    updateTicketValidation,
} from "../validators/ticket.validator";

// Helper function to format user for response (same as in user.routes.ts)
function formatUserForResponse(user: UserWithoutPassword) {
  const userWithSnakeCase = user as unknown as {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    role: string;
  };
  
  return {
    id: userWithSnakeCase.id,
    firstName: userWithSnakeCase.first_name,
    lastName: userWithSnakeCase.last_name,
    email: userWithSnakeCase.email,
    role: userWithSnakeCase.role,
  };
}

const router = express.Router();

// All routes require authentication
router.use(validateRequest);

// GET /ticket - List all tickets (with optional filters)
router.get(
  "/",
  asyncHandler(async (req: Request, res: Response) => {
    const customerId = req.query.customerId as string | undefined;
    const status = req.query.status as TicketStatus | undefined;
    const tickets = await ticketService.findAll(
      customerId,
      status
    );

    // Populate customer and technician data for each ticket
    const ticketsWithRelations = await Promise.all(
      tickets.map(async (ticket) => {
        const customer = await customerService.findById(ticket.customerId);
        let technician = null;
        if (ticket.technicianId) {
          technician = await userService.findById(ticket.technicianId);
        }

        const formattedTechnician = technician ? formatUserForResponse(technician) : null;

        return {
          ...ticket,
          customer: customer
            ? {
                id: customer.id,
                firstName: customer.firstName,
                lastName: customer.lastName,
                email: customer.email,
                phone: customer.phone || undefined,
              }
            : null,
          technician: formattedTechnician
            ? {
                id: formattedTechnician.id,
                firstName: formattedTechnician.firstName,
                lastName: formattedTechnician.lastName,
                email: formattedTechnician.email,
              }
            : undefined,
        };
      })
    );

    res.json({ success: true, data: ticketsWithRelations });
  })
);

// GET /ticket/:id - Get ticket by ID
router.get(
  "/:id",
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const ticket = await ticketService.findById(id);
    if (!ticket) {
      throw new NotFoundError("Ticket not found");
    }

    // Populate customer and technician data
    const customer = await customerService.findById(ticket.customerId);
    let technician = null;
    if (ticket.technicianId) {
      technician = await userService.findById(ticket.technicianId);
    }

    // Format the response with customer and technician
    const formattedTechnician = technician ? formatUserForResponse(technician) : null;
    
    const response = {
      ...ticket,
      customer: customer
        ? {
            id: customer.id,
            firstName: customer.firstName,
            lastName: customer.lastName,
            email: customer.email,
            phone: customer.phone || undefined,
          }
        : null,
      technician: formattedTechnician
        ? {
            id: formattedTechnician.id,
            firstName: formattedTechnician.firstName,
            lastName: formattedTechnician.lastName,
            email: formattedTechnician.email,
          }
        : undefined,
    };

    res.json({ success: true, data: response });
  })
);

// POST /ticket - Create new ticket
router.post(
  "/",
  validate(createTicketValidation),
  asyncHandler(async (req: Request, res: Response) => {
    const ticket = await ticketService.create(req.body);
    res.status(201).json({ success: true, data: ticket });
  })
);

// PUT /ticket/:id - Update ticket
router.put(
  "/:id",
  validate(updateTicketValidation),
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const ticket = await ticketService.update(id, req.body);
    if (!ticket) {
      throw new NotFoundError("Ticket not found");
    }
    res.json({ success: true, data: ticket });
  })
);

// DELETE /ticket/:id - Delete ticket (soft delete)
router.delete(
  "/:id",
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const deleted = await ticketService.delete(id);
    if (!deleted) {
      throw new NotFoundError("Ticket not found");
    }
    res.json({
      success: true,
      data: { message: "Ticket deleted successfully" },
    });
  })
);

export default router;

