"use client";

import TransferForm from "@/components/TransferForm";
import { useUser } from "@/lib/UserContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function NewInventoryTransferPage() {
  const router = useRouter();
  const { user, hasPermission, isLoading } = useUser();

  // Check if user has permission to access this page
  useEffect(() => {
    if (!isLoading && (!user || !hasPermission("inventoryTransfers.create"))) {
      router.push("/dashboard");
    }
  }, [user, isLoading, hasPermission, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user || !hasPermission("inventoryTransfers.create")) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          New Inventory Transfer
        </h1>
        <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
          Transfer inventory items between locations
        </p>
      </div>
      <TransferForm />
    </div>
  );
}

