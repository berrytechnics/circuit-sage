// src/services/reporting.service.ts
import { sql } from "kysely";
import { db } from "../config/connection.js";

export interface DashboardStats {
  monthlyRevenue: number;
  lowStockCount: number;
  activeTickets: number;
  totalCustomers: number;
}

export interface RevenueDataPoint {
  date: string;
  revenue: number;
}

export type GroupByPeriod = "day" | "week" | "month";

export class ReportingService {
  /**
   * Get dashboard summary statistics
   */
  async getDashboardStats(
    companyId: string,
    locationId?: string | null,
    startDate?: string,
    endDate?: string
  ): Promise<DashboardStats> {
    // Calculate monthly revenue (current month by default)
    const now = new Date();
    const monthStart = startDate
      ? new Date(startDate)
      : new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = endDate
      ? new Date(endDate)
      : new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    let revenueQuery = db
      .selectFrom("invoices")
      .select((eb) => eb.fn.sum<number>("total_amount").as("total"))
      .where("company_id", "=", companyId)
      .where("status", "=", "paid")
      .where("paid_date", "is not", null)
      .where("paid_date", ">=", monthStart)
      .where("paid_date", "<=", monthEnd)
      .where("deleted_at", "is", null);

    if (locationId !== undefined) {
      if (locationId === null) {
        revenueQuery = revenueQuery.where("location_id", "is", null);
      } else {
        revenueQuery = revenueQuery.where("location_id", "=", locationId);
      }
    }

    const revenueResult = await revenueQuery.executeTakeFirst();
    const monthlyRevenue = Number(revenueResult?.total || 0);

    // Count low stock items
    let lowStockQuery = db
      .selectFrom("inventory_items")
      .select((eb) => eb.fn.count<number>("id").as("count"))
      .where("company_id", "=", companyId)
      .where((eb) => eb("quantity", "<", eb.ref("reorder_level")))
      .where("deleted_at", "is", null);

    if (locationId !== undefined) {
      if (locationId === null) {
        lowStockQuery = lowStockQuery.where("location_id", "is", null);
      } else {
        lowStockQuery = lowStockQuery.where("location_id", "=", locationId);
      }
    }

    const lowStockResult = await lowStockQuery.executeTakeFirst();
    const lowStockCount = Number(lowStockResult?.count || 0);

    // Count active tickets (not completed or cancelled)
    let ticketsQuery = db
      .selectFrom("tickets")
      .select((eb) => eb.fn.count<number>("id").as("count"))
      .where("company_id", "=", companyId)
      .where("status", "not in", ["completed", "cancelled"])
      .where("deleted_at", "is", null);

    if (locationId !== undefined) {
      if (locationId === null) {
        ticketsQuery = ticketsQuery.where("location_id", "is", null);
      } else {
        ticketsQuery = ticketsQuery.where("location_id", "=", locationId);
      }
    }

    const ticketsResult = await ticketsQuery.executeTakeFirst();
    const activeTickets = Number(ticketsResult?.count || 0);

    // Count total customers (customers are shared across locations, so no location filter)
    const customersResult = await db
      .selectFrom("customers")
      .select((eb) => eb.fn.count<number>("id").as("count"))
      .where("company_id", "=", companyId)
      .where("deleted_at", "is", null)
      .executeTakeFirst();

    const totalCustomers = Number(customersResult?.count || 0);

    return {
      monthlyRevenue,
      lowStockCount,
      activeTickets,
      totalCustomers,
    };
  }

  /**
   * Get revenue over time grouped by period
   */
  async getRevenueOverTime(
    companyId: string,
    startDate: string,
    endDate: string,
    groupBy: GroupByPeriod = "day",
    locationId?: string | null
  ): Promise<RevenueDataPoint[]> {
    // Determine the date truncation interval based on groupBy
    let dateTrunc: "day" | "week" | "month";
    switch (groupBy) {
      case "week":
        dateTrunc = "week";
        break;
      case "month":
        dateTrunc = "month";
        break;
      case "day":
      default:
        dateTrunc = "day";
        break;
    }

    // Build DATE_TRUNC SQL with proper interval
    const dateTruncSql = sql<string>`DATE_TRUNC(${sql.literal(dateTrunc)}, paid_date)`;
    
    let query = db
      .selectFrom("invoices")
      .select([
        dateTruncSql.as("period"),
        sql<number>`COALESCE(SUM(total_amount), 0)`.as("revenue"),
      ])
      .where("company_id", "=", companyId)
      .where("status", "=", "paid")
      .where("paid_date", "is not", null)
      .where("paid_date", ">=", new Date(startDate))
      .where("paid_date", "<=", new Date(endDate))
      .where("deleted_at", "is", null)
      .groupBy(dateTruncSql)
      .orderBy("period", "asc");

    if (locationId !== undefined) {
      if (locationId === null) {
        query = query.where("location_id", "is", null);
      } else {
        query = query.where("location_id", "=", locationId);
      }
    }

    const results = await query.execute();

    return results.map((row) => ({
      date: new Date(row.period).toISOString().split("T")[0],
      revenue: Number(row.revenue || 0),
    }));
  }
}

export default new ReportingService();

