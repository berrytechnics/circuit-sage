import request from "supertest";
import app from "../../app";
import ticketService from "../../services/ticket.service";
import customerService from "../../services/customer.service";
import userService from "../../services/user.service";
import { verifyJWTToken } from "../../utils/auth";

// Mock the ticket service, customer service, user service, and auth
jest.mock("../../services/ticket.service");
jest.mock("../../services/customer.service");
jest.mock("../../services/user.service");
jest.mock("../../utils/auth");

const mockedTicketService = ticketService as jest.Mocked<
  typeof ticketService
>;
const mockedCustomerService = customerService as jest.Mocked<
  typeof customerService
>;
const mockedUserService = userService as jest.Mocked<
  typeof userService
>;
const mockedVerifyJWTToken = verifyJWTToken as jest.MockedFunction<
  typeof verifyJWTToken
>;

// Mock user for authentication
const mockUser = {
  id: "550e8400-e29b-41d4-a716-446655440000",
  firstName: "John",
  lastName: "Doe",
  email: "john@example.com",
  role: "technician" as const,
  active: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

// Test UUIDs
const CUSTOMER_ID_1 = "550e8400-e29b-41d4-a716-446655440001";
const CUSTOMER_ID_2 = "550e8400-e29b-41d4-a716-446655440002";
const TICKET_ID_1 = "550e8400-e29b-41d4-a716-446655440010";
const TICKET_ID_2 = "550e8400-e29b-41d4-a716-446655440011";
const TICKET_ID_NEW = "550e8400-e29b-41d4-a716-446655440012";
const TECHNICIAN_ID = "550e8400-e29b-41d4-a716-446655440000";

describe("Ticket Routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default: authenticate all requests
    mockedVerifyJWTToken.mockResolvedValue(mockUser);
    // Mock customer and user services to return null by default
    mockedCustomerService.findById.mockResolvedValue(null);
    mockedUserService.findById.mockResolvedValue(null);
  });

  describe("GET /api/tickets", () => {
    it("should return list of tickets", async () => {
      const mockTickets = [
        {
          id: TICKET_ID_1,
          ticketNumber: "TKT-12345678-001",
          customerId: CUSTOMER_ID_1,
          technicianId: TECHNICIAN_ID,
          status: "in_progress" as const,
          priority: "high" as const,
          deviceType: "Smartphone",
          deviceBrand: "Apple",
          deviceModel: "iPhone 13",
          serialNumber: "SN123456",
          issueDescription: "Screen cracked",
          diagnosticNotes: null,
          repairNotes: null,
          estimatedCompletionDate: null,
          completedDate: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: TICKET_ID_2,
          ticketNumber: "TKT-12345678-002",
          customerId: CUSTOMER_ID_2,
          technicianId: null,
          status: "new" as const,
          priority: "medium" as const,
          deviceType: "Laptop",
          deviceBrand: "Dell",
          deviceModel: "XPS 15",
          serialNumber: null,
          issueDescription: "Won't turn on",
          diagnosticNotes: null,
          repairNotes: null,
          estimatedCompletionDate: null,
          completedDate: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const mockCustomer1 = {
        id: CUSTOMER_ID_1,
        firstName: "Alice",
        lastName: "Johnson",
        email: "alice@example.com",
        phone: null,
        address: null,
        city: null,
        state: null,
        zipCode: null,
        notes: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockCustomer2 = {
        id: CUSTOMER_ID_2,
        firstName: "Bob",
        lastName: "Williams",
        email: "bob@example.com",
        phone: null,
        address: null,
        city: null,
        state: null,
        zipCode: null,
        notes: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockedTicketService.findAll.mockResolvedValue(mockTickets);
      mockedCustomerService.findById
        .mockResolvedValueOnce(mockCustomer1)
        .mockResolvedValueOnce(mockCustomer2);

      const response = await request(app)
        .get("/api/tickets")
        .set("Authorization", "Bearer valid-token");

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.data[0].ticketNumber).toBe("TKT-12345678-001");
      expect(mockedTicketService.findAll).toHaveBeenCalledWith(undefined, undefined);
    });

    it("should filter tickets by customerId", async () => {
      const mockTickets = [
        {
          id: "ticket-1",
          ticketNumber: "TKT-12345678-001",
          customerId: CUSTOMER_ID_1,
          technicianId: null,
          status: "new" as const,
          priority: "medium" as const,
          deviceType: "Smartphone",
          deviceBrand: null,
          deviceModel: null,
          serialNumber: null,
          issueDescription: "Screen cracked",
          diagnosticNotes: null,
          repairNotes: null,
          estimatedCompletionDate: null,
          completedDate: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const mockCustomer = {
        id: CUSTOMER_ID_1,
        firstName: "Alice",
        lastName: "Johnson",
        email: "alice@example.com",
        phone: null,
        address: null,
        city: null,
        state: null,
        zipCode: null,
        notes: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockedTicketService.findAll.mockResolvedValue(mockTickets);
      mockedCustomerService.findById.mockResolvedValue(mockCustomer);

      const response = await request(app)
        .get(`/api/tickets?customerId=${CUSTOMER_ID_1}`)
        .set("Authorization", "Bearer valid-token");

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(mockedTicketService.findAll).toHaveBeenCalledWith(CUSTOMER_ID_1, undefined);
    });

    it("should filter tickets by status", async () => {
      const mockTickets = [
        {
          id: "ticket-1",
          ticketNumber: "TKT-12345678-001",
          customerId: CUSTOMER_ID_1,
          technicianId: null,
          status: "completed" as const,
          priority: "medium" as const,
          deviceType: "Smartphone",
          deviceBrand: null,
          deviceModel: null,
          serialNumber: null,
          issueDescription: "Screen cracked",
          diagnosticNotes: null,
          repairNotes: null,
          estimatedCompletionDate: null,
          completedDate: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const mockCustomer = {
        id: CUSTOMER_ID_1,
        firstName: "Alice",
        lastName: "Johnson",
        email: "alice@example.com",
        phone: null,
        address: null,
        city: null,
        state: null,
        zipCode: null,
        notes: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockedTicketService.findAll.mockResolvedValue(mockTickets);
      mockedCustomerService.findById.mockResolvedValue(mockCustomer);

      const response = await request(app)
        .get("/api/tickets?status=completed")
        .set("Authorization", "Bearer valid-token");

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(mockedTicketService.findAll).toHaveBeenCalledWith(undefined, "completed");
    });

    it("should return 401 without authentication token", async () => {
      mockedVerifyJWTToken.mockResolvedValue(null);

      const response = await request(app).get("/api/tickets");

      expect(response.status).toBe(401);
      expect(response.body.message).toBe("Invalid token");
    });

    it("should return 403 with invalid token", async () => {
      mockedVerifyJWTToken.mockResolvedValue(null);

      const response = await request(app)
        .get("/api/tickets")
        .set("Authorization", "Bearer invalid-token");

      expect(response.status).toBe(403);
      expect(response.body.message).toBe("Unauthorized");
    });
  });

  describe("GET /api/tickets/:id", () => {
    it("should return ticket by ID", async () => {
      const mockTicket = {
        id: TICKET_ID_1,
        ticketNumber: "TKT-12345678-001",
        customerId: CUSTOMER_ID_1,
        technicianId: TECHNICIAN_ID,
        status: "in_progress" as const,
        priority: "high" as const,
        deviceType: "Smartphone",
        deviceBrand: "Apple",
        deviceModel: "iPhone 13",
        serialNumber: "SN123456",
        issueDescription: "Screen cracked",
        diagnosticNotes: "Needs screen replacement",
        repairNotes: null,
        estimatedCompletionDate: new Date("2024-12-31"),
        completedDate: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockedTicketService.findById.mockResolvedValue(mockTicket);

      const response = await request(app)
        .get(`/api/tickets/${TICKET_ID_1}`)
        .set("Authorization", "Bearer valid-token");

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(TICKET_ID_1);
      expect(response.body.data.ticketNumber).toBe("TKT-12345678-001");
      expect(mockedTicketService.findById).toHaveBeenCalledWith(TICKET_ID_1);
    });

    it("should return 404 when ticket not found", async () => {
      mockedTicketService.findById.mockResolvedValue(null);

      const response = await request(app)
        .get("/api/tickets/non-existent-id")
        .set("Authorization", "Bearer valid-token");

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toBe("Ticket not found");
    });
  });

  describe("POST /api/tickets", () => {
    it("should create a new ticket", async () => {
      const newTicketData = {
        customerId: CUSTOMER_ID_1,
        deviceType: "Smartphone",
        issueDescription: "Screen cracked",
        priority: "high" as const,
        deviceBrand: "Apple",
        deviceModel: "iPhone 13",
      };

      const mockCreatedTicket = {
        id: TICKET_ID_NEW,
        ticketNumber: "TKT-12345678-999",
        ...newTicketData,
        technicianId: null,
        status: "new" as const,
        serialNumber: null,
        diagnosticNotes: null,
        repairNotes: null,
        estimatedCompletionDate: null,
        completedDate: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockedTicketService.create.mockResolvedValue(mockCreatedTicket);

      const response = await request(app)
        .post("/api/tickets")
        .set("Authorization", "Bearer valid-token")
        .send(newTicketData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.deviceType).toBe("Smartphone");
      expect(mockedTicketService.create).toHaveBeenCalledWith(newTicketData);
    });

    it("should return 400 for missing required fields", async () => {
      const response = await request(app)
        .post("/api/tickets")
        .set("Authorization", "Bearer valid-token")
        .send({
          deviceType: "Smartphone",
          // missing customerId and issueDescription
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toBe("Validation failed");
    });

    it("should handle service errors when creating ticket", async () => {
      mockedTicketService.create.mockRejectedValue(
        new Error("Database error")
      );

      const response = await request(app)
        .post("/api/tickets")
        .set("Authorization", "Bearer valid-token")
        .send({
          customerId: CUSTOMER_ID_1,
          deviceType: "Smartphone",
          issueDescription: "Screen cracked",
        });

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toBe("Database error");
    });
  });

  describe("PUT /api/tickets/:id", () => {
    it("should update ticket successfully", async () => {
      const updateData = {
        status: "completed" as const,
        repairNotes: "Screen replaced successfully",
        completedDate: new Date().toISOString(),
      };

      const mockUpdatedTicket = {
        id: TICKET_ID_1,
        ticketNumber: "TKT-12345678-001",
        customerId: CUSTOMER_ID_1,
        technicianId: TECHNICIAN_ID,
        status: "completed" as const,
        priority: "high" as const,
        deviceType: "Smartphone",
        deviceBrand: "Apple",
        deviceModel: "iPhone 13",
        serialNumber: "SN123456",
        issueDescription: "Screen cracked",
        diagnosticNotes: null,
        repairNotes: "Screen replaced successfully",
        estimatedCompletionDate: null,
        completedDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockedTicketService.update.mockResolvedValue(mockUpdatedTicket);

      const response = await request(app)
        .put(`/api/tickets/${TICKET_ID_1}`)
        .set("Authorization", "Bearer valid-token")
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe("completed");
      expect(response.body.data.repairNotes).toBe("Screen replaced successfully");
      expect(mockedTicketService.update).toHaveBeenCalledWith(
        TICKET_ID_1,
        updateData
      );
    });

    it("should return 404 when ticket not found for update", async () => {
      mockedTicketService.update.mockResolvedValue(null);

      const response = await request(app)
        .put("/api/tickets/non-existent-id")
        .set("Authorization", "Bearer valid-token")
        .send({ status: "completed" });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toBe("Ticket not found");
    });
  });

  describe("DELETE /api/tickets/:id", () => {
    it("should delete ticket successfully", async () => {
      mockedTicketService.delete.mockResolvedValue(true);

      const response = await request(app)
        .delete(`/api/tickets/${TICKET_ID_1}`)
        .set("Authorization", "Bearer valid-token");

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.message).toBe("Ticket deleted successfully");
      expect(mockedTicketService.delete).toHaveBeenCalledWith(TICKET_ID_1);
    });

    it("should return 404 when ticket not found for deletion", async () => {
      mockedTicketService.delete.mockResolvedValue(false);

      const response = await request(app)
        .delete("/api/tickets/non-existent-id")
        .set("Authorization", "Bearer valid-token");

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toBe("Ticket not found");
    });
  });
});

