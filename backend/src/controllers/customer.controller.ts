import { NextFunction, Request, Response } from "express";
import { Op } from "sequelize";
import { Customer, Ticket } from "../models";
import { BadRequestError, NotFoundError } from "../types/errors";

/**
 * Get all customers
 */
export const getCustomers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Initialize the where object for filtering
    const where: Record<string, unknown> = {};

    // Filter by name if provided
    if (req.query.name) {
      const searchName = req.query.name as string;
      Object.assign(where, {
        [Op.or]: [
          { firstName: { [Op.iLike]: `%${searchName}%` } },
          { lastName: { [Op.iLike]: `%${searchName}%` } },
        ],
      });
    }

    // Filter by email if provided
    if (req.query.email) {
      where.email = { [Op.iLike]: `%${req.query.email}%` };
    }

    // Filter by phone if provided
    if (req.query.phone) {
      where.phone = { [Op.iLike]: `%${req.query.phone}%` };
    }

    const customers = await Customer.findAll({
      where,
      order: [
        ["lastName", "ASC"],
        ["firstName", "ASC"],
      ],
    });

    res.status(200).json({
      success: true,
      data: customers,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get customer by ID
 */
export const getCustomerById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const customer = await Customer.findByPk(id, {
      include: [
        {
          model: Ticket,
          as: "tickets",
          attributes: ["id", "deviceType", "status", "priority", "createdAt"],
        },
      ],
    });

    if (!customer) {
      throw new NotFoundError(`Customer with ID ${id} not found`);
    }

    res.status(200).json({
      success: true,
      data: customer,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create new customer
 */
export const createCustomer = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      address,
      city,
      state,
      zipCode,
      notes,
    } = req.body;

    // Check if customer with this email already exists
    const existingCustomer = await Customer.findOne({ where: { email } });
    if (existingCustomer) {
      throw new BadRequestError(`Customer with email ${email} already exists`);
    }

    // Create customer
    const customer = await Customer.create({
      firstName,
      lastName,
      email,
      phone,
      address,
      city,
      state,
      zipCode,
      notes,
    });

    res.status(201).json({
      success: true,
      data: customer,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update customer
 */
export const updateCustomer = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const {
      firstName,
      lastName,
      email,
      phone,
      address,
      city,
      state,
      zipCode,
      notes,
    } = req.body;

    // Find customer
    const customer = await Customer.findByPk(id);
    if (!customer) {
      throw new NotFoundError(`Customer with ID ${id} not found`);
    }

    // Check if trying to update to an email that already exists
    if (email && email !== customer.email) {
      const existingCustomer = await Customer.findOne({ where: { email } });
      if (existingCustomer && existingCustomer.id !== id) {
        throw new BadRequestError(
          `Another customer with email ${email} already exists`
        );
      }
    }

    // Update customer
    await customer.update({
      firstName: firstName || customer.firstName,
      lastName: lastName || customer.lastName,
      email: email || customer.email,
      phone: phone !== undefined ? phone : customer.phone,
      address: address !== undefined ? address : customer.address,
      city: city !== undefined ? city : customer.city,
      state: state !== undefined ? state : customer.state,
      zipCode: zipCode !== undefined ? zipCode : customer.zipCode,
      notes: notes !== undefined ? notes : customer.notes,
    });

    res.status(200).json({
      success: true,
      data: customer,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete customer (soft delete)
 */
export const deleteCustomer = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    // Find customer
    const customer = await Customer.findByPk(id);
    if (!customer) {
      throw new NotFoundError(`Customer with ID ${id} not found`);
    }

    // Check if customer has associated tickets
    if (customer.tickets?.length ?? 0 > 0) {
      throw new BadRequestError(
        `Cannot delete customer with ${customer.tickets?.length} associated tickets. Please delete or reassign tickets first.`
      );
    }

    // Soft delete (assuming Sequelize is configured for paranoid deletion)
    await customer.destroy();

    res.status(200).json({
      success: true,
      message: `Customer with ID ${id} has been deleted`,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get customer tickets
 */
export const getCustomerTickets = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    // Check if customer exists
    const customer = await Customer.findByPk(id);
    if (!customer) {
      throw new NotFoundError(`Customer with ID ${id} not found`);
    }

    // Get all tickets for this customer
    const tickets = await Ticket.findAll({
      where: { customerId: id },
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({
      success: true,
      data: tickets,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Search customers
 */
export const searchCustomers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { query } = req.query;

    if (!query || typeof query !== "string") {
      throw new BadRequestError("Search query is required");
    }

    const customers = await Customer.findAll({
      where: {
        [Op.or]: [
          { firstName: { [Op.iLike]: `%${query}%` } },
          { lastName: { [Op.iLike]: `%${query}%` } },
          { email: { [Op.iLike]: `%${query}%` } },
          { phone: { [Op.iLike]: `%${query}%` } },
        ],
      },
      limit: 10,
      order: [
        ["lastName", "ASC"],
        ["firstName", "ASC"],
      ],
    });

    res.status(200).json({
      success: true,
      data: customers,
    });
  } catch (error) {
    next(error);
  }
};
