"use client";

import TicketForm from "@/components/TicketForm";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

export default function NewTicketPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <NewTicketClientPage />
    </Suspense>
  );
}

function NewTicketClientPage() {
  const searchParams = useSearchParams();
  const customerId = searchParams.get("customerId") || undefined;

  return <TicketForm customerId={customerId} />;
}
