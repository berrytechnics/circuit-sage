"use client";

import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen w-full bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 absolute inset-0 z-50 overflow-y-auto">
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto py-4 px-6 flex justify-between items-center">
          <div className="text-xl font-semibold text-blue-700 dark:text-blue-400">
            RepairManager
          </div>
          <nav>
            <ul className="flex space-x-4">
              <li>
                <Link
                  href="/login"
                  className="py-2 px-4 bg-blue-600 dark:bg-blue-700 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 transition"
                >
                  Sign In
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Circuit Sage
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              All-in-one solution for managing your repair shop
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold mb-3 text-blue-700 dark:text-blue-400">
                Ticket Management
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Create, track, and manage repair tickets from start to finish.
                Assign technicians, update statuses, and keep customers
                informed.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold mb-3 text-blue-700 dark:text-blue-400">
                Inventory Control
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Keep track of parts and supplies with real-time inventory
                updates. Receive low-stock alerts and track usage across
                repairs.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold mb-3 text-blue-700 dark:text-blue-400">
                Customer Management
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Build a database of customers with detailed repair histories,
                contact information, and communication logs.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold mb-3 text-blue-700 dark:text-blue-400">
                Invoicing & Payments
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Generate professional invoices directly from repair tickets.
                Track payments and manage your business finances efficiently.
              </p>
            </div>
          </div>

          <div className="text-center">
            <Link
              href="/register"
              className="inline-block py-3 px-8 bg-blue-600 dark:bg-blue-700 text-white font-medium rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 transition"
            >
              Get Started
            </Link>
          </div>
        </div>
      </main>

      <footer className="bg-gray-800 dark:bg-gray-900 text-white py-8 border-t border-gray-700 dark:border-gray-800">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <div className="text-lg font-semibold">RepairManager</div>
              <div className="text-sm text-gray-400">
                &copy; {new Date().getFullYear()} All Rights Reserved
              </div>
            </div>
            <div className="flex space-x-4">
              <Link
                href="/about"
                className="text-gray-400 hover:text-white transition"
              >
                About
              </Link>
              <Link
                href="/contact"
                className="text-gray-400 hover:text-white transition"
              >
                Contact
              </Link>
              <Link
                href="/privacy"
                className="text-gray-400 hover:text-white transition"
              >
                Privacy
              </Link>
              <Link
                href="/terms"
                className="text-gray-400 hover:text-white transition"
              >
                Terms
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
