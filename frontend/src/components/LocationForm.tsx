"use client";

import {
  CreateLocationData,
  UpdateLocationData,
  createLocation,
  getLocationById,
  updateLocation,
} from "@/lib/api/location.api";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

interface LocationFormProps {
  locationId?: string; // If provided, form will operate in update mode
}

export default function LocationForm({ locationId }: LocationFormProps) {
  const router = useRouter();
  const isUpdateMode = Boolean(locationId);

  const [formData, setFormData] = useState<
    CreateLocationData & { id?: string }
  >({
    name: "",
    address: "",
    phone: "",
    email: "",
    isActive: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // Fetch location data if in update mode
  useEffect(() => {
    if (isUpdateMode && locationId) {
      const fetchLocation = async () => {
        setIsLoading(true);
        try {
          const response = await getLocationById(locationId);
          if (response.data) {
            setFormData({
              name: response.data.name,
              address: response.data.address || "",
              phone: response.data.phone || "",
              email: response.data.email || "",
              isActive: response.data.is_active,
            });
          }
        } catch (err) {
          console.error("Error fetching location:", err);
          setSubmitError(
            err instanceof Error
              ? err.message
              : "Failed to load location data. Please try again."
          );
        } finally {
          setIsLoading(false);
        }
      };

      fetchLocation();
    }
  }, [locationId, isUpdateMode]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Clear the error for this field when it's changed
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Required fields validation
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    // Optional field validations (only if provided)
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (formData.phone && !/^\+?[\d\s\-()]{7,}$/.test(formData.phone)) {
      newErrors.phone = "Please enter a valid phone number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      // Create clean location data, trimming all string fields
      const cleanFormData = Object.entries(formData).reduce(
        (acc, [key, value]) => ({
          ...acc,
          [key]:
            typeof value === "string"
              ? value.trim() || undefined
              : value !== undefined
              ? value
              : undefined,
        }),
        {} as CreateLocationData | UpdateLocationData
      );

      let response;

      if (isUpdateMode && locationId) {
        // Update existing location
        response = await updateLocation(locationId, cleanFormData as UpdateLocationData);
      } else {
        // Create new location
        response = await createLocation(cleanFormData as CreateLocationData);
      }

      if (response.data) {
        router.push(`/locations/${response.data.id}`);
      }
    } catch (err) {
      console.error("Error saving location:", err);
      setSubmitError(
        err instanceof Error
          ? err.message
          : "Failed to save location. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-gray-600 dark:text-gray-400">Loading location data...</div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {submitError && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded">
          {submitError}
        </div>
      )}

      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-500 ${
            errors.name
              ? "border-red-500 dark:border-red-600"
              : "border-gray-300 dark:border-gray-600"
          }`}
          placeholder="Main Location"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="address"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          Address
        </label>
        <textarea
          id="address"
          name="address"
          value={formData.address}
          onChange={handleChange}
          rows={3}
          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-500 ${
            errors.address
              ? "border-red-500 dark:border-red-600"
              : "border-gray-300 dark:border-gray-600"
          }`}
          placeholder="123 Main Street, City, State, ZIP"
        />
        {errors.address && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.address}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="phone"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Phone
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-500 ${
              errors.phone
                ? "border-red-500 dark:border-red-600"
                : "border-gray-300 dark:border-gray-600"
            }`}
            placeholder="(555) 123-4567"
          />
          {errors.phone && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.phone}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-500 ${
              errors.email
                ? "border-red-500 dark:border-red-600"
                : "border-gray-300 dark:border-gray-600"
            }`}
            placeholder="location@example.com"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email}</p>
          )}
        </div>
      </div>

      <div>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            name="isActive"
            checked={formData.isActive}
            onChange={handleChange}
            className="w-4 h-4 text-blue-600 border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded focus:ring-blue-500"
          />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Active</span>
        </label>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Inactive locations will not be available for selection
        </p>
      </div>

      <div className="flex justify-end space-x-4 pt-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting
            ? "Saving..."
            : isUpdateMode
            ? "Update Location"
            : "Create Location"}
        </button>
      </div>
    </form>
  );
}

