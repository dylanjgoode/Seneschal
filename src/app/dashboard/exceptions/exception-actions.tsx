"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function ExceptionActions({
  exceptionId,
  operatorId,
}: {
  exceptionId: string;
  operatorId: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState<"approved" | "rejected" | null>(null);

  async function resolve(resolution: "approved" | "rejected") {
    setLoading(resolution);
    try {
      const res = await fetch("/api/exceptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ exceptionId, resolution, operatorId }),
      });
      if (!res.ok) throw new Error("Failed to resolve");
      router.refresh();
    } catch {
      setLoading(null);
    }
  }

  return (
    <div className="flex gap-2 shrink-0">
      <Button
        size="sm"
        onClick={() => resolve("approved")}
        disabled={loading !== null}
      >
        {loading === "approved" ? "Approving..." : "Approve"}
      </Button>
      <Button
        size="sm"
        variant="outline"
        onClick={() => resolve("rejected")}
        disabled={loading !== null}
      >
        {loading === "rejected" ? "Rejecting..." : "Reject"}
      </Button>
    </div>
  );
}
