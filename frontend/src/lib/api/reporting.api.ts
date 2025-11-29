import api, { ApiResponse } from ".";

// Reporting interfaces
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

// Reporting API functions
export const getDashboardStats = async (
  locationId?: string | null,
  startDate?: string,
  endDate?: string
): Promise<ApiResponse<DashboardStats>> => {
  const params = new URLSearchParams();
  if (locationId !== undefined && locationId !== null) {
    params.append("locationId", locationId);
  }
  if (startDate) {
    params.append("startDate", startDate);
  }
  if (endDate) {
    params.append("endDate", endDate);
  }

  const url = params.toString()
    ? `/reporting/dashboard-stats?${params.toString()}`
    : "/reporting/dashboard-stats";

  const response = await api.get<ApiResponse<DashboardStats>>(url);

  if (response.data.success) {
    return response.data;
  }

  throw new Error(
    response.data.error?.message || "Failed to fetch dashboard stats"
  );
};

export const getRevenueOverTime = async (
  startDate: string,
  endDate: string,
  locationId?: string | null,
  groupBy: "day" | "week" | "month" = "day"
): Promise<ApiResponse<RevenueDataPoint[]>> => {
  const params = new URLSearchParams();
  params.append("startDate", startDate);
  params.append("endDate", endDate);
  params.append("groupBy", groupBy);
  if (locationId !== undefined && locationId !== null) {
    params.append("locationId", locationId);
  }

  const response = await api.get<ApiResponse<RevenueDataPoint[]>>(
    `/reporting/revenue-over-time?${params.toString()}`
  );

  if (response.data.success) {
    return response.data;
  }

  throw new Error(
    response.data.error?.message || "Failed to fetch revenue data"
  );
};

