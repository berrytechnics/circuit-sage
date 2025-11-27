"use client";

import { ShoppingBagIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

export default function InventoryPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Inventory Management
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Track and manage your parts and supplies
          </p>
        </div>

        {/* Coming Soon Card */}
        <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <ShoppingBagIcon className="w-8 h-8 text-gray-400 dark:text-gray-500 mr-3" />
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100">
                Inventory Management Coming Soon
              </h3>
            </div>
          </div>
          <div className="px-4 py-5 sm:p-6">
            <div className="text-center py-12">
              <ShoppingBagIcon className="mx-auto h-16 w-16 text-gray-400 dark:text-gray-500" />
              <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-gray-100">
                Inventory system is under development
              </h3>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                The inventory management system will allow you to track parts, supplies, and materials.
                You'll be able to manage stock levels, set low stock alerts, and link inventory items to invoices.
              </p>
              <div className="mt-6">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800"
                >
                  Back to Dashboard
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


