"use client";

import { useEffect, useRef, useState } from "react";
import { useTheme } from "@/lib/ThemeContext";

interface SquarePaymentFormProps {
  applicationId: string;
  locationId: string;
  testMode: boolean;
  amount: number;
  onPaymentSuccess: (sourceId: string) => void;
  onError: (error: string) => void;
  isProcessing?: boolean;
}

export default function SquarePaymentForm({
  applicationId,
  locationId,
  testMode,
  amount,
  onPaymentSuccess,
  onError,
  isProcessing = false,
}: SquarePaymentFormProps) {
  const { theme } = useTheme();
  const isDarkMode = theme === "dark";
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const paymentsRef = useRef<unknown>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const cardInstanceRef = useRef<unknown>(null);

  useEffect(() => {
    let mounted = true;
    let retryTimeoutId: NodeJS.Timeout | null = null;

    const initializeSquare = async (retryCount = 0) => {
      // Validate required props
      if (!applicationId || !locationId) {
        console.error("Square initialization error: Missing applicationId or locationId", {
          applicationId: !!applicationId,
          locationId: !!locationId,
        });
        if (mounted) {
          setIsLoading(false);
          onError("Square payment configuration is incomplete. Please check your Square integration settings.");
        }
        return;
      }

      // Wait for DOM element to be ready (max 10 retries = 1 second)
      if (!cardRef.current) {
        if (retryCount < 10) {
          console.log(`Card ref not ready, retrying... (${retryCount + 1}/10)`);
          retryTimeoutId = setTimeout(() => {
            if (mounted) {
              initializeSquare(retryCount + 1);
            }
          }, 100);
          return;
        } else {
          console.error("Card ref not ready after 10 retries");
          if (mounted) {
            setIsLoading(false);
            onError("Failed to initialize payment form. Please refresh the page.");
          }
          return;
        }
      }

      try {
        console.log("Initializing Square SDK...", { applicationId, locationId });
        
        // Dynamically import Square Web Payments SDK
        const squareSdk = await import("@square/web-sdk");
        console.log("Square SDK imported successfully", squareSdk);
        
        // The SDK exports a 'payments' function (lowercase)
        const paymentsFunction = squareSdk.payments;
        
        if (!paymentsFunction || typeof paymentsFunction !== 'function') {
          console.error("payments function not found in Square SDK", { squareSdk });
          throw new Error("Square Web Payments SDK is not properly loaded. Please refresh the page.");
        }
        
        // Double-check ref is still available after async import
        if (!cardRef.current || !mounted) {
          console.error("Card ref lost during initialization");
          return;
        }

        // Initialize Square Payments - the function takes (applicationId, locationId) and returns a promise
        const payments = await paymentsFunction(applicationId, locationId);
        
        if (!payments) {
          throw new Error("Failed to initialize Square Payments. Please check your credentials.");
        }
        
        console.log("Square Payments initialized");

        if (!mounted || !cardRef.current) return;

        paymentsRef.current = payments;

        // Create card payment method
        // Square SDK has specific style requirements - use only supported properties
        // Apply dark mode styles when theme is dark
        const card = await payments.card({
          style: {
            input: {
              color: isDarkMode ? "#e5e7eb" : "#333333", // gray-200 for dark, dark gray for light
            },
          },
        });

        console.log("Card payment method created");

        // Final check before attaching
        if (!cardRef.current || !mounted) {
          console.error("Card ref lost before attach");
          return;
        }

        await card.attach(cardRef.current);
        cardInstanceRef.current = card;
        console.log("Card form attached successfully");
        
        if (mounted) {
          setIsLoading(false);
        }
      } catch (err) {
        console.error("Error initializing Square:", err);
        if (mounted) {
          setIsLoading(false);
          const errorMessage = err instanceof Error 
            ? err.message 
            : "Failed to initialize payment form. Please refresh the page.";
          console.error("Square initialization error details:", errorMessage);
          onError(errorMessage);
        }
      }
    };

    // Start initialization immediately - the ref should be ready since we render it
    initializeSquare();

    return () => {
      mounted = false;
      // Clear any pending retry timeouts
      if (retryTimeoutId) {
        clearTimeout(retryTimeoutId);
      }
      // Cleanup Square SDK when component unmounts
      if (paymentsRef.current) {
        paymentsRef.current = null;
      }
      if (cardInstanceRef.current) {
        cardInstanceRef.current = null;
      }
    };
  }, [applicationId, locationId, onError, isDarkMode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!cardInstanceRef.current || isSubmitting || isProcessing) {
      console.error("Cannot submit: card instance not ready or already processing");
      return;
    }

    setIsSubmitting(true);

    try {
      // Tokenize card data using the card instance
      const cardInstance = cardInstanceRef.current as { tokenize: () => Promise<{ status: string; token?: string; errors?: Array<{ detail?: string; code?: string }> }> };
      const tokenResult = await cardInstance.tokenize();
      
      if (tokenResult.status === "OK") {
        // Successfully tokenized - pass the nonce to parent
        onPaymentSuccess(tokenResult.token);
      } else {
        // Handle tokenization errors
        const errorMessage =
          tokenResult.errors?.[0]?.detail ||
          tokenResult.errors?.[0]?.code ||
          "Failed to process card. Please check your card details and try again.";
        onError(errorMessage);
      }
    } catch (err) {
      console.error("Error tokenizing card:", err);
      onError(
        err instanceof Error
          ? err.message
          : "Failed to process payment. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Card Information
        </label>
        {isLoading && (
          <div className="flex items-center justify-center py-8 border border-gray-200 dark:border-gray-700 rounded-md">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Loading payment form...
            </div>
          </div>
        )}
        <div
          id="square-card-container"
          ref={cardRef}
          className={`w-full ${isLoading ? 'hidden' : ''}`}
          style={{ minHeight: isLoading ? 0 : '200px' }}
        />
      </div>

      {testMode && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md p-3">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            <strong>Test Mode:</strong> Use Square test card numbers:
            <br />
            Card: 4111 1111 1111 1111
            <br />
            CVV: 123, Expiry: Any future date
          </p>
        </div>
      )}

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="submit"
          disabled={isSubmitting || isProcessing}
          className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting || isProcessing ? "Processing..." : `Pay $${amount.toFixed(2)}`}
        </button>
      </div>
    </form>
  );
}

